import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { v4 as uuidv4 } from 'uuid';
import * as LocalStorage from './localstorage';
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  colors,
} from 'unique-names-generator';

// LocalStorage keys
const DEVICE_ID_KEY = 'deviceId';
const SESSION_TOKEN = 'sessionToken';
const SESSION_REFRESH_TOKEN = 'sessionRefreshToken';
const USER_COLOR_KEY = 'userColor';

export default class Nakama {
  public client: Client;
  public session: Session | null = null;
  public socket: Socket | null = null;

  constructor() {
    this.client = new Client(
      'defaultkey',
      /* process.env.NEXT_PUBLIC_NAKAMA_SERVER_HOST */ 'localhost',
      process.env.NEXT_PUBLIC_NAKAMA_SERVER_PORT,
      process.env.NEXT_PUBLIC_NAKAMA_USE_SSL === 'true',
      undefined,
      true
    );
  }

  async authenticateDevice(): Promise<void> {
    let color = 'grey';
    let name: string;

    let deviceId = LocalStorage.getItem(DEVICE_ID_KEY);

    let sessionToken = LocalStorage.getItem(SESSION_TOKEN);

    let sessionRefreshToken = LocalStorage.getItem(SESSION_REFRESH_TOKEN);

    if (sessionToken && sessionRefreshToken) {
      let tempSession = Session.restore(sessionToken, sessionRefreshToken);

      if (!tempSession.isexpired(Date.now() / 1000)) {
        this.session = tempSession;
        console.log('Restored Session');
      }
    }

    if (this.session == null) {
      console.log('New Session');

      if (!deviceId) {
        // Get random ID
        deviceId = uuidv4();

        // Get random name
        name = uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          separator: ' ',
          style: 'capital',
        });

        console.log('NAME = ', name);

        try {
          this.session = await this.client.authenticateDevice(
            deviceId,
            true,
            name
          );
        } catch (err: any) {
          console.log(
            'Error authenticating device: %o:%o',
            err.statusCode,
            err.message
          );
          return;
        }
        if (this.session?.user_id) {
          // Get random color
          color = uniqueNamesGenerator({ dictionaries: [colors] });

          LocalStorage.setItem(DEVICE_ID_KEY, deviceId);
          LocalStorage.setItem(USER_COLOR_KEY, color);

          LocalStorage.setItem(SESSION_TOKEN, this.session.token);
          LocalStorage.setItem(
            SESSION_REFRESH_TOKEN,
            this.session.refresh_token
          );
        }
      } else {
        try {
          this.session = await this.client.authenticateDevice(deviceId);
          const savedColor = LocalStorage.getItem(USER_COLOR_KEY);
          if (savedColor) color = savedColor;
        } catch (err: any) {
          console.log(
            'Error authenticating device: %o:%o',
            err.statusCode,
            err.message
          );
        }
        if (this.session?.user_id) {
          LocalStorage.setItem(SESSION_TOKEN, this.session.token);
          LocalStorage.setItem(
            SESSION_REFRESH_TOKEN,
            this.session.refresh_token
          );
        }
      }
    }

    if (!this.session?.user_id) return;

    const trace = false;
    this.socket = this.client.createSocket(
      process.env.NEXT_PUBLIC_NAKAMA_USE_SSL === 'true',
      trace
    );
    await this.socket.connect(this.session, true);

    console.log('SESSIONVERBINDUNG ERFOLGREICH', this.session);
  }

  async startMatch(matchType: string): Promise<string> {
    if (!this.session || !this.socket) {
      console.error('Session or socket not found!');
      return '';
    }

    interface Payload {
      success: boolean;
      id: string;
      joinCode: number;
      matchType: string;
    }

    // Uses RPC Function to create a new Match
    // Returns the MatchID and URL {matchId, url}
    const newMatchID = await this.client.rpc(this.session, 'Create_Match', {
      matchType: matchType,
    });

    let payload = newMatchID.payload as Payload;

    if (payload == undefined) {
      console.error('New MatchID is undefinded!');
      return '';
    }

    if (payload.success == false) {
      console.error('No Match under this ID!');
      return '';
    }

    let url = '/' + payload.matchType + '/' + payload.joinCode;

    // Returns URL for Client to join Match
    // Empty string if something fails
    return url;
  }

  async getMatchURL(joinCode: string): Promise<string> {
    if (!this.session || !this.socket) {
      console.error('Session or socket not found!');
      return '';
    }

    interface Payload {
      success: boolean;
      matchId: string;
      matchType: string;
    }

    // Uses RPC Function to get Match by Code
    // Returns the Match URL {url}
    const newMatch = await this.client.rpc(
      this.session,
      'Find_Match_By_Join_Code',
      {
        joinCode: joinCode,
      }
    );

    let payload = newMatch.payload as Payload;

    if (payload == undefined) {
      console.error('No Anwser from Server!');
      return '';
    }

    if (payload.success == false) {
      console.error('No Match under this ID!');
      return '';
    }

    let url = '/' + payload.matchType + '/' + joinCode;

    // Returns URL for Client to join Match
    // Empty string if no Match found under provided Code
    return url;
  }

  async getMatchID(joinCode: string): Promise<string> {
    if (!this.session || !this.socket) {
      console.error('Session or socket not found!');
      return '';
    }

    interface Payload {
      success: boolean;
      matchId: string;
      matchType: string;
    }

    // Uses RPC Function to get Match by Code
    // Returns the Match URL {url}
    const newMatch = await this.client.rpc(
      this.session,
      'Find_Match_By_Join_Code',
      {
        joinCode: joinCode,
      }
    );

    let payload = newMatch.payload as Payload;

    if (payload == undefined) {
      console.error('No Match under this ID!');
      return '';
    }

    if (payload.success == false) {
      //console.error('No Match under this ID!');
      return '';
    }

    // Returns URL for Client to join Match
    // Empty string if no Match found under provided Code
    return payload.matchId;
  }

  async writeDataToStorage(key: string, data: Array<any>): Promise<void> {
    if (!this.session || !this.socket) {
      console.error('Session or socket not found!');
      return;
    }

    enum API {
      WRITE = 0,
      DELETE = 1,
      GET = 2,
    }

    const newMatch = await this.client.rpc(this.session, 'Storage_API', {
      operation: API.WRITE,
      collection: 'workshops',
      key: key,
      data: data,
    });
  }
}
