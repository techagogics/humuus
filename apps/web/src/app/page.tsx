'use client';

import { Button } from '@/components/ui/OldButton';
import Link from 'next/link';

import { useState, useEffect, useRef } from 'react';

import Nakama from '@/services/nakama';

import { navigate } from '@/services/redirect';

import { GameType } from '@/lib/matches';

export default function Home() {
  const [matchJoinCode, setMatchJoinCode] = useState<string>('');

  const nakamaRef = useRef<Nakama | undefined>(undefined);

  useEffect(() => {
    const initNakama = async () => {
      nakamaRef.current = new Nakama();
      await nakamaRef.current.authenticateDevice();
    };
    initNakama();
  }, []);

  async function joinMatch() {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    if (matchJoinCode == '') {
      return;
    }

    let tempMatch = await nakamaRef.current.getMatchURL(matchJoinCode);

    if (tempMatch) {
      navigate(tempMatch);
    }
  }

  async function createMatch(matchType: string) {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    let newMatch = await nakamaRef.current.startMatch(matchType);

    navigate(newMatch);
  }

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="flex flex-col gap-20 items-center">
        <div className="flex flex-col gap-5 w-25 font-bold">
          <input
            value={matchJoinCode}
            placeholder="Match ID"
            onChange={(evt) => setMatchJoinCode(evt.target.value)}
            className="text-center text-2xl"
          />
          <Button
            onClick={joinMatch}
            size="lg"
            variant="primary"
            className="m-auto"
            asChild
          >
            <Link href="">Join the Game!</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-10">
          <Button
            onClick={() => createMatch(GameType.sharedTextInput)}
            size="lg"
            variant="danger"
            className="m-auto"
            asChild
          >
            <Link href="">Test Game!</Link>
          </Button>
          <Button
            onClick={() => createMatch(GameType.defaultQuiz)}
            size="lg"
            variant="danger"
            className="m-auto"
            asChild
          >
            <Link href="">Quiz Game!</Link>
          </Button>
          <Button
            onClick={() => createMatch(GameType.guessTheFake)}
            size="lg"
            variant="danger"
            className="m-auto"
            asChild
          >
            <Link href="">Guess The Fake Game!</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
