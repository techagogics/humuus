import { v4 as uuidv4 } from 'uuid';
import { Client } from '@heroiclabs/nakama-js';
import { uniqueNamesGenerator, starWars } from 'unique-names-generator';

const DEVICE_ID_COOKIE = 'device_id';

export const getNakamaClient = () => {
  return new Client(
    'defaultkey',
    process.env.NAKAMA_SERVER_HOST,
    process.env.NAKAMA_SERVER_PORT,
    process.env.NAKAMA_USE_SSL === 'true',
    undefined,
    true
  );
};

export const getOrCreateDeviceId = (cookies: {
  get: (name: string) => string | undefined;
}): string => {
  let deviceId = cookies.get(DEVICE_ID_COOKIE);
  console.log(deviceId);
  if (!deviceId) {
    const randomName = uniqueNamesGenerator({
      dictionaries: [/* adjectives, animals */ starWars],
      separator: ' ',
      style: 'capital',
    });

    deviceId = randomName /* uuidv4() */;
  }
  return deviceId;
};

export const authenticateWithNakama = async (deviceId: string) => {
  const client = getNakamaClient();
  try {
    const session = await client.authenticateDevice(deviceId, true, 'testuser');
    return session;
  } catch (error) {
    console.error('Fehler bei der Authentifizierung:', error);
    throw error;
  }
};
