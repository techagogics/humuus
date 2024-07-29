/* import type { NextApiRequest, NextApiResponse } from 'next'; */
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@heroiclabs/nakama-js';
import { getCookie, setCookie } from 'cookies-next';
import { NextResponse } from 'next/server';

const UUID_COOKIE = 'hm_uuid';
const testname = 'testuser';

export async function GET(/* req: NextApiRequest */) {
  const client = new Client(
    'defaultkey',
    process.env.NAKAMA_SERVER_HOST,
    process.env.NAKAMA_SERVER_PORT,
    process.env.NAKAMA_USE_SSL === 'true'
  );

  // Versuche, die bestehende Device ID aus dem Cookie zu lesen
  let uuid = getCookie(UUID_COOKIE /* , { req } */) as string;

  if (!uuid) {
    // Wenn keine Device ID existiert, generiere eine neue
    uuid = testname /* uuidv4() */;
    // Setze das Cookie als HTTP-only
    setCookie(UUID_COOKIE, uuid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'strict',
      path: '/',
    });
  }

  try {
    // Authentifiziere mit Nakama
    const session = await client.authenticateDevice(uuid, true, testname);

    // Setze das Nakama-Token als HTTP-only Cookie
    /* setCookie('nakamaToken', session.token, {
      req,
      res,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    }); */

    return NextResponse.json(
      { success: true, session: session },
      { status: 200 }
    );
  } catch (error) {
    console.error('Authentifizierung fehlgeschlagen', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Authentifizierung fehlgeschlagen',
      },
      { status: 401 }
    );
  }
}
