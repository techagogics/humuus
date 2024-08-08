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
      text: 'Was ist ein Deepfake?',
      options: [
        'Gefälschte Medieninhalte',
        'Eine neue Trendsportart',
        'Ein leckerer Nachtisch',
        'Ein fieser Algorithmus',
      ],
    },
    answer: [1],
  },
  {
    question: {
      text: 'Was können Deepfakes sein?',
      options: ['Videos', 'Fotos', 'Zeitungsartikel', 'Leckere Nachtische'],
    },
    answer: [1, 2],
  },
  {
    question: {
      text: 'Wie kannst du einen Deepfake erkennen?',
      options: [
        'An Bilddetails wie Stirnrunzeln',
        'Am Lächeln',
        'An den Schuhen',
        'Am Schatten',
      ],
    },
    answer: [1, 4],
  },
  {
    question: {
      text: 'Wie kannst du die Echtheit von Fotos/Videos überprüfen?',
      options: [
        'Ich esse einen leckeren Nachtisch und achte auf mein Bauchgefühl',
        'Ich vertraue den Kommentaren unter dem Video',
        'Ich checke die Quelle des Videos',
        'Ich rufe den Telefonjoker an',
      ],
    },
    answer: [3],
  },
  {
    question: {
      text: 'Welche Tipps gibt es noch?',
      options: [
        'Auffälliges Make Up ist immer Fake',
        'Ich nasche einen leckeren Nachtisch',
        'Ich berate mich mit Anderen',
        'Ich vergleiche das Foto mit anderen Fotos der Person',
      ],
    },
    answer: [3, 4],
  },
  {
    question: {
      text: 'Handbewegungen können helfen Deepfakes zu erkennen. Warum?',
      options: [
        'Handbewegungen sind leicht zu faken',
        'Deepfakes zeigen nie Hände',
        'Durch Bewegungen, wie streichen durchs Haar entstehen Fehler',
        'Hände im Gesicht verdecken die Fehler im Deepfake',
      ],
    },
    answer: [3],
  },
  {
    question: {
      text: 'Wofür können Deepfakes NICHT eingesetzt werden?',
      options: [
        'Fake News',
        'Tote zum Leben erwecken',
        'Cybermobbing',
        'Hausaufgaben machen',
      ],
    },
    answer: [4],
  },
  {
    question: {
      text: 'Wer steckt hinter dem TikTok-Kanal "deeptomcruise"?',
      options: [
        'kein Mensch - ein rein digitaler Avatar',
        'kein Deepfake - ein realer Doppelgänger von Tom Cruise',
        'Deepfakes von einem Doppelgänger',
        'Tom Cruise selbst steckt dahinter',
      ],
    },
    answer: [3],
  },
  {
    question: {
      text: 'Was ist der Unterschied zwischen einem "Deepfake" und einem normalen gefälschten Video?',
      options: [
        'Es gibt keinen Unterschied',
        'Deepfakes nutzen künstliche Intelligenz um ein Gesicht einzufügen',
        'Der leckere Nachtisch',
        'Deepfakes sind immer professionell produziert',
      ],
    },
    answer: [2],
  },
  {
    question: {
      text: 'Welche Technologie steckt hinter Deepfakes?',
      options: [
        'Die HoloLens',
        'Neuronale Netzwerke',
        'Virtual Reality',
        'Unreal Engine',
      ],
    },
    answer: [2],
  },
  {
    question: {
      text: 'Was solltest du tun, wenn du ein Deepfake entdeckst, in dem eine Person ungewollt dargestellt wird?',
      options: [
        'Ihn sofort auf allen sozialen Medien teilen',
        'Die Entdeckung der Quelle melden und das Deepfake nicht weiter verbreiten',
        'Einen bösen Kommentar hinterlassen',
        'Auf das Video reagieren, indem man selbst ein Deepfake erstellt',
      ],
    },
    answer: [2],
  },
  {
    question: {
      text: 'Deepfakes kann man immer anhand der Videoqualität erkennen!',
      options: ['Richtig', 'Falsch'],
    },
    answer: [2],
  },
  {
    question: {
      text: 'Welche Aussage über Deepfakes ist korrekt?',
      options: [
        'Sie sind teuer herzustellen',
        'Sie sind schwer zu erkennen',
        'Sie benötigen Bilder einer Person als Trainingsdaten',
        'Sie können nur auf ganz bestimmte Personen angewendet werden',
      ],
    },
    answer: [2, 3],
  },
  {
    question: {
      text: 'Was ist das Ziel von Deepfake-Erkennungstechnologie?',
      options: [
        'Sie soll Deepfakes erstellen',
        'Sie soll Deepfakes identifizieren und entfernen',
        'Sie soll Deepfakes verbessern',
        'Sie soll Deepfakes automatisch versenden',
      ],
    },
    answer: [2, 3],
  },
];

const defaultQuiz_ExampleQuestions: string = JSON.stringify(defaultQuiz_Test);
