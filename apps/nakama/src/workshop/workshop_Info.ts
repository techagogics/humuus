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

  answered: boolean;

  promisedAnswer: boolean;

  countAnswers: number;

  waitTicks: number;

  autoSkip: boolean;

  scoreboard: { [key: number]: Array<string> };

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

function workshop_connectedPlayers(
  s: workshop_State,
  countHost: boolean
): number {
  let count = 0;
  for (const p of Object.keys(s.presences)) {
    if (s.presences[p] !== null) {
      if (!countHost && s.presences[p].userId == s.matchHost) {
      } else {
        count++;
      }
    }
  }
  return count;
}

enum NodeType {
  Lobby = 0,
  Scoreboard = 1,
  Countdown = 2,
  Headline = 3,
  DefaultQuiz = 4,
  ImgQuiz = 5,
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
    text: 'Was ist ein Deepfake?',
    options: [
      'Gefälschte Medieninhalte',
      'Eine neue Trendsportart',
      'Ein leckerer Nachtisch',
      'Ein fieser Algorithmus',
    ],
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
    text: 'Was ist ein Deepfake?',
    images: ['fake/4215', 'real/2092'],
  },
  answer: [1],
};

const ImgNodeTimer: WorkshopNode = {
  type: NodeType.ImgQuiz,
  settings: {
    secondsUntilAnswer: 20,
    secondsAutoNext: 5,
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
    secondsAutoNext: 5,
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

const CountdownNode: WorkshopNode = {
  type: NodeType.Countdown,
  settings: {
    secondsUntilAnswer: 0,
    secondsAutoNext: 10,
  },
  data: {},
  answer: null,
};

let workshop = [
  CountdownNode,
  QuizNode,
  QuizNode,
  ScoreboardNode,
  ImgNode,
  ImgNode,
  ScoreboardNode,
];

function sendUpdate(
  state: workshop_State,
  dispatcher: nkruntime.MatchDispatcher,
  tickRate: number,
  recipient?: nkruntime.Presence
) {
  let update;

  state.scoreboard[state.currentNode] = [];

  if (state.workshopData[state.currentNode].type == NodeType.Scoreboard) {
    update = {
      currentNode: state.currentNode,
      workshopLength: state.workshopData.length,
      nodeType: state.workshopData[state.currentNode].type,
      nodeData: renderScoreboard(state),
    };
  } else {
    update = {
      currentNode: state.currentNode,
      workshopLength: state.workshopData.length,
      nodeType: state.workshopData[state.currentNode].type,
      nodeData: state.workshopData[state.currentNode].data,
    };
  }

  if (typeof recipient !== 'undefined') {
    dispatcher.broadcastMessage(
      workshop_OpCode.UPDATE,
      JSON.stringify(update),
      [recipient]
    );
    return state;
  } else {
    dispatcher.broadcastMessage(workshop_OpCode.UPDATE, JSON.stringify(update));
  }

  state.countAnswers = 0;
  state.waitTicks = 0;
  state.promisedAnswer = false;
  state.autoSkip = false;
  state.answered = false;

  if (state.workshopData[state.currentNode].settings.secondsAutoNext > 0) {
    state.waitTicks =
      state.workshopData[state.currentNode].settings.secondsAutoNext * tickRate;

    state.autoSkip = true;
    sendTimer(state, dispatcher);
  }

  if (state.workshopData[state.currentNode].answer != null) {
    state.waitTicks =
      state.workshopData[state.currentNode].settings.secondsUntilAnswer *
      tickRate;

    state.promisedAnswer = true;
    if (state.waitTicks > 0) {
      sendTimer(state, dispatcher);
    }
  }

  return state;
}

function sendPlayerList(
  state: workshop_State,
  dispatcher: nkruntime.MatchDispatcher
) {
  let listofUsernames = [];

  for (let userID in state.presences) {
    if (
      state.presences[userID] !== null && state.hostAsPresenter
        ? userID != state.matchHost
        : true
    ) {
      listofUsernames.push(state.presences[userID]?.username);
    }
  }

  listofUsernames.sort();

  let playerList = {
    playerList: listofUsernames,
    host: state.matchHost,
    isPresenter: state.hostAsPresenter,
  };
  // Send a message to the user that just joined.
  dispatcher.broadcastMessage(
    workshop_OpCode.PLAYERLIST,
    JSON.stringify(playerList)
  );
}

function sendTimer(
  state: workshop_State,
  dispatcher: nkruntime.MatchDispatcher
) {
  let timer = {
    secondsLeft: Math.ceil(state.waitTicks / workshop_Tickrate),
  };

  dispatcher.broadcastMessage(workshop_OpCode.TIMER, JSON.stringify(timer));
}

function renderScoreboard(state: workshop_State): object {
  let scoreboard: { [key: string]: { username: string; score: number } } = {};

  for (let userID in state.presences) {
    if (state.hostAsPresenter ? userID != state.matchHost : true) {
      scoreboard[userID] = {
        username: String(state.presences[userID]?.username),
        score: 0,
      };
    }
  }

  for (let game in state.scoreboard) {
    if (parseInt(game) <= state.currentNode) {
      for (let user in state.scoreboard[game]) {
        if (scoreboard[state.scoreboard[game][user]] == undefined) {
          scoreboard[state.scoreboard[game][user]] = {
            username: String(
              state.presences[state.scoreboard[game][user]]?.username
            ),
            score: 0,
          };
        }

        scoreboard[state.scoreboard[game][user]].score++;
      }
    }
  }

  let sortable = [];
  for (let key in scoreboard) {
    sortable.push([key, scoreboard[key].username, scoreboard[key].score]);
  }

  sortable.sort(function (a: Array<any>, b: Array<any>) {
    return a[2] - b[2];
  });

  sortable.reverse();

  scoreboard = {};

  for (let key in sortable) {
    scoreboard[sortable[key][0]] = {
      username: String(sortable[key][1]),
      score: sortable[key][2] as number,
    };
  }

  return scoreboard;
}
