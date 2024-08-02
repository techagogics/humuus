namespace sharedTextInput {
  const Tickrate = 20;
  const MaxEmptyTicks = MAX_TIME_WITHOUT_PLAYERS_IN_SEC * Tickrate;

  export let MatchInit: nkruntime.MatchInitFunction<State> = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: string }
  ) {
    let label: MatchLabel = {
      matchType: GAMETYPE_sharedTextInput,
      open: 1,
      joinCode: Number(params['joinCode']),
    };

    let state: State = {
      label: label,
      emptyTicks: 0,
      presences: {},
      joinsInProgress: 0,
      playing: false,
      deadlineRemainingTicks: 0,
      inputValue: 'Startwert vom Server!',
    };

    return {
      state,
      tickRate: Tickrate,
      label: JSON.stringify(label),
    };
  };

  export let MatchJoinAttempt: nkruntime.MatchJoinAttemptFunction<State> =
    function (
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
          return {
            state: state,
            accept: true,
          };
        } else {
          // User attempting to join from 2 different devices at the same time.
          return {
            state: state,
            accept: false,
            rejectMessage: 'already joined',
          };
        }
      }

      // Check if match is full.
      /*
  if (connectedPlayers(state) >= maxPlayers) {
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

  export let MatchJoin: nkruntime.MatchJoinFunction<State> = function (
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

      if (state.joinsInProgress > 0) {
        state.joinsInProgress--;
      }

      // Check if we must send a message to this user to update them on the current game state.
      if (state.playing) {
        // There's a game still currently in progress, the player is re-joining after a disconnect. Give them a state update.
        let update: UpdateMessage = {
          presences: state.presences,
          value: state.inputValue,
          deadline: t + Math.floor(state.deadlineRemainingTicks / Tickrate),
        };
        // Send a message to the user that just joined.
        dispatcher.broadcastMessage(OpCode.UPDATE, JSON.stringify(update));
      } else {
        logger.debug('player %s rejoined game', presence.userId);
      }
    }

    // Check if match was open to new players, but should now be closed.
    /*
  if (
    Object.keys(state.presences).length >= maxPlayers &&
    state.label.open != 0
  ) {
    state.label.open = 0;
    const labelJSON = JSON.stringify(state.label);
    dispatcher.matchLabelUpdate(labelJSON);
  }*/

    return { state };
  };

  export let MatchLeave: nkruntime.MatchLeaveFunction<State> = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: State,
    presences: nkruntime.Presence[]
  ) {
    /*
  for (let presence of presences) {
    logger.info('Player: %s left match: %s.', presence.userId, ctx.matchId);
    state.presences[presence.userId] = null;
  }*/

    for (let presence of presences) {
      logger.info('Player: %s left match: %s.', presence.userId, ctx.matchId);
      delete state.presences[presence.userId];
    }

    let msg: UpdateMessage = {
      presences: state.presences,
      value: state.inputValue,
      deadline: Math.floor(state.deadlineRemainingTicks / Tickrate),
    };
    dispatcher.broadcastMessage(OpCode.UPDATE, JSON.stringify(msg));

    return { state };
  };

  export let MatchLoop: nkruntime.MatchLoopFunction<State> = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: State,
    messages: nkruntime.MatchMessage[]
  ) {
    //logger.debug('Running match loop. Tick: %d', tick);

    if (connectedPlayers(state) + state.joinsInProgress === 0) {
      state.emptyTicks++;
      if (state.emptyTicks >= MaxEmptyTicks) {
        // Match has been empty for too long, close it.
        logger.info('closing idle match');
        return null;
      }
    } else {
      state.emptyTicks = 0;
    }

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
      if (Object.keys(state.presences).length < 2 && state.label.open != 1) {
        state.label.open = 1;
        let labelJSON = JSON.stringify(state.label);
        dispatcher.matchLabelUpdate(labelJSON);
      }

      // We can start a game! Set up the game state and assign the marks to each player.
      state.playing = true;
      //state.inputValue = 'new Array(9)';

      // Notify the players a new game has started.
      let msg: StartMessage = {
        presences: state.presences,
        value: state.inputValue,
        deadline: t + Math.floor(state.deadlineRemainingTicks / Tickrate),
      };
      dispatcher.broadcastMessage(OpCode.START, JSON.stringify(msg));

      return { state };
    }

    // There's a game in progresstate. Check for input, update match state, and send messages to clientstate.
    for (const message of messages) {
      switch (message.opCode) {
        case OpCode.MOVE:
          logger.debug('Received move message from user: %v');

          let playerMsg = {} as PlayerUpdateMessage;
          try {
            playerMsg = JSON.parse(nk.binaryToString(message.data));
          } catch (error) {
            // Client sent bad data.
            dispatcher.broadcastMessage(OpCode.REJECTED, null, [
              message.sender,
            ]);
            logger.debug('Bad data received: %v', error);
            continue;
          }

          // Update the game state.
          state.inputValue = playerMsg.value;

          let opCode: OpCode;
          let outgoingMsg: Message;
          opCode = OpCode.UPDATE;
          let msg: UpdateMessage = {
            presences: state.presences,
            value: state.inputValue,
            deadline: t + Math.floor(state.deadlineRemainingTicks / Tickrate),
          };
          outgoingMsg = msg;
          dispatcher.broadcastMessage(opCode, JSON.stringify(outgoingMsg));
          break;
        default:
          // No other opcodes are expected from the client, so automatically treat it as an error.
          dispatcher.broadcastMessage(OpCode.REJECTED, null, [message.sender]);
          logger.error('Unexpected opcode received: %d', message.opCode);
      }
    }

    return { state };
  };

  export let MatchTerminate: nkruntime.MatchTerminateFunction<State> =
    function (
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

  export let MatchSignal: nkruntime.MatchSignalFunction<State> = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: State
  ) {
    return { state };
  };
}
