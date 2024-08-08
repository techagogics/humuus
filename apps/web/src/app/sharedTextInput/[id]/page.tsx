'use client';

import { Button } from '@/components/ui/OldButton';
import Link from 'next/link';

import { useState, useEffect, useRef } from 'react';

import Nakama from '@/services/nakama';
import { MatchData } from '@heroiclabs/nakama-js';
import { navigate } from '@/services/redirect';

export default function SharedTextInput(props: any) {
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

  const [value, setValue] = useState<
    string | number | readonly string[] | undefined
  >('');

  // eslint-disable-next-line no-unused-vars
  enum OpCode {
    // eslint-disable-next-line no-unused-vars
    START = 1,
    // eslint-disable-next-line no-unused-vars
    UPDATE = 2,
    // eslint-disable-next-line no-unused-vars
    DONE = 3,
    // eslint-disable-next-line no-unused-vars
    MOVE = 4,
    // eslint-disable-next-line no-unused-vars
    REJECTED = 5,
  }

  function initSocket() {
    if (
      !nakamaRef.current ||
      !nakamaRef.current.socket ||
      !nakamaRef.current.session
    )
      return;

    let socket = nakamaRef.current.socket;

    interface UpdateMessage {
      // The presences currently playing
      presences: { [userId: string]: null };

      value: string;
      // The deadline time by which the game ends
      deadline: number;
    }

    socket.onmatchdata = (matchState: MatchData) => {
      if (!nakamaRef.current) return;
      const json_string = new TextDecoder().decode(matchState.data);
      const json = json_string
        ? (JSON.parse(json_string) as UpdateMessage)
        : '';
      console.log('op_code: ', matchState.op_code);

      let presences: Object;
      let listofUsernames: Array<string>;
      let listofUsernamesHTML: string;

      if (typeof json === 'object' && json !== null) {
        switch (matchState.op_code) {
          case OpCode.START:
            setValue(json.value);

            presences = json.presences as Object;

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
            setValue(json.value);

            presences = json.presences as Object;

            listofUsernames = [];

            for (const [key, value] of Object.entries(presences)) {
              key;
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

            // Handle MOVE message
            break;
          case OpCode.REJECTED:
            // Handle REJECTED message
            break;
          default:
            // Handle unknown message
            break;
        }
      }
    };
  }

  async function changeValue(
    newValue: string | number | readonly string[] | undefined
  ) {
    if (!nakamaRef.current?.socket) return;
    const data = { value: newValue };
    await nakamaRef.current.socket.sendMatchState(
      match.current.id,
      OpCode.MOVE,
      JSON.stringify(data)
    );
    setValue(newValue);
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
      <input
        value={value}
        placeholder="Test Message"
        onChange={(evt) => changeValue(evt.target.value)}
        className="text-center"
      />
      <p>
        <b>Server Output:</b>
      </p>
      <p>{value}</p>
    </div>
  );
}
