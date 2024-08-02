namespace guessTheFake {
  const Tickrate = 5;
  const MaxEmptyTicks = MAX_TIME_WITHOUT_PLAYERS_IN_SEC * Tickrate;

  const TicksShowingAnswer = 5 * Tickrate;

  const MaxTicksUntilNext = 20 * Tickrate;

  export let MatchInit: nkruntime.MatchInitFunction<State> = function (
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

    let state: State = {
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

    state.questions = BuildImgArray();

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

  export let MatchJoin: nkruntime.MatchJoinFunction<State> = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: State,
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

      let update: PlayerListMessage = {
        presences: state.presences,
        host: state.matchHost,
        isPresenter: state.hostAsPresenter,
      };
      // Send a message to the user that just joined.
      dispatcher.broadcastMessage(OpCode.PLAYERLIST, JSON.stringify(update));

      // Check if we must send a message to this user to update them on the current game state.
      if (state.playing) {
        // There's a game still currently in progress, the player is re-joining after a disconnect. Give them a state update.
        let update: ImgMessage = {
          images: state.questions[state.currentQuestion].images,
        };

        dispatcher.broadcastMessage(OpCode.UPDATE, JSON.stringify(update), [
          presence,
        ]);

        if (state.ticksUntilNextQuestion < 1) {
          dispatcher.broadcastMessage(OpCode.DONE, JSON.stringify({}), [
            presence,
          ]);
        }
      } else {
        logger.debug('player %s rejoined game', presence.userId);
      }
    }

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
    for (let presence of presences) {
      logger.info('Player: %s left match: %s.', presence.userId, ctx.matchId);
      state.presences[presence.userId] = null;

      if (presence.userId == state.matchHost && !state.playing) {
        dispatcher.broadcastMessage(OpCode.LEAVE, JSON.stringify({}));
        return null;
      }
    }

    let msg: PlayerListMessage = {
      presences: state.presences,
      host: state.matchHost,
      isPresenter: state.hostAsPresenter,
    };
    dispatcher.broadcastMessage(OpCode.PLAYERLIST, JSON.stringify(msg));

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
          case OpCode.START:
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

    let timer: TimerMessage = {
      secondsLeft: Math.ceil(state.ticksUntilNextQuestion / Tickrate),
      timerName: 'Zeit zum Antworten: ',
    };

    if (
      state.countAnswers >=
      connectedPlayers(state) - (state.hostAsPresenter ? 1 : 0)
    ) {
      state.ticksUntilNextQuestion = 0;
    }

    if (state.ticksUntilNextQuestion < 1) {
      if (state.ticksShowingAnswer >= TicksShowingAnswer) {
        dispatcher.broadcastMessage(OpCode.DONE, JSON.stringify({}));

        let update: AnswerMessage = {
          answer: state.questions[state.currentQuestion].answer,
        };

        dispatcher.broadcastMessage(OpCode.ANSWER, JSON.stringify(update));

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
          secondsLeft: Math.ceil(state.ticksShowingAnswer / Tickrate),
          timerName: 'Nächste Frage in: ',
        };
        state.ticksShowingAnswer--;
      }

      if (state.ticksShowingAnswer < 1) {
        state.countAnswers = 0;

        state.ticksUntilNextQuestion = MaxTicksUntilNext;
        state.ticksShowingAnswer = TicksShowingAnswer;

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

          let scoreboard: ResultMessage = {
            results: renderScoreboard,
          };

          dispatcher.broadcastMessage(OpCode.END, JSON.stringify(scoreboard));

          state.questions = BuildImgArray();

          state.playing = false;

          return { state };
        }

        let update: ImgMessage = {
          images: state.questions[state.currentQuestion].images,
        };

        dispatcher.broadcastMessage(OpCode.UPDATE, JSON.stringify(update));
      }
    }

    dispatcher.broadcastMessage(OpCode.TIMER, JSON.stringify(timer));

    // There's a game in progresstate. Check for input, update match state, and send messages to clientstate.
    for (const message of messages) {
      switch (message.opCode) {
        case OpCode.ANSWER:
          let playerMsg = JSON.parse(
            nk.binaryToString(message.data)
          ) as AnswerMessage;

          state.countAnswers++;

          if (
            playerMsg.answer ==
            state.questions[state.currentQuestion].answer - 1
          ) {
            state.scoreboard[message.sender.userId]++;
          }

          let update: StateMessage = {
            state: true,
          };

          dispatcher.broadcastMessage(
            OpCode.CONFIRMED,
            JSON.stringify(update),
            [message.sender]
          );
          break;

        case OpCode.START:
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
