const MODULE_ID_GUESS_THE_FAKE = 'guess_the_fake';
const tickRate = 30;
const gameTimeSec = 120;

interface MatchLabel {
  test: string;
}

interface State {
  label: MatchLabel;
  presences: { [userId: string]: nkruntime.Presence | null };
  joinsInProgress: number;
  playing: boolean;
  deadlineRemainingTicks: number;
  nextGameRemainingTicks: number;
}

let matchInit: nkruntime.MatchInitFunction<State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: { [key: string]: string }
) {
  var label: MatchLabel = { test: 'test-value' };

  var state: State = {
    label,
    presences: {},
    joinsInProgress: 0,
    playing: false,
    deadlineRemainingTicks: 0,
    nextGameRemainingTicks: 0,
  };

  return {
    state,
    tickRate,
    label: JSON.stringify(label),
  };
};

let matchJoinAttempt: nkruntime.MatchJoinAttemptFunction<State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: State,
  presence: nkruntime.Presence,
  metadata: { [key: string]: any }
) {
  // Check if it's a user attempting to rejoin after a disconnect.
  if (presence.userId in state.presences) {
    if (state.presences[presence.userId] === null) {
      // User rejoining after a disconnect.
      state.joinsInProgress++;
      return {
        state: state,
        accept: true,
      };
    } else {
      // User attempting to join from 2 different devices at the same time.
      return {
        state: state,
        accept: false,
        rejectMessage: 'Already joined',
      };
    }
  }

  /*   // Check if match is full.
  if (connectedPlayers(state) + state.joinsInProgress >= 2) {
      return {
          state: state,
          accept: false,
          rejectMessage: 'match full',
      };
  }*/

  // New player attempting to connect.
  state.joinsInProgress++;
  return {
    state,
    accept: true,
  };
};

let matchJoin: nkruntime.MatchJoinFunction<State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: State,
  presences: nkruntime.Presence[]
) {
  const t = msecToSec(Date.now());

  for (const presence of presences) {
    state.presences[presence.userId] = presence;
    state.joinsInProgress--;

    // Check if we must send a message to this user to update them on the current game state.
    if (state.playing) {
      // There's a game still currently in progress, the player is re-joining after a disconnect. Give them a state update.
      let update: UpdateMessage = {
        presences: state.presences,
        deadline: t + Math.floor(state.deadlineRemainingTicks / tickRate),
      };
      // Send a message to the user that just joined.
      dispatcher.broadcastMessage(OpCode.UPDATE, JSON.stringify(update));
      /* } else if (player mitgespielt letzte Runde?) {
          // seinen Score anzeigen */
    } else {
      logger.debug('player %s rejoined game', presence.userId);
      // There's no game in progress so we show the lobby.
      let done: DoneMessage = {
        nextGameStart: t + Math.floor(state.nextGameRemainingTicks / tickRate),
      };
      // Send a message to the user that just joined.
      dispatcher.broadcastMessage(OpCode.DONE, JSON.stringify(done));
    }
  }

  /* // Check if match was open to new players, but should now be closed.
  if (Object.keys(state.presences).length >= 2 && state.label.open != 0) {
      state.label.open = 0;
      const labelJSON = JSON.stringify(state.label);
      dispatcher.matchLabelUpdate(labelJSON);
  } */

  return { state };
};

let matchLeave: nkruntime.MatchLeaveFunction<State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: State,
  presences: nkruntime.Presence[]
) {
  for (let presence of presences) {
    logger.info('Player: %s left match: %s.', presence.userId, ctx.matchId);
    state.presences[presence.userId] = null;
  }

  return { state };
};

let matchLoop: nkruntime.MatchLoopFunction<State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: State,
  messages: nkruntime.MatchMessage[]
) {
  logger.debug('Running match loop. Tick: %d', tick);

  /* if (connectedPlayers(state) + state.joinsInProgress === 0) {
      state.emptyTicks++;
      if (state.emptyTicks >= maxEmptySec * tickRate) {
          // Match has been empty for too long, close it.
          logger.info('closing idle match');
          return null;
      }
  } */

  let t = msecToSec(Date.now());

  // If there's no game in progress check if we can (and should) start one!
  if (!state.playing) {
    // Between games any disconnected users are purged, there's no in-progress game for them to return to anyway.
    for (let userID in state.presences) {
      if (state.presences[userID] === null) {
        delete state.presences[userID];
      }
    }

    // Check if we need to update the label so the match now advertises itself as open to join.
    /* if (Object.keys(state.presences).length < 2 && state.label.open != 1) {
          state.label.open = 1;
          let labelJSON = JSON.stringify(state.label);
          dispatcher.matchLabelUpdate(labelJSON);
      } */

    // Check if we have enough players to start a game.
    if (gameTimeSec) {
      return { state };
    }

    // Check if enough time has passed since the last game.
    if (state.nextGameRemainingTicks > 0) {
      state.nextGameRemainingTicks--;
      return { state };
    }

    // We can start a game! Set up the game state and assign the marks to each player.
    state.playing = true;
    state.board = new Array(9);
    state.marks = {};
    let marks = [Mark.X, Mark.O];
    Object.keys(state.presences).forEach((userId) => {
      state.marks[userId] = marks.shift() ?? null;
    });
    state.mark = Mark.X;
    state.winner = null;
    state.winnerPositions = null;
    state.deadlineRemainingTicks = calculateDeadlineTicks(state.label);
    state.nextGameRemainingTicks = 0;

    // Notify the players a new game has started.
    let msg: StartMessage = {
      board: state.board,
      marks: state.marks,
      mark: state.mark,
      deadline: t + Math.floor(state.deadlineRemainingTicks / tickRate),
    };
    dispatcher.broadcastMessage(OpCode.START, JSON.stringify(msg));

    return { state };
  }

  // There's a game in progresstate. Check for input, update match state, and send messages to clientstate.
  for (const message of messages) {
    switch (message.opCode) {
      case OpCode.MOVE:
        logger.debug('Received move message from user: %v', state.marks);
        let mark = state.marks[message.sender.userId] ?? null;
        if (mark === null || state.mark != mark) {
          // It is not this player's turn.
          dispatcher.broadcastMessage(OpCode.REJECTED, null, [message.sender]);
          continue;
        }

        let msg = {} as MoveMessage;
        try {
          msg = JSON.parse(nk.binaryToString(message.data));
        } catch (error) {
          // Client sent bad data.
          dispatcher.broadcastMessage(OpCode.REJECTED, null, [message.sender]);
          logger.debug('Bad data received: %v', error);
          continue;
        }
        if (state.board[msg.position]) {
          // Client sent a position outside the board, or one that has already been played.
          dispatcher.broadcastMessage(OpCode.REJECTED, null, [message.sender]);
          continue;
        }

        // Update the game state.
        state.board[msg.position] = mark;
        state.mark = mark === Mark.O ? Mark.X : Mark.O;
        state.deadlineRemainingTicks = calculateDeadlineTicks(state.label);

        // Check if game is over through a winning move.
        const [winner, winningPos] = winCheck(state.board, mark);
        if (winner) {
          state.winner = mark;
          state.winnerPositions = winningPos;
          state.playing = false;
          state.deadlineRemainingTicks = 0;
          state.nextGameRemainingTicks = delaybetweenGamesSec * tickRate;
        }
        // Check if game is over because no more moves are possible.
        let tie = state.board.every((v) => v !== null);
        if (tie) {
          // Update state to reflect the tie, and schedule the next game.
          state.playing = false;
          state.deadlineRemainingTicks = 0;
          state.nextGameRemainingTicks = delaybetweenGamesSec * tickRate;
        }

        let opCode: OpCode;
        let outgoingMsg: Message;
        if (state.playing) {
          opCode = OpCode.UPDATE;
          let msg: UpdateMessage = {
            board: state.board,
            mark: state.mark,
            deadline: t + Math.floor(state.deadlineRemainingTicks / tickRate),
          };
          outgoingMsg = msg;
        } else {
          opCode = OpCode.DONE;
          let msg: DoneMessage = {
            board: state.board,
            winner: state.winner,
            winnerPositions: state.winnerPositions,
            nextGameStart:
              t + Math.floor(state.nextGameRemainingTicks / tickRate),
          };
          outgoingMsg = msg;
        }
        dispatcher.broadcastMessage(opCode, JSON.stringify(outgoingMsg));
        break;
      default:
        // No other opcodes are expected from the client, so automatically treat it as an error.
        dispatcher.broadcastMessage(OpCode.REJECTED, null, [message.sender]);
        logger.error('Unexpected opcode received: %d', message.opCode);
    }
  }

  // Keep track of the time remaining for the player to submit their move. Idle players forfeit.
  if (state.playing) {
    state.deadlineRemainingTicks--;
    if (state.deadlineRemainingTicks <= 0) {
      // The player has run out of time to submit their move.
      state.playing = false;
      state.winner = state.mark === Mark.O ? Mark.X : Mark.O;
      state.deadlineRemainingTicks = 0;
      state.nextGameRemainingTicks = delaybetweenGamesSec * tickRate;

      let msg: DoneMessage = {
        board: state.board,
        winner: state.winner,
        nextGameStart: t + Math.floor(state.nextGameRemainingTicks / tickRate),
        winnerPositions: null,
      };
      dispatcher.broadcastMessage(OpCode.DONE, JSON.stringify(msg));
    }
  }

  return { state };
};

let matchTerminate: nkruntime.MatchTerminateFunction<State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: State,
  graceSeconds: number
) {
  return { state };
};

let matchSignal: nkruntime.MatchSignalFunction<State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: State
) {
  return { state };
};

function calculateDeadlineTicks(l: MatchLabel): number {
  return gameTimeSec * tickRate;
}

function winCheck(board: Board, mark: Mark): [boolean, Mark[] | null] {
  for (let wp of winningPositions) {
    if (
      board[wp[0]] === mark &&
      board[wp[1]] === mark &&
      board[wp[2]] === mark
    ) {
      return [true, wp];
    }
  }

  return [false, null];
}

function connectedPlayers(s: State): number {
  let count = 0;
  for (const p of Object.keys(s.presences)) {
    if (s.presences[p] !== null) {
      count++;
    }
  }
  return count;
}
