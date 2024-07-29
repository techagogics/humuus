'use client';
import { useEffect, useRef, useState } from 'react';
import Nakama from '@/services/nakama';
import GameLobby from './GameLobby';
import Player from '@/models/player';

export default function GamePage() {
  const [player, setPlayer] = useState<Player>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [debugMessage, setDebugMessage] = useState<string>('Welcome!');
  const nakamaRef = useRef<Nakama | undefined>(undefined);

  function initSocket() {
    if (
      !nakamaRef.current ||
      !nakamaRef.current.socket ||
      !nakamaRef.current.session
    )
      return;

    if (nakamaRef.current.player) {
      setPlayer(nakamaRef.current.player);
      setPlayers([nakamaRef.current.player]);
    }
    /* let socket = nakamaRef.current.socket; */

    // ....
  }

  // Init Nakama when page mounted
  useEffect(() => {
    const initNakama = async () => {
      nakamaRef.current = new Nakama();
      await nakamaRef.current.authenticateDevice();
      initSocket();
      findMatch();
    };
    initNakama();
  }, []);

  async function findMatch() {
    console.log('findMatch');
    if (!nakamaRef.current) return;
    await nakamaRef.current.findMatch();
    if (nakamaRef.current.matchId === null)
      setDebugMessage('Server error: Failed to find match!');
    console.log('find match, matchId: ', nakamaRef.current.matchId!);
    setDebugMessage('Wait for others to join');
  }

  return (
    <>
      <div className="text-lg">{debugMessage}</div>
      {player == undefined && <div>Loading ...</div>}
      {player?.name && <GameLobby players={players}></GameLobby>}
    </>
  );
}
