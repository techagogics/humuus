// ---------------------------- State ---------------------------- //

interface workshop_State {
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
  workshopData: Array<WorkshopNode>;

  currentNode: number;

  promisedAnswer: boolean;

  countAnswers: number;

  waitTicks: number;

  scoreboard: { [key: string]: number };

  matchHost: string;

  hostAsPresenter: boolean;
}

// ---------------------------- Message OpCodes ---------------------------- //

// The complete set of OpCodes used for communication between clients and server.
enum workshop_OpCode {
  START = 0,

  BACK = 1,

  UPDATE = 2,

  DONE = 3,

  ANSWER = 4,

  REJECTED = 5,

  CONFIRMED = 6,

  PLAYERLIST = 7,

  END = 8,

  TIMER = 9,

  LEAVE = 10,
}

// ---------------------------- Messages ---------------------------- //

type workshop_Message = workshop_PlayerListMessage;

interface workshop_PlayerListMessage {
  presences: { [userId: string]: nkruntime.Presence | null };
  host: string;
  isPresenter: boolean;
}

interface workshop_UpdateMessage {
  presences: { [userId: string]: nkruntime.Presence | null };
  host: string;
  isPresenter: boolean;
}

// ---------------------------- Utility Functions ---------------------------- //

function workshop_connectedPlayers(s: workshop_State): number {
  let count = 0;
  for (const p of Object.keys(s.presences)) {
    if (s.presences[p] !== null) {
      count++;
    }
  }
  return count;
}

enum NodeType {
  Lobby = 0,
  Scoreboard = 1,
  Headline = 2,
  DefaultQuiz = 3,
  ImgQuiz = 4,
}

interface WorkshopNode {
  type: number;
  settings: {
    secondsUntilAnswer: number;
    secondsAutoNext: number;
  };
  data: object;
  answer: any;
}

const QuizNode: WorkshopNode = {
  type: NodeType.DefaultQuiz,
  settings: {
    secondsUntilAnswer: 0,
    secondsAutoNext: 0,
  },
  data: {
    question: {
      text: 'Was ist ein Deepfake?',
      options: [
        'Gefälschte Medieninhalte',
        'Eine neue Trendsportart',
        'Ein leckerer Nachtisch',
        'Ein fieser Algorithmus',
      ],
    },
  },
  answer: [1],
};

const ImgNode: WorkshopNode = {
  type: NodeType.ImgQuiz,
  settings: {
    secondsUntilAnswer: 0,
    secondsAutoNext: 0,
  },
  data: {
    images: ['fake/4215', 'real/2092'],
  },
  answer: [1],
};

const ImgNodeTimer: WorkshopNode = {
  type: NodeType.ImgQuiz,
  settings: {
    secondsUntilAnswer: 20,
    secondsAutoNext: 0,
  },
  data: {
    images: ['real/2092', 'fake/4215'],
  },
  answer: [2],
};

const HeadlineNode: WorkshopNode = {
  type: NodeType.Headline,
  settings: {
    secondsUntilAnswer: 0,
    secondsAutoNext: 0,
  },
  data: {
    text: 'Das ist eine Headline!',
  },
  answer: null,
};

const ScoreboardNode: WorkshopNode = {
  type: NodeType.Scoreboard,
  settings: {
    secondsUntilAnswer: 0,
    secondsAutoNext: 0,
  },
  data: {},
  answer: null,
};

let workshop = [
  HeadlineNode,
  ImgNode,
  HeadlineNode,
  ImgNodeTimer,
  HeadlineNode,
];

function sendUpdate(
  state: workshop_State,
  dispatcher: nkruntime.MatchDispatcher,
  tickRate: number
) {
  let update = {
    nodeType: state.workshopData[state.currentNode].type,
    nodeData: state.workshopData[state.currentNode].data,
  };

  state.countAnswers = 0;
  state.waitTicks = 0;
  state.promisedAnswer = false;

  dispatcher.broadcastMessage(workshop_OpCode.UPDATE, JSON.stringify(update));

  if (state.workshopData[state.currentNode].answer != null) {
    state.waitTicks =
      state.workshopData[state.currentNode].settings.secondsUntilAnswer *
      tickRate;

    state.promisedAnswer = true;
  }

  return state;
}
