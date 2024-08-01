import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { v4 as uuidv4 } from 'uuid';
import Player from '@/models/player';
import * as LocalStorage from './localstorage';
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  colors,
} from 'unique-names-generator';

// LocalStorage keys
const DEVICE_ID_KEY = 'deviceId';
const USER_ID_KEY = 'deviceId';
const USER_COLOR_KEY = 'userColor';

// RPC function IDs
/* const RPC_ID_HEALTCHCHECK = 'healthcheck'; */
const RPC_ID_FIND_MATCH = 'find_match';

class GameState {
  public playerIndex = 0;
}

export default class Nakama {
  public client: Client;
  public session: Session | null = null;
  public socket: Socket | null = null;
  public player: Player | null = null;
  public matchId: string | null = null;
  public gameState: GameState = new GameState();

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

        LocalStorage.setItem(USER_ID_KEY, this.session.user_id);
        LocalStorage.setItem(USER_COLOR_KEY, color);
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
    }

    if (!this.session?.user_id) return;

    this.player = {
      id: this.session.user_id,
      name: this.session.username || '',
      avatarColor: color,
      scoreLastGame: 0,
    };

    const trace = false;
    this.socket = this.client.createSocket(
      process.env.NEXT_PUBLIC_NAKAMA_USE_SSL === 'true',
      trace
    );
    await this.socket.connect(this.session, true);
    console.log('SESSIONVERBINDUNG ERFOLGREICH', this.session);
  }

  async findMatch(): Promise<void> {
    if (!this.session || !this.socket) {
      console.error('Session or socket not found!');
      return;
    }

    try {
      const matches = await this.client.rpc(
        this.session,
        RPC_ID_FIND_MATCH,
        {}
      );

      if (typeof matches === 'object' && matches !== null) {
        const safeParsedJson = matches as {
          payload: { matchIds: string[] };
        };
        this.matchId = safeParsedJson.payload.matchIds[0];
        await this.socket.joinMatch(this.matchId);
        console.log('Match joined! MatchId: ', this.matchId);
      }
    } catch (error) {
      console.error('Server error fetching matches: ', error);
    }
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

  /* async restoreSession(token: string): Promise<Session> {
    try {
      const session = await Session.restore(token);
      return session;
    } catch (error) {
      console.error('Session-Aktualisierung fehlgeschlagen', error);
      throw error;
    }
  } */
}