'use client';

import { Button } from '@/components/ui/OldButton';
import Link from 'next/link';

import { useState, useEffect, useRef } from 'react';

import Nakama from '@/services/nakama';
import { MatchData } from '@heroiclabs/nakama-js';
import { navigate } from '@/services/redirect';

import ImageQuiz from '@/components/ui/imageQuiz';

export default function GuessTheFake(props: any) {
  //------------------------------------------------------------
  // Base Logic - Should be used as Base for Multiplayer

  const nakamaRef = useRef<Nakama | undefined>(undefined);

  const [playerList, setPlayerList] = useState<string>('');

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

      console.log(`MatchId: ${tempMatchID}`);

      if (tempMatchID == undefined) {
        navigate('/');
      }

      match.current.id = tempMatchID;

      //console.log(`SESSION`, nakamaRef.current.socket, tempMatchID);

      //console.log(await nakamaRef.current.socket.joinMatch(tempMatchID));

      try {
        await nakamaRef.current.socket.joinMatch(tempMatchID);
      } catch (err) {
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
      navigate('/');
    }
  }

  // End Base Logic
  //------------------------------------------------------------

  const [images, setImages] = useState<Array<string>>([]);

  const [timeLeft, setTimeLeft] = useState<number | null>(0);
  const [timerText, setTimerText] = useState<string>('');

  const [scoreboard, setScoreboard] = useState<{ [key: string]: number }>({});

  const [isHost, setIsHost] = useState<boolean>(false);
  const [isPresenter, setIsPresenter] = useState<boolean>(false);

  const [playing, setPlaying] = useState<boolean>(false);

  const [answer, setAnswer] = useState<number>(-1);

  const [answered, setAnswered] = useState<boolean>(false);

  const [myAnswer, setMyAnswer] = useState<number>(-1);

  // Keeps Up-To-Date Values for use in Event Listener
  // UseState Value is Frozen on initialized Value in initSocket()
  const upToDateAnswer = useRef<number>(-1);
  const showingAnswer = useRef<number>(-1);
  const isAnswered = useRef<boolean>(false);

  useEffect(() => {
    upToDateAnswer.current = myAnswer;
    showingAnswer.current = answer;
    isAnswered.current = answered;
  }, [myAnswer, answer, answered]);

  //OpCodes
  // eslint-disable-next-line no-unused-vars
  enum OpCode {
    // eslint-disable-next-line no-unused-vars
    START = 1,
    // eslint-disable-next-line no-unused-vars
    UPDATE = 2,
    // eslint-disable-next-line no-unused-vars
    DONE = 3,
    // eslint-disable-next-line no-unused-vars
    ANSWER = 4,
    // eslint-disable-next-line no-unused-vars
    REJECTED = 5,
    // eslint-disable-next-line no-unused-vars
    CONFIRMED = 6,
    // eslint-disable-next-line no-unused-vars
    PLAYERLIST = 7,
    // eslint-disable-next-line no-unused-vars
    END = 8,
    // eslint-disable-next-line no-unused-vars
    TIMER = 9,
    // eslint-disable-next-line no-unused-vars
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

      interface guessTheFake_PlayerListMessage {
        presences: { [userId: string]: null };
        host: string;
        isPresenter: boolean;
      }

      interface guessTheFake_ImgMessage {
        images: Array<string>;
      }

      interface guessTheFake_AnswerMessage {
        answer: number;
      }

      interface guessTheFake_TimerMessage {
        secondsLeft: number | null;

        timerName: string;
      }

      interface guessTheFake_ResultMessage {
        results: { [key: string]: number };
      }

      interface guessTheFake_StateMessage {
        state: boolean;
      }

      const json_string = new TextDecoder().decode(matchState.data);
      let json;

      let presences: Object;
      let listofUsernames: Array<string>;
      let listofUsernamesHTML: string;

      if (json_string !== null) {
        switch (matchState.op_code) {
          case OpCode.PLAYERLIST:
            json = JSON.parse(json_string) as guessTheFake_PlayerListMessage;

            presences = json.presences as Object;

            setIsHost(json.host == nakamaRef.current.player?.id);

            if (json.host == nakamaRef.current.player?.id && json.isPresenter) {
              setIsPresenter(true);
            } else {
              setIsPresenter(false);
            }

            listofUsernames = [];

            for (const [, value] of Object.entries(presences)) {
              if (value !== null) {
                listofUsernames.push(value.username);
              }
            }

            listofUsernames.sort();

            listofUsernamesHTML = '';

            listofUsernames.forEach((username) => {
              listofUsernamesHTML =
                listofUsernamesHTML + '<p>' + username + '</p>';
            });

            setPlayerList(listofUsernamesHTML);

            // Handle START message
            break;
          case OpCode.UPDATE:
            json = JSON.parse(json_string) as guessTheFake_ImgMessage;

            setPlaying(true);
            setImages(json.images);
            setAnswer(-1);
            setAnswered(false);

            console.log('Update');

            // Handle MOVE message
            break;
          case OpCode.ANSWER:
            json = JSON.parse(json_string) as guessTheFake_AnswerMessage;

            setAnswer(json.answer);

            console.log('ANSWER');

            break;

          case OpCode.CONFIRMED:
            json = JSON.parse(json_string) as guessTheFake_StateMessage;

            if (json.state) {
              setAnswered(true);
            }

            console.log('CONFIRMED');
            break;

          case OpCode.DONE:
            sendAnswer();

            break;

          case OpCode.TIMER:
            json = JSON.parse(json_string) as guessTheFake_TimerMessage;

            setTimeLeft(json.secondsLeft);
            setTimerText(json.timerName);
            break;

          case OpCode.END:
            json = JSON.parse(json_string) as guessTheFake_ResultMessage;

            setPlaying(false);

            setScoreboard(json.results);

            console.log('End');
            console.log(json);

            break;

          case OpCode.LEAVE:
            leaveMatch();

            break;

          default:
            break;
        }
      }
    };
  }

  async function startGame() {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    let data = {};

    await nakamaRef.current.socket.sendMatchState(
      match.current.id,
      OpCode.START,
      JSON.stringify(data)
    );
  }

  async function submitAnswer() {
    if (!isAnswered.current && upToDateAnswer.current > -1) {
      sendAnswer();
    }
  }

  async function sendAnswer() {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    if (isAnswered.current) {
      return;
    }

    let data = { answer: upToDateAnswer.current };

    await nakamaRef.current.socket.sendMatchState(
      match.current.id,
      OpCode.ANSWER,
      JSON.stringify(data)
    );
  }

  const renderScoreboard = (user: { [key: string]: number }) => {
    let content = [];
    for (let key in user) {
      content.push(
        <p key={key}>
          <b>{key}:</b> {user[key]}
        </p>
      );
    }
    return content;
  };

  function size(obj: object) {
    let size = 0;
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) size++;
    }
    return size;
  }

  return (
    <div className="flex flex-col justify-center max-w-screen-md m-auto text-center">
      <Button
        onClick={leaveMatch}
        size="lg"
        variant="danger"
        className="m-auto mt-5"
        asChild
      >
        <Link href="">Leave Game!</Link>
      </Button>

      <hr className="my-5"></hr>

      <div className="flex flex-row justify-evenly">
        <div>
          <p>
            <b>Join Code</b>
          </p>
          <p>
            <b>{match.current.id != '' && match.current.joinCode}</b>
          </p>
        </div>
        <div>
          <p>
            <b>Players</b>
          </p>
          <div dangerouslySetInnerHTML={{ __html: playerList }}></div>
        </div>
      </div>

      <hr className="my-5"></hr>

      <p>
        <b>
          {playing && timerText} {playing && timeLeft != null && timeLeft}
          {!playing && 'Warte auf Spieler!'}
        </b>
      </p>

      <hr className="my-5"></hr>

      <b>{!playing && size(scoreboard) > 0 && 'Scoreboard'}</b>
      {!playing && renderScoreboard(scoreboard)}

      {playing && (
        <>
          <ImageQuiz
            sendAnswer={setMyAnswer}
            images={images}
            answer={answer}
            onlyShow={!isPresenter}
            answered={answered}
          />
          {!isPresenter && (
            <Button
              onClick={submitAnswer}
              size="lg"
              variant={myAnswer > -1 && !answered ? 'secondary' : 'default'}
              className="m-auto mt-5"
              asChild
            >
              <Link href="">Send Answer!</Link>
            </Button>
          )}
        </>
      )}

      {((isHost && !playing) || (isPresenter && playing)) && (
        <Button
          onClick={startGame}
          size="lg"
          variant={answered || !playing ? 'primary' : 'default'}
          className="m-auto mt-5"
          asChild
        >
          <Link href="">{!playing ? 'Start Game!' : 'Weiter'}</Link>
        </Button>
      )}
    </div>
  );
}
