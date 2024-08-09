'use client';

import { useState, useEffect, useRef } from 'react';

import Nakama from '@/services/nakama';

import { navigate } from '@/services/redirect';

import Header from '@/components/ui/Header';

import Footer from '@/components/ui/Footer';

import { Button } from '@/components/ui/button';

export default function Host() {
  const [matchJoinCode, setMatchJoinCode] = useState<string>('');

  const nakamaRef = useRef<Nakama | undefined>(undefined);

  useEffect(() => {
    const initNakama = async () => {
      nakamaRef.current = new Nakama();
      await nakamaRef.current.authenticateDevice();
    };
    initNakama();
  }, []);

  async function createMatch(matchType: string, workshopKey: string) {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    let newMatch = await nakamaRef.current.startMatch(matchType, workshopKey);

    nakamaRef.current.socket.disconnect(true);
    navigate(newMatch);
  }

  function renderComponent() {
    return (
      <div className="flex flex-col gap-6 justify-center items-center">
        <Button
          onClick={() => createMatch('workshop', 'deepfake_detective_quiz')}
          className="m-auto"
        >
          Quiz Game!
        </Button>
        <Button
          onClick={() =>
            createMatch('workshop', 'deepfake_detective_guessTheFake')
          }
          className="m-auto"
        >
          Guess The Fake Game!
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header></Header>
      <div className="w-full h-full max-h-full max-w-full overflow-hidden flex flex-col items-center justify-center p-10 max-md:p-5">
        {renderComponent()}
      </div>
      <Footer />
    </div>
  );
}
