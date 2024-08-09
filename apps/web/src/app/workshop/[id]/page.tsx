'use client';

import { useState, useEffect, useRef } from 'react';

import Nakama from '@/services/nakama';
import { MatchData } from '@heroiclabs/nakama-js';
import { navigate } from '@/services/redirect';

import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import PlayerList from '@/components/ui/PlayerList';
import Headline from '@/components/ui/Headline';
import ImageQuizNode from '@/components/ui/imageQuizNode';
import DefaultQuiz from '@/components/ui/DefaultQuiz';
import Countdown from '@/components/ui/Countdown';
import Scoreboard from '@/components/ui/Scoreboard';
import { render } from 'react-dom';

export default function Workshop(props: any) {
  const [isHost, setIsHost] = useState<boolean>(false);

  const [isPresenter, setIsPresenter] = useState<boolean>(false);

  enum NodeType {
    Lobby = 0,
    Scoreboard = 1,
    Countdown = 2,
    Headline = 3,
    DefaultQuiz = 4,
    ImgQuiz = 5,
  }

  const [currentNode, setCurrentNode] = useState<number>(-1);

  //------------------------------------------------------------
  // Base Logic - Should be used as Base for Multiplayer

  const nakamaRef = useRef<Nakama | undefined>(undefined);

  const [playerList, setPlayerList] = useState<Array<string>>([]);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  interface Match {
    joinCode: string;
    id: string;
  }

  const match = useRef<Match>({
    joinCode: props.params.id,
    id: '',
  });

  useEffect(() => {
    const initNakama = async () => {
      nakamaRef.current = new Nakama();
      await nakamaRef.current.authenticateDevice();
      initSocket();
      setTimeout(() => {
        joinMatch();
      }, 500);
    };
    initNakama();

    async function joinMatch() {
      if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

      let tempMatchID = '';

      const timeout = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      for (let i = 0; i <= 3; i++) {
        // Do some stuff
        console.log(`Login try: ${i + 1}`);
        tempMatchID = await nakamaRef.current.getMatchID(
          match.current.joinCode
        );

        if (tempMatchID != '') {
          i = 1000;
        }
        // Wait for timeout 1000 ms
        await timeout(500);
      }

      setCurrentNode(NodeType.Lobby);

      console.log(`MatchId: ${tempMatchID}`);

      if (tempMatchID == undefined) {
        nakamaRef.current.socket.disconnect(true);
        navigate('/');
      }

      match.current.id = tempMatchID;

      //console.log(`SESSION`, nakamaRef.current.socket, tempMatchID);

      //console.log(await nakamaRef.current.socket.joinMatch(tempMatchID));

      try {
        await nakamaRef.current.socket.joinMatch(tempMatchID);
      } catch (err) {
        nakamaRef.current.socket.disconnect(true);
        navigate('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function leaveMatch() {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    try {
      await nakamaRef.current.socket.leaveMatch(match.current.id);
    } finally {
      nakamaRef.current.socket.disconnect(true);
      navigate('/');
    }
  }

  // End Base Logic
  //------------------------------------------------------------

  const [nodeData, setNodeDate] = useState<Object>({});

  const [index, setIndex] = useState<number>(0);

  const [answer, setAnswer] = useState<Array<number>>([]);

  const myAnswer = useRef<Array<number>>([]);

  // eslint-disable-next-line no-unused-vars
  enum OpCode {
    START = 0,

    BACK = 1,

    UPDATE = 2,

    DONE = 3,

    ANSWER = 4,

    REJECTED = 5,

    CONFIRMED = 6,

    PLAYERLIST = 7,

    END = 8,

    TIMER = 9,

    LEAVE = 10,
  }

  function initSocket() {
    if (
      !nakamaRef.current ||
      !nakamaRef.current.socket ||
      !nakamaRef.current.session
    )
      return;

    let socket = nakamaRef.current.socket;

    socket.onmatchdata = (matchState: MatchData) => {
      if (!nakamaRef.current) return;
      let json_string = new TextDecoder().decode(matchState.data);
      let json = json_string ? JSON.parse(json_string) : '';

      let presences: Object;
      let listofUsernames: Array<string>;

      if (typeof json === 'object' && json !== null) {
        switch (matchState.op_code) {
          case OpCode.PLAYERLIST:
            console.log('PLAYERLIST');
            json = JSON.parse(json_string);

            presences = json.presences as Object;

            setIsHost(json.host == nakamaRef.current.session?.user_id);

            if (
              json.host == nakamaRef.current.session?.user_id &&
              json.isPresenter
            ) {
              setIsPresenter(true);
            } else {
              setIsPresenter(false);
            }

            /*

            listofUsernames = [];

            for (const [, value] of Object.entries(presences)) {
              if (value !== null && value.userId != json.host) {
                listofUsernames.push(value.username);
              }
            }

            listofUsernames.sort();*/

            console.log('PlayerList: ' + json.playerList);

            setPlayerList(json.playerList);

            // Handle START message
            break;

          case OpCode.UPDATE:
            console.log('UPDATE');
            json = JSON.parse(json_string);

            setTimeLeft(null);

            setAnswer([]);

            myAnswer.current = [];

            setIndex(json.currentNode);

            setCurrentNode(json.nodeType);

            setNodeDate(json.nodeData);

            console.log(json.nodeData);
            // Handle MOVE message
            break;

          case OpCode.TIMER:
            console.log('TIMER');
            json = JSON.parse(json_string);

            setTimeLeft(json.secondsLeft);
            break;

          case OpCode.ANSWER:
            console.log('ANSWER');

            json = JSON.parse(json_string);
            setAnswer(json.answer);
            setTimeLeft(null);
            // Handle REJECTED message
            break;

          case OpCode.DONE:
            if (myAnswer.current.length > 0) sendAnswer(myAnswer.current);

            console.log('DONE');
            // Handle REJECTED message
            break;

          case OpCode.LEAVE:
            console.log('LEAVE');
            leaveMatch();

            break;

          case OpCode.END:
            console.log('END');
            setCurrentNode(NodeType.Lobby);
            break;
          default:
            // Handle unknown message
            break;
        }
      }
    };
  }

  async function startAndNext() {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    let data = {};

    await nakamaRef.current.socket.sendMatchState(
      match.current.id,
      OpCode.START,
      JSON.stringify(data)
    );
  }

  async function back() {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    let data = {};

    await nakamaRef.current.socket.sendMatchState(
      match.current.id,
      OpCode.BACK,
      JSON.stringify(data)
    );
  }

  async function sendAnswer(answer: Array<number>) {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    let data = { answer: answer };

    await nakamaRef.current.socket.sendMatchState(
      match.current.id,
      OpCode.ANSWER,
      JSON.stringify(data)
    );
  }

  async function sendDone() {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    let data = {};

    await nakamaRef.current.socket.sendMatchState(
      match.current.id,
      OpCode.DONE,
      JSON.stringify(data)
    );
  }

  function renderComponent(nodeType: number) {
    switch (nodeType) {
      case NodeType.Lobby:
        return <PlayerList key={index} isHost={isHost} users={playerList} />;

      case NodeType.Scoreboard:
        return <Scoreboard key={index} scoreboard={nodeData} />;

      case NodeType.Countdown:
        return <Countdown key={index} time={timeLeft} />;

      case NodeType.Headline:
        let tempHeadline = nodeData as { text: string };
        return (
          <Headline key={index} timeLeft={timeLeft} text={tempHeadline.text} />
        );

      case NodeType.ImgQuiz:
        let tempImgQuiz = nodeData as { text: string; images: Array<string> };
        return (
          <ImageQuizNode
            key={index}
            setAnswer={(num: Array<number>) => {
              myAnswer.current = num;
            }}
            sendDone={sendDone}
            text={tempImgQuiz.text}
            images={tempImgQuiz.images}
            answer={answer}
            timeLeft={timeLeft}
            onlyShow={isPresenter}
          />
        );

      case NodeType.DefaultQuiz:
        let tempDefaultQuiz = nodeData as {
          text: string;
          options: Array<string>;
        };

        return (
          <DefaultQuiz
            key={index}
            setAnswer={(num: Array<number>) => {
              myAnswer.current = num;
            }}
            sendDone={sendDone}
            text={tempDefaultQuiz.text}
            answers={tempDefaultQuiz.options}
            answer={answer}
            timeLeft={timeLeft}
            onlyShow={isPresenter}
          />
        );
    }

    return <Headline key={index} timeLeft={timeLeft} text="Loading..." />;
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        leaveMatch={leaveMatch}
        joinCode={match.current.joinCode}
        isHost={isHost}
      />
      <div className="w-full h-full max-h-full max-w-full overflow-hidden flex flex-col items-center justify-center p-10 max-md:p-5">
        {renderComponent(currentNode)}
      </div>
      <Footer
        forwardButtonText={currentNode < 1 ? 'Start' : 'Weiter'}
        nextButton={startAndNext}
        backButton={back}
        isHost={isHost}
      />
    </div>
  );
}
