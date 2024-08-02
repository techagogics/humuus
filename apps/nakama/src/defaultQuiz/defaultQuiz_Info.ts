namespace defaultQuiz {
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

    questions: Array<QuestionAndAnswer>;

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
    | QuestionsMessage
    | ResultMessage
    | AnswerMessage;

  export interface PlayerListMessage {
    presences: { [userId: string]: nkruntime.Presence | null };
    host: string;
    isPresenter: boolean;
  }

  export interface QuestionsMessage {
    question: Question;
  }

  export interface ResultMessage {
    results: { [key: string]: number };
  }

  export interface AnswerMessage {
    answer: Array<number>;
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

  export interface Question {
    text: string;
    options: Array<string>;
  }

  export interface QuestionAndAnswer {
    question: Question;
    answer: Array<number>;
  }

  export const Test: Array<QuestionAndAnswer> = [
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

  export const ExampleQuestions: string = JSON.stringify(Test);
}
