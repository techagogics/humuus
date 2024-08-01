// ---------------------------- State ---------------------------- //

interface sharedTextInput_State {
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
  // Current state of the board.
  inputValue: string;
  // Ticks until they must submit their move.
  deadlineRemainingTicks: number;
}

// ---------------------------- Message OpCodes ---------------------------- //

// The complete set of OpCodes used for communication between clients and server.
enum sharedTextInput_OpCode {
  // New game round starting.
  START = 1,
  // Update to the state of an ongoing round.
  UPDATE = 2,
  // A game round has just completed.
  DONE = 3,
  // A move the player wishes to make and sends to the server.
  MOVE = 4,
  // Move was rejected.
  REJECTED = 5,
}

// ---------------------------- Messages ---------------------------- //

type sharedTextInput_Message =
  | sharedTextInput_StartMessage
  | sharedTextInput_UpdateMessage
  | sharedTextInput_DoneMessage
  | sharedTextInput_PlayerUpdateMessage;

// Message data sent by server to clients representing a new game round starting.
interface sharedTextInput_StartMessage {
  // The presences currently playing
  presences: { [userId: string]: nkruntime.Presence | null };

  value: string;
  // The deadline time by which the player must submit their move, or forfeit.
  deadline: number;
}

// A game state update sent by the server to clients.
interface sharedTextInput_UpdateMessage {
  // The presences currently playing
  presences: { [userId: string]: nkruntime.Presence | null };

  value: string;
  // The deadline time by which the game ends
  deadline: number;
}

// Complete game round with winner announcement.
interface sharedTextInput_DoneMessage {
  // The winner of the game, if any. Unspecified if it's a draw.
  /* winner: Mark | null */

  // Next round start time.
  nextGameStart: number;
}

// A player intends to make a move.
interface sharedTextInput_PlayerUpdateMessage {
  // The position the player wants to place their mark in.
  value: string;
}

// ---------------------------- Utility Functions ---------------------------- //

function sharedTextInput_connectedPlayers(s: sharedTextInput_State): number {
  let count = 0;
  for (const p of Object.keys(s.presences)) {
    if (s.presences[p] !== null) {
      count++;
    }
  }
  return count;
}
