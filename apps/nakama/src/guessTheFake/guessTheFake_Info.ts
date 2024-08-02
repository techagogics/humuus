namespace guessTheFake {
  // ---------------------------- State ---------------------------- //

  export interface State {
    // Match label
    label: MatchLabel;
    // Ticks where no actions have occurred.
    emptyTicks: number;
    // Currently connected users, or reserved spaces.
    presences: { [userId: string]: nkruntime.Presence | null };
    // Number of users currently in the process of connecting to the match.
    joinsInProgress: number;
    // True if there's a game currently in progress.
    playing: boolean;
    // Ticks until they must submit their move.

    ticksUntilNextQuestion: number;

    questions: Array<ImgAndAnswer>;

    currentQuestion: number;

    countAnswers: number;

    scoreboard: { [key: string]: number };

    matchHost: string;

    hostAsPresenter: boolean;

    ticksShowingAnswer: number;
  }

  // ---------------------------- Message OpCodes ---------------------------- //

  // The complete set of OpCodes used for communication between clients and server.
  export enum OpCode {
    // New game round starting.
    START = 1,
    // Update to the state of an ongoing round.
    UPDATE = 2,
    // A game round has just completed.
    DONE = 3,
    // A move the player wishes to make and sends to the server.
    ANSWER = 4,
    // Move was rejected.
    REJECTED = 5,

    CONFIRMED = 6,

    PLAYERLIST = 7,

    END = 8,

    TIMER = 9,

    LEAVE = 10,
  }

  // ---------------------------- Messages ---------------------------- //

  export type Message =
    | PlayerListMessage
    | ImgMessage
    | ResultMessage
    | AnswerMessage;

  export interface PlayerListMessage {
    presences: { [userId: string]: nkruntime.Presence | null };
    host: string;
    isPresenter: boolean;
  }

  export interface ImgMessage {
    images: Array<string>;
  }

  export interface ResultMessage {
    results: { [key: string]: number };
  }

  export interface AnswerMessage {
    answer: number;
  }

  export interface StateMessage {
    state: boolean;
  }

  export interface TimerMessage {
    secondsLeft: number | null;

    timerName: string;
  }

  // ---------------------------- Utility Functions ---------------------------- //

  export function connectedPlayers(s: State): number {
    let count = 0;
    for (const p of Object.keys(s.presences)) {
      if (s.presences[p] !== null) {
        count++;
      }
    }
    return count;
  }

  export function BuildImgArray(): Array<ImgAndAnswer> {
    let tempArray: Array<ImgAndAnswer> = [];

    for (let i = 0; i < 5; i++) {
      let temp: ImgAndAnswer = { images: [], answer: -1 };

      let randomFake = FakeArray[getRandomInt(FakeArray.length)];

      let randomReal = RealArray[getRandomInt(RealArray.length)];

      let randomIndex = getRandomInt(2);

      temp.images[randomIndex] = 'fake/' + randomFake;

      temp.answer = randomIndex + 1;

      if (randomIndex > 0) {
        randomIndex = 0;
      } else {
        randomIndex = 1;
      }

      temp.images[randomIndex] = 'real/' + randomReal;

      tempArray.push(temp);
    }

    return tempArray;
  }

  export interface Img {
    images: Array<string>;
  }

  export interface ImgAndAnswer {
    images: Array<string>;
    answer: number;
  }

  export const FakeArray: Array<string> = ['4215', '4307', '5034', '5952'];
  export const RealArray: Array<string> = ['1270', '2092', '6401', '8157'];
}
