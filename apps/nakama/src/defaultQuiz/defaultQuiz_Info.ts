// ---------------------------- State ---------------------------- //

interface defaultQuiz_State {
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

  questions: Array<defaultQuiz_QuestionAndAnswer>;

  currentQuestion: number;

  countAnswers: number;

  scoreboard: { [key: string]: number };

  matchHost: string;

  hostAsPresenter: boolean;

  ticksShowingAnswer: number;
}

// ---------------------------- Message OpCodes ---------------------------- //

// The complete set of OpCodes used for communication between clients and server.
enum defaultQuiz_OpCode {
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

type defaultQuiz_Message =
  | defaultQuiz_PlayerListMessage
  | defaultQuiz_QuestionsMessage
  | defaultQuiz_ResultMessage
  | defaultQuiz_AnswerMessage;

interface defaultQuiz_PlayerListMessage {
  presences: { [userId: string]: nkruntime.Presence | null };
  host: string;
  isPresenter: boolean;
}

interface defaultQuiz_QuestionsMessage {
  question: defaultQuiz_Question;
}

interface defaultQuiz_ResultMessage {
  results: { [key: string]: number };
}

interface defaultQuiz_AnswerMessage {
  answer: Array<number>;
}

interface defaultQuiz_StateMessage {
  state: boolean;
}

interface defaultQuiz_TimerMessage {
  secondsLeft: number | null;

  timerName: string;
}

// ---------------------------- Utility Functions ---------------------------- //

function defaultQuiz_connectedPlayers(s: defaultQuiz_State): number {
  let count = 0;
  for (const p of Object.keys(s.presences)) {
    if (s.presences[p] !== null) {
      count++;
    }
  }
  return count;
}

interface defaultQuiz_Question {
  text: string;
  options: Array<string>;
}

interface defaultQuiz_QuestionAndAnswer {
  question: defaultQuiz_Question;
  answer: Array<number>;
}

const defaultQuiz_Test: Array<defaultQuiz_QuestionAndAnswer> = [
  {
    question: {
      text: 'Das ist Frage Nr. 1?',
      options: ['Antwort A?', 'Antwort B!', 'Antwort C.', 'Antwort D'],
    },
    answer: [4],
  },
  {
    question: {
      text: 'Das ist Frage Nr. 2?',
      options: ['Antwort A?', 'Antwort B!', 'Antwort C.', 'Antwort D'],
    },
    answer: [2],
  },
  {
    question: {
      text: 'Mehrere Antwortmöglichkeiten?',
      options: ['Antwort A?', 'Antwort B!', 'Antwort C.', 'Antwort D'],
    },
    answer: [1, 4],
  },
];

const defaultQuiz_ExampleQuestions: string = JSON.stringify(defaultQuiz_Test);
