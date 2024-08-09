// ---------------------------- State ---------------------------- //

interface guessTheFake_State {
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

  questions: Array<guessTheFake_ImgAndAnswer>;

  currentQuestion: number;

  countAnswers: number;

  scoreboard: { [key: string]: number };

  matchHost: string;

  hostAsPresenter: boolean;

  ticksShowingAnswer: number;
}

// ---------------------------- Message OpCodes ---------------------------- //

// The complete set of OpCodes used for communication between clients and server.
enum guessTheFake_OpCode {
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

type guessTheFake_Message =
  | guessTheFake_PlayerListMessage
  | guessTheFake_ImgMessage
  | guessTheFake_ResultMessage
  | guessTheFake_AnswerMessage;

interface guessTheFake_PlayerListMessage {
  presences: { [userId: string]: nkruntime.Presence | null };
  host: string;
  isPresenter: boolean;
}

interface guessTheFake_ImgMessage {
  images: Array<string>;
}

interface guessTheFake_ResultMessage {
  results: { [key: string]: number };
}

interface guessTheFake_AnswerMessage {
  answer: number;
}

interface guessTheFake_StateMessage {
  state: boolean;
}

interface guessTheFake_TimerMessage {
  secondsLeft: number | null;

  timerName: string;
}

// ---------------------------- Utility Functions ---------------------------- //

function guessTheFake_connectedPlayers(s: guessTheFake_State): number {
  let count = 0;
  for (const p of Object.keys(s.presences)) {
    if (s.presences[p] !== null) {
      count++;
    }
  }
  return count;
}

function guessTheFake_BuildImgArray(
  fakeArray: Array<string>,
  realArray: Array<string>
): Array<guessTheFake_ImgAndAnswer> {
  let tempArray: Array<guessTheFake_ImgAndAnswer> = [];

  for (let i = 0; i < 10; i++) {
    let temp: guessTheFake_ImgAndAnswer = { images: [], answer: -1 };

    let randomFake = fakeArray[getRandomInt(fakeArray.length)];

    let randomReal = realArray[getRandomInt(realArray.length)];

    let randomIndex = getRandomInt(2);

    temp.images[randomIndex] = randomFake;

    temp.answer = randomIndex + 1;

    if (randomIndex > 0) {
      randomIndex = 0;
    } else {
      randomIndex = 1;
    }

    temp.images[randomIndex] = randomReal;

    tempArray.push(temp);
  }

  return tempArray;
}

interface guessTheFake_Img {
  images: Array<string>;
}

interface guessTheFake_ImgAndAnswer {
  images: Array<string>;
  answer: number;
}

const guessTheFake_FakeArray: Array<string> = ['4215', '4307', '5034', '5952'];
const guessTheFake_RealArray: Array<string> = ['1270', '2092', '6401', '8157'];
