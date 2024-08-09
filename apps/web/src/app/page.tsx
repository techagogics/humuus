'use client';

import { useState, useEffect, useRef } from 'react';

import Nakama from '@/services/nakama';

import { navigate } from '@/services/redirect';

import Header from '@/components/ui/Header';

import Footer from '@/components/ui/Footer';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { Button } from '@/components/ui/button';

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
      nakamaRef.current.socket.disconnect(true);
      navigate(tempMatch);
    }
  }

  async function createMatch(matchType: string, workshopKey: string) {
    if (!nakamaRef.current?.socket || !nakamaRef.current?.session) return;

    let newMatch = await nakamaRef.current.startMatch(matchType, workshopKey);

    nakamaRef.current.socket.disconnect(true);
    navigate(newMatch);
  }

  function renderComponent() {
    return (
      <div className="flex flex-col gap-6 justify-center items-center">
        <InputOTP
          maxLength={4}
          value={matchJoinCode}
          onChange={(value) => setMatchJoinCode(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>

        <Button onClick={joinMatch} className="m-auto">
          Join the Game!
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
