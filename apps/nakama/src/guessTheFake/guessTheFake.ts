const guessTheFake_Tickrate = 5;
const guessTheFake_MaxEmptyTicks =
  MAX_TIME_WITHOUT_PLAYERS_IN_SEC * guessTheFake_Tickrate;

const guessTheFake_TicksShowingAnswer = 5 * guessTheFake_Tickrate;

const guessTheFake_MaxTicksUntilNext = 20 * guessTheFake_Tickrate;

let guessTheFake_MatchInit: nkruntime.MatchInitFunction<guessTheFake_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: string }
  ) {
    let label: MatchLabel = {
      matchType: GAMETYPE_guessTheFake,
      open: 1,
      joinCode: Number(params['joinCode']),
    };

    let state: guessTheFake_State = {
      label: label,
      emptyTicks: 0,
      presences: {},
      joinsInProgress: 0,
      playing: false,
      ticksUntilNextQuestion: 0,
      questions: [],
      currentQuestion: -1,
      countAnswers: 0,
      scoreboard: {},
      matchHost: '',
      hostAsPresenter: true,
      ticksShowingAnswer: 0,
    };

    let objectIds: nkruntime.StorageReadRequest[] = [
      {
        collection: GAMETYPE_guessTheFake,
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

    let fakeArray = objects[0].value.data.fake;

    let realArray = objects[0].value.data.real;

    state.questions = guessTheFake_BuildImgArray(fakeArray, realArray);

    return {
      state,
      tickRate: guessTheFake_Tickrate,
      label: JSON.stringify(label),
    };
  };

let guessTheFake_MatchJoinAttempt: nkruntime.MatchJoinAttemptFunction<guessTheFake_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: guessTheFake_State,
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

let guessTheFake_MatchJoin: nkruntime.MatchJoinFunction<guessTheFake_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: guessTheFake_State,
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

      let update: guessTheFake_PlayerListMessage = {
        presences: state.presences,
        host: state.matchHost,
        isPresenter: state.hostAsPresenter,
      };
      // Send a message to the user that just joined.
      dispatcher.broadcastMessage(
        guessTheFake_OpCode.PLAYERLIST,
        JSON.stringify(update)
      );

      // Check if we must send a message to this user to update them on the current game state.
      if (state.playing) {
        // There's a game still currently in progress, the player is re-joining after a disconnect. Give them a state update.
        let update: guessTheFake_ImgMessage = {
          images: state.questions[state.currentQuestion].images,
        };

        dispatcher.broadcastMessage(
          guessTheFake_OpCode.UPDATE,
          JSON.stringify(update),
          [presence]
        );

        if (state.ticksUntilNextQuestion < 1) {
          dispatcher.broadcastMessage(
            guessTheFake_OpCode.DONE,
            JSON.stringify({}),
            [presence]
          );
        }
      } else {
        logger.debug('player %s rejoined game', presence.userId);
      }
    }

    return { state };
  };

let guessTheFake_MatchLeave: nkruntime.MatchLeaveFunction<guessTheFake_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: guessTheFake_State,
    presences: nkruntime.Presence[]
  ) {
    for (let presence of presences) {
      logger.info('Player: %s left match: %s.', presence.userId, ctx.matchId);
      state.presences[presence.userId] = null;

      if (presence.userId == state.matchHost && !state.playing) {
        dispatcher.broadcastMessage(
          guessTheFake_OpCode.LEAVE,
          JSON.stringify({})
        );
        return null;
      }
    }

    let msg: guessTheFake_PlayerListMessage = {
      presences: state.presences,
      host: state.matchHost,
      isPresenter: state.hostAsPresenter,
    };
    dispatcher.broadcastMessage(
      guessTheFake_OpCode.PLAYERLIST,
      JSON.stringify(msg)
    );

    return { state };
  };

let guessTheFake_MatchLoop: nkruntime.MatchLoopFunction<guessTheFake_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: guessTheFake_State,
    messages: nkruntime.MatchMessage[]
  ) {
    if (guessTheFake_connectedPlayers(state) + state.joinsInProgress === 0) {
      state.emptyTicks++;
      if (state.emptyTicks >= guessTheFake_MaxEmptyTicks) {
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

      state.ticksUntilNextQuestion = 0;
      state.currentQuestion = -1;
      state.countAnswers = 0;
      state.scoreboard = {};
      state.ticksShowingAnswer = 0;

      for (const message of messages) {
        switch (message.opCode) {
          case guessTheFake_OpCode.START:
            if (message.sender.userId == state.matchHost) {
              state.playing = true;

              state.label.open = 0;
              let labelJSON = JSON.stringify(state.label);
              dispatcher.matchLabelUpdate(labelJSON);
            }
            break;

          default:
        }
      }

      return { state };
    }

    if (size(state.scoreboard) < 1) {
      for (let userID in state.presences) {
        state.scoreboard[userID] = 0;
      }
    }

    state.ticksUntilNextQuestion--;

    let timer: guessTheFake_TimerMessage = {
      secondsLeft: Math.ceil(
        state.ticksUntilNextQuestion / guessTheFake_Tickrate
      ),
      timerName: 'Zeit zum Antworten: ',
    };

    if (
      state.countAnswers >=
      guessTheFake_connectedPlayers(state) - (state.hostAsPresenter ? 1 : 0)
    ) {
      state.ticksUntilNextQuestion = 0;
    }

    if (state.ticksUntilNextQuestion < 1) {
      if (state.ticksShowingAnswer >= guessTheFake_TicksShowingAnswer) {
        dispatcher.broadcastMessage(
          guessTheFake_OpCode.DONE,
          JSON.stringify({})
        );

        let update: guessTheFake_AnswerMessage = {
          answer: state.questions[state.currentQuestion].answer,
        };

        dispatcher.broadcastMessage(
          guessTheFake_OpCode.ANSWER,
          JSON.stringify(update)
        );

        if (state.hostAsPresenter) {
          state.ticksShowingAnswer = 1;
        }
      }

      timer = {
        secondsLeft: null,
        timerName: 'Warte auf Host!',
      };

      if (!state.hostAsPresenter) {
        timer = {
          secondsLeft: Math.ceil(
            state.ticksShowingAnswer / guessTheFake_Tickrate
          ),
          timerName: 'Nächste Frage in: ',
        };
        state.ticksShowingAnswer--;
      }

      if (state.ticksShowingAnswer < 1) {
        state.countAnswers = 0;

        state.ticksUntilNextQuestion = guessTheFake_MaxTicksUntilNext;
        state.ticksShowingAnswer = guessTheFake_TicksShowingAnswer;

        state.currentQuestion++;

        // Send Scoreboard
        if (state.currentQuestion > state.questions.length - 1) {
          let renderScoreboard: { [key: string]: number } = {};

          let sortable = [];
          for (let key in state.scoreboard) {
            if (state.presences[key] != null) {
              if (
                !(
                  state.presences[key].userId == state.matchHost &&
                  state.hostAsPresenter
                )
              ) {
                sortable.push([
                  state.presences[key].username,
                  state.scoreboard[key],
                ]);
              }
            }
          }

          sortable.sort(function (a: Array<any>, b: Array<any>) {
            return a[1] - b[1];
          });

          sortable.reverse();

          for (let key in sortable) {
            renderScoreboard[String(sortable[key][0])] = parseInt(
              String(sortable[key][1])
            );
          }

          let scoreboard: guessTheFake_ResultMessage = {
            results: renderScoreboard,
          };

          dispatcher.broadcastMessage(
            guessTheFake_OpCode.END,
            JSON.stringify(scoreboard)
          );

          let objectIds: nkruntime.StorageReadRequest[] = [
            {
              collection: 'workshops',
              key: 'guess_the_fake',
              userId: '00000000-0000-0000-0000-000000000000',
            },
          ];

          let objects: nkruntime.StorageObject[] = [];

          try {
            objects = nk.storageRead(objectIds);
          } catch (error) {
            logger.info('Mein Error: %q', error);
          }

          let fakeArray = objects[0].value.data.fake;

          let realArray = objects[0].value.data.real;

          state.questions = guessTheFake_BuildImgArray(fakeArray, realArray);

          state.playing = false;

          return { state };
        }

        let update: guessTheFake_ImgMessage = {
          images: state.questions[state.currentQuestion].images,
        };

        dispatcher.broadcastMessage(
          guessTheFake_OpCode.UPDATE,
          JSON.stringify(update)
        );
      }
    }

    dispatcher.broadcastMessage(
      guessTheFake_OpCode.TIMER,
      JSON.stringify(timer)
    );

    // There's a game in progresstate. Check for input, update match state, and send messages to clientstate.
    for (const message of messages) {
      switch (message.opCode) {
        case guessTheFake_OpCode.ANSWER:
          let playerMsg = JSON.parse(
            nk.binaryToString(message.data)
          ) as guessTheFake_AnswerMessage;

          state.countAnswers++;

          if (
            playerMsg.answer ==
            state.questions[state.currentQuestion].answer - 1
          ) {
            state.scoreboard[message.sender.userId]++;
          }

          let update: guessTheFake_StateMessage = {
            state: true,
          };

          dispatcher.broadcastMessage(
            guessTheFake_OpCode.CONFIRMED,
            JSON.stringify(update),
            [message.sender]
          );
          break;

        case guessTheFake_OpCode.START:
          if (
            message.sender.userId == state.matchHost &&
            state.hostAsPresenter &&
            state.ticksUntilNextQuestion < 1
          ) {
            state.ticksShowingAnswer = 0;
          }
          break;

        default:
          // No other opcodes are expected from the client, so automatically treat it as an error.
          dispatcher.broadcastMessage(guessTheFake_OpCode.REJECTED, null, [
            message.sender,
          ]);
          logger.error('Unexpected opcode received: %d', message.opCode);
      }
    }

    return { state };
  };

let guessTheFake_MatchTerminate: nkruntime.MatchTerminateFunction<guessTheFake_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: guessTheFake_State,
    graceSeconds: number
  ) {
    return { state };
  };

let guessTheFake_MatchSignal: nkruntime.MatchSignalFunction<guessTheFake_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: guessTheFake_State
  ) {
    return { state };
  };
