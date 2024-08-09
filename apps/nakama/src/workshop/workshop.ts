const workshop_Tickrate = 5;
const workshop_MaxEmptyTicks =
  MAX_TIME_WITHOUT_PLAYERS_IN_SEC * workshop_Tickrate;

const workshop_TicksShowingAnswer = 5 * workshop_Tickrate;

const workshop_MaxTicksUntilNext = 20 * workshop_Tickrate;

let workshop_MatchInit: nkruntime.MatchInitFunction<workshop_State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: { [key: string]: string }
) {
  let label: MatchLabel = {
    matchType: GAMETYPE_workshop,
    open: 1,
    joinCode: Number(params['joinCode']),
  };

  let state: workshop_State = {
    label: label,
    emptyTicks: 0,
    presences: {},
    joinsInProgress: 0,
    playing: false,
    workshopData: [],
    currentNode: 0,
    answered: false,
    promisedAnswer: false,
    countAnswers: 0,
    waitTicks: 0,
    autoSkip: false,
    scoreboard: {},
    matchHost: '',
    hostAsPresenter: true,
  };

  let objectIds: nkruntime.StorageReadRequest[] = [
    {
      collection: GAMETYPE_workshop,
      key: String(params['workshopKey']),
      userId: '00000000-0000-0000-0000-000000000000',
    },
  ];

  let objects: nkruntime.StorageObject[] = [];

  try {
    objects = nk.storageRead(objectIds);
  } catch (error) {
    logger.info('Mein Error: %q', error);
  }

  state.workshopData = objects[0].value.data;

  return {
    state,
    tickRate: workshop_Tickrate,
    label: JSON.stringify(label),
  };
};

let workshop_MatchJoinAttempt: nkruntime.MatchJoinAttemptFunction<workshop_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: workshop_State,
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
    } else if (state.playing) {
      return {
        state: state,
        accept: false,
        rejectMessage: 'In Game',
      };
    }

    // New player attempting to connect.
    state.joinsInProgress++;
    return {
      state,
      accept: true,
    };
  };

let workshop_MatchJoin: nkruntime.MatchJoinFunction<workshop_State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: workshop_State,
  presences: nkruntime.Presence[]
) {
  for (const presence of presences) {
    state.presences[presence.userId] = presence;

    if (state.joinsInProgress > 0) {
      state.joinsInProgress--;
    }

    if (state.matchHost == '') {
      state.matchHost = presence.userId;
    }

    sendPlayerList(state, dispatcher);

    // Check if we must send a message to this user to update them on the current game state.
    if (state.playing) {
      state = sendUpdate(state, dispatcher, workshop_Tickrate, presence);

      if (state.answered) {
        let answer = {
          answer: state.workshopData[state.currentNode].answer,
        };

        dispatcher.broadcastMessage(
          defaultQuiz_OpCode.ANSWER,
          JSON.stringify(answer),
          [presence]
        );
      }
    }
  }

  return { state };
};

let workshop_MatchLeave: nkruntime.MatchLeaveFunction<workshop_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: workshop_State,
    presences: nkruntime.Presence[]
  ) {
    for (let presence of presences) {
      logger.info('Player: %s left match: %s.', presence.userId, ctx.matchId);
      state.presences[presence.userId] = null;

      // Close Match if Host leaves during Lobby Phase
      /*if (presence.userId == state.matchHost && !state.playing) {
        dispatcher.broadcastMessage(workshop_OpCode.LEAVE, JSON.stringify({}));
        return null;
      }*/
    }

    sendPlayerList(state, dispatcher);

    return { state };
  };

let workshop_MatchLoop: nkruntime.MatchLoopFunction<workshop_State> = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: workshop_State,
  messages: nkruntime.MatchMessage[]
) {
  if (workshop_connectedPlayers(state, true) + state.joinsInProgress === 0) {
    state.emptyTicks++;
    if (state.emptyTicks >= workshop_MaxEmptyTicks) {
      // Match has been empty for too long, close it.
      logger.info('closing idle match');
      return null;
    }
  } else {
    state.emptyTicks = 0;
  }

  // If there's no game in progress check if we can (and should) start one!
  if (!state.playing) {
    // Between games any disconnected users are purged, there's no in-progress game for them to return to anyway.
    for (let userID in state.presences) {
      if (state.presences[userID] === null) {
        delete state.presences[userID];
      }
    }

    // Check if we need to update the label so the match now advertises itself as open to join.
    if (state.label.open != 1) {
      state.label.open = 1;
      let labelJSON = JSON.stringify(state.label);
      dispatcher.matchLabelUpdate(labelJSON);
    }

    state.countAnswers = 0;
    state.scoreboard = {};

    for (const message of messages) {
      switch (message.opCode) {
        case workshop_OpCode.START:
          if (message.sender.userId == state.matchHost) {
            state.playing = true;

            state.label.open = 0;
            let labelJSON = JSON.stringify(state.label);
            dispatcher.matchLabelUpdate(labelJSON);

            state = sendUpdate(state, dispatcher, workshop_Tickrate);
          }
          break;
        default:
      }
    }

    return { state };
  }

  let hostIsAlone = false;

  if (
    workshop_connectedPlayers(state, true) < 2 &&
    workshop_connectedPlayers(state, true) >
      workshop_connectedPlayers(state, false) &&
    state.hostAsPresenter
  ) {
    hostIsAlone = true;
  }

  if (state.promisedAnswer || state.autoSkip) {
    state.waitTicks--;

    if (state.waitTicks > 0) {
      sendTimer(state, dispatcher);
    }

    if (state.waitTicks == 0 && state.promisedAnswer) {
      state.countAnswers =
        workshop_connectedPlayers(state, !state.hostAsPresenter) +
        (hostIsAlone ? 1 : 0);
    }

    if (
      state.countAnswers >=
      workshop_connectedPlayers(state, !state.hostAsPresenter) +
        (hostIsAlone ? 1 : 0)
    ) {
      dispatcher.broadcastMessage(defaultQuiz_OpCode.DONE, JSON.stringify({}));

      let answer = {
        answer: state.workshopData[state.currentNode].answer,
      };

      dispatcher.broadcastMessage(
        defaultQuiz_OpCode.ANSWER,
        JSON.stringify(answer)
      );

      state.countAnswers = 0;
      state.promisedAnswer = false;
      state.answered = true;

      if (state.autoSkip) {
        state.waitTicks =
          state.workshopData[state.currentNode].settings.secondsAutoNext *
          workshop_Tickrate;
      } else {
        state.waitTicks = 0;
      }
    }

    if (state.waitTicks == 0 && state.autoSkip) {
      state.currentNode++;

      if (state.currentNode >= state.workshopData.length) {
        state.playing = false;
        state.currentNode = 0;

        dispatcher.broadcastMessage(workshop_OpCode.END, JSON.stringify({}));
      } else {
        state = sendUpdate(state, dispatcher, workshop_Tickrate);
      }
    }
  }

  // There's a game in progresstate. Check for input, update match state, and send messages to clientstate.
  for (const message of messages) {
    switch (message.opCode) {
      case workshop_OpCode.START:
        // Skips to next Node
        if (message.sender.userId == state.matchHost) {
          if (state.promisedAnswer || state.autoSkip) {
            state.waitTicks = 1;
            break;
          }

          state.currentNode++;

          if (state.currentNode >= state.workshopData.length) {
            state.playing = false;
            state.currentNode = 0;

            dispatcher.broadcastMessage(
              workshop_OpCode.END,
              JSON.stringify({})
            );
          } else {
            state = sendUpdate(state, dispatcher, workshop_Tickrate);
          }
        }
        break;

      case workshop_OpCode.BACK:
        if (message.sender.userId == state.matchHost) {
          state.currentNode--;

          if (state.currentNode < 0) {
            state.playing = false;
            state.currentNode = 0;

            dispatcher.broadcastMessage(
              workshop_OpCode.END,
              JSON.stringify({})
            );
          } else {
            state = sendUpdate(state, dispatcher, workshop_Tickrate);
          }
        }
        break;

      case workshop_OpCode.ANSWER:
        let playerMsg = JSON.parse(nk.binaryToString(message.data));

        if (state.scoreboard[state.currentNode] == undefined) {
          state.scoreboard[state.currentNode] = [];
        }

        if (
          state.workshopData[state.currentNode].answer.indexOf(
            playerMsg.answer[0]
          ) !== -1
        ) {
          let temp = state.scoreboard[state.currentNode];
          temp.push(message.sender.userId);
          state.scoreboard[state.currentNode] = temp;
        }
        break;

      case workshop_OpCode.DONE:
        state.countAnswers++;

      default:
        // No other opcodes are expected from the client, so automatically treat it as an error.
        dispatcher.broadcastMessage(workshop_OpCode.REJECTED, null, [
          message.sender,
        ]);
        logger.error('Unexpected opcode received: %d', message.opCode);
    }
  }

  return { state };
};

let workshop_MatchTerminate: nkruntime.MatchTerminateFunction<workshop_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: workshop_State,
    graceSeconds: number
  ) {
    return { state };
  };

let workshop_MatchSignal: nkruntime.MatchSignalFunction<workshop_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: workshop_State
  ) {
    return { state };
  };
