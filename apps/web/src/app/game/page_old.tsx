/* import Nakama from '@/services/nakama'; */
import { cookies } from 'next/headers';
import { getOrCreateDeviceId, authenticateWithNakama } from '@/services/auth';
import GuessTheFakePage from './guess-the-fake';

export default async function GamePage() {
  /* const nakamaRef = useRef<Nakama | undefined>(undefined); */
  /* const nakama = await new Nakama();
  await nakama.authenticateDevice(); */

  /* const res = await fetch('http://localhost:3000/api/auth/', {
    cache: 'no-store',
  });
  const data = await res.json(); */

  const cookieStore = cookies();
  const deviceId = getOrCreateDeviceId({
    get: (name: string) => cookieStore.get(name)?.value,
  });

  let userId: string | undefined;
  try {
    const session = await authenticateWithNakama(deviceId);
    userId = session.user_id;
  } catch (error) {
    console.error('Fehler bei der Authentifizierung:', error);
  }

  return (
    <>
      <div>
        <span>
          {/* JSON.stringify(data) */ userId || 'Kein User vorhanden.'}
        </span>
      </div>
      <GuessTheFakePage />
    </>
  );
}
