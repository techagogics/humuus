// The complete set of OpCodes used for communication between clients and server.
enum OpCode {
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

// Message data sent by server to clients representing a new game round starting.
interface StartMessage {
  // The presences currently playing
  presences: { [userId: string]: nkruntime.Presence | null };
  // The deadline time by which the player must submit their move, or forfeit.
  deadline: number;
}

// A game state update sent by the server to clients.
interface UpdateMessage {
  // The presences currently playing
  presences: { [userId: string]: nkruntime.Presence | null };
  // The deadline time by which the game ends
  deadline: number;
}

// Complete game round with winner announcement.
interface DoneMessage {
  // The winner of the game, if any. Unspecified if it's a draw.
  /* winner: Mark | null */

  // Next round start time.
  nextGameStart: number;
}
