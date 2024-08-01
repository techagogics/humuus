const dataDecorator_Tickrate = 10;
const dataDecorator_MaxEmptyTicks =
  MAX_TIME_WITHOUT_PLAYERS_IN_SEC * dataDecorator_Tickrate;

let dataDecorator_MatchInit: nkruntime.MatchInitFunction<dataDecorator_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: string }
  ) {
    let label: MatchLabel = {
      matchType: GAMETYPE_dataDecorator,
      open: 1,
      joinCode: Number(params['joinCode']),
    };

    logger.info('Match label: ' + JSON.stringify(label));

    let state: dataDecorator_State = {
      label: label,
      emptyTicks: 0,
      owner: params['creator'],
      playing: false,
      playerStates: {},
      companyVotes: {},
    };

    return {
      state,
      tickRate: dataDecorator_Tickrate,
      label: JSON.stringify(label),
    };
  };

let dataDecorator_MatchJoinAttempt: nkruntime.MatchJoinAttemptFunction<dataDecorator_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: dataDecorator_State,
    presence: nkruntime.Presence,
    metadata: { [key: string]: any }
  ) {
    return {
      state,
      accept: state.label.open == 1,
    };
  };

let dataDecorator_MatchJoin: nkruntime.MatchJoinFunction<dataDecorator_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: dataDecorator_State,
    presences: nkruntime.Presence[]
  ) {
    presences.forEach(function (presence) {
      //state.presences[presence.userId] = presence;
      const playerState: dataDecorator_UserState = {
        UserId: presence.userId,
        Username: presence.username,
        Position: Object.keys(state.playerStates).length,
        Ready: false,
        presence: presence,
      };
      state.playerStates[presence.userId] = playerState;
      logger.debug('%q joined Lobby match', presence.userId);
    });

    return { state };
  };

let dataDecorator_MatchLeave: nkruntime.MatchLeaveFunction<dataDecorator_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: dataDecorator_State,
    presences: nkruntime.Presence[]
  ) {
    // Remove player from presences and terminate match if owner leaves.
    presences.forEach(function (presence) {
      const listItem = state.playerStates[presence.userId];
      const pos: number = listItem.Position;
      if (pos < Object.keys(state.playerStates).length - 1) {
        Object.keys(state.playerStates).forEach((userId) => {
          var player = state.playerStates[userId];
          if (player.Position > pos) {
            player.Position--;
            state.playerStates[userId] = player;
          }
        });
      }
      //delete state.presences[presence.userId];
      delete state.playerStates[presence.userId];
      logger.debug('%q left Lobby match', presence.userId);
      if (presence.userId == state.owner) {
        state.owner = '';
      }
    });

    return { state };
  };

let dataDecorator_MatchLoop: nkruntime.MatchLoopFunction<dataDecorator_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: dataDecorator_State,
    messages: nkruntime.MatchMessage[]
  ) {
    messages.forEach(function (message) {
      switch (message.opCode) {
        case dataDecorator_OpCodes.GetOwner:
          dispatcher.broadcastMessage(
            dataDecorator_OpCodes.GetOwner,
            state.owner,
            [message.sender],
            null
          );
          break;
        case dataDecorator_OpCodes.SetReady:
          const ready: boolean = nk.binaryToString(message.data) == 'True';
          state.playerStates[message.sender.userId].Ready = ready;
          dispatcher.broadcastMessage(
            dataDecorator_OpCodes.SetReady,
            String(ready),
            null,
            message.sender
          );
          break;
        case dataDecorator_OpCodes.GetPlayer:
          dispatcher.broadcastMessage(
            message.opCode,
            JSON.stringify(state.playerStates),
            [message.sender],
            null
          );
          break;
        case dataDecorator_OpCodes.StartMatch:
          dataDecorator_startMatch(dispatcher, logger, state, message, nk);
          break;
        case dataDecorator_OpCodes.Message:
          dataDecorator_messageRecieved(dispatcher, logger, state, message, nk);
          break;
        case dataDecorator_OpCodes.VoteCompany:
          dataDecorator_VoteCompany(dispatcher, logger, state, message, nk);
          break;
        case dataDecorator_OpCodes.ResultCompany:
          if (message.sender.userId == state.owner) {
            dataDecorator_CompanyResult(dispatcher, logger, state, message, nk);
          }
          break;
        case dataDecorator_OpCodes.StartMinigame:
          dataDecorator_StartMinigame(dispatcher, logger, state, message, nk);
          break;
        default:
          dispatcher.broadcastMessage(
            message.opCode,
            message.data,
            null,
            message.sender
          );
      }
    });

    if (state.owner == '') {
      dataDecorator_closeMatch(dispatcher, logger, state);
      return null;
    }

    if (Object.keys(state.playerStates).length === 0) {
      state.emptyTicks++;
      if (state.emptyTicks >= dataDecorator_MaxEmptyTicks) {
        // Match has been empty for too long, close it.
        logger.info(`Terminating idle match of type: ${state.label.matchType}`);
        return null;
      }
    } else {
      state.emptyTicks = 0;
    }

    return { state };
  };

let dataDecorator_MatchTerminate: nkruntime.MatchTerminateFunction<dataDecorator_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: dataDecorator_State,
    graceSeconds: number
  ) {
    dataDecorator_closeMatch(dispatcher, logger, state);
    return { state };
  };

let dataDecorator_MatchSignal: nkruntime.MatchSignalFunction<dataDecorator_State> =
  function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: dataDecorator_State
  ) {
    return { state };
  };

function dataDecorator_closeMatch(
  dispatcher: nkruntime.MatchDispatcher,
  logger: nkruntime.Logger,
  state: dataDecorator_State
) {
  logger.info(
    `Sending match terminating message to players of type: ${state.label.matchType}`
  );
  dispatcher.broadcastMessage(
    dataDecorator_OpCodes.MatchTerminate,
    '',
    null,
    null
  );
}
/* Old Match starting code
function dataDecorator_startMatch(
  dispatcher: nkruntime.MatchDispatcher,
  logger: nkruntime.Logger,
  state: dataDecorator_State,
  message: nkruntime.MatchMessage,
  nk: nkruntime.Nakama
) {
  if (message.sender.userId != state.owner) {
    return;
  }

  logger.info('Minigame message: ' + nk.binaryToString(message.data));
  const minigames: string[] = JSON.parse(nk.binaryToString(message.data));
  var usedMinigames = minigames;

  const allReady = Object.keys(state.playerStates).every(
    (userId) => state.playerStates[userId].Ready
  );
  if (!allReady) {
    return;
  }

  Object.keys(state.playerStates).forEach(function (userId) {
    const playerState = state.playerStates[userId];
    const miniGameIndex = (Math.random() * usedMinigames.length) | 0;
    var minigame = usedMinigames[miniGameIndex];
    delete usedMinigames[miniGameIndex];
    if (usedMinigames.length == 0) {
      usedMinigames = minigames;
    }
    dispatcher.broadcastMessage(
      dataDecorator_OpCodes.StartMatch,
      minigame,
      [playerState.presence],
      null
    );
  });
  state.playing = true;
  state.label.open = 0;

  logger.info(`Match started of type: ${state.label.matchType}`);
}*/

function dataDecorator_startMatch(
  dispatcher: nkruntime.MatchDispatcher,
  logger: nkruntime.Logger,
  state: dataDecorator_State,
  message: nkruntime.MatchMessage,
  nk: nkruntime.Nakama
) {
  if (message.sender.userId != state.owner) {
    return;
  }

  const allReady = Object.keys(state.playerStates).every(
    (userId) => state.playerStates[userId].Ready
  );
  if (!allReady) {
    return;
  }

  dispatcher.broadcastMessage(dataDecorator_OpCodes.StartMatch, '', null, null);
  state.playing = true;
  state.label.open = 0;

  logger.info(`Match started of type: ${state.label.matchType}`);
}

function dataDecorator_messageRecieved(
  dispatcher: nkruntime.MatchDispatcher,
  logger: nkruntime.Logger,
  state: dataDecorator_State,
  message: nkruntime.MatchMessage,
  nk: nkruntime.Nakama
) {
  logger.info(`Recieved message: ${nk.binaryToString(message.data)}`);
  var posiblePlayers = JSON.parse(JSON.stringify(state.playerStates));
  delete posiblePlayers[message.sender.userId];
  const posiblePlayersIds = Object.keys(posiblePlayers);
  const posiblePlayersLength = posiblePlayersIds.length;
  if (posiblePlayersLength <= 0) {
    return;
  }
  dispatcher.broadcastMessage(
    dataDecorator_OpCodes.Message,
    message.data,
    [
      posiblePlayers[
        posiblePlayersIds[(Math.random() * posiblePlayersLength) | 0]
      ].presence,
    ],
    null
  );
}

function dataDecorator_VoteCompany(
  dispatcher: nkruntime.MatchDispatcher,
  logger: nkruntime.Logger,
  state: dataDecorator_State,
  message: nkruntime.MatchMessage,
  nk: nkruntime.Nakama
) {
  let playerVote: number;
  try {
    playerVote = JSON.parse(nk.binaryToString(message.data));
  } catch {
    return;
  }
  state.companyVotes[message.sender.userId] = playerVote;
  dispatcher.broadcastMessage(
    dataDecorator_OpCodes.VoteCompany,
    playerVote.toString(),
    null,
    message.sender
  );
  if (
    Object.keys(state.companyVotes).length >=
    Object.keys(state.playerStates).length
  ) {
    dataDecorator_CompanyResult(dispatcher, logger, state, message, nk);
  }
}

function dataDecorator_CompanyResult(
  dispatcher: nkruntime.MatchDispatcher,
  logger: nkruntime.Logger,
  state: dataDecorator_State,
  message: nkruntime.MatchMessage,
  nk: nkruntime.Nakama
) {
  const voteCounts: { [vote: number]: number } = {};
  for (let userId in state.companyVotes) {
    if (state.companyVotes.hasOwnProperty(userId)) {
      let vote = state.companyVotes[userId];
      if (voteCounts[vote] == null) {
        voteCounts[vote] = 0;
      }
      voteCounts[vote]++;
    }
  }

  let mostVotedCompany: number = 0;
  let highestVoteCount = 0;

  for (let vote in voteCounts) {
    if (voteCounts.hasOwnProperty(vote)) {
      if (voteCounts[vote] > highestVoteCount) {
        highestVoteCount = voteCounts[vote];
        mostVotedCompany = parseInt(vote, 10);
      }
    }
  }

  dispatcher.broadcastMessage(
    dataDecorator_OpCodes.ResultCompany,
    mostVotedCompany.toString(),
    null,
    null
  );
}

function dataDecorator_StartMinigame(
  dispatcher: nkruntime.MatchDispatcher,
  logger: nkruntime.Logger,
  state: dataDecorator_State,
  message: nkruntime.MatchMessage,
  nk: nkruntime.Nakama
) {
  if (message.sender.userId != state.owner) {
    return;
  }

  const minigames: string[] = JSON.parse(nk.binaryToString(message.data));
  var usedMinigames = minigames;

  Object.keys(state.playerStates).forEach(function (userId) {
    const playerState = state.playerStates[userId];
    const miniGameIndex = (Math.random() * usedMinigames.length) | 0;
    var minigame = usedMinigames[miniGameIndex];
    delete usedMinigames[miniGameIndex];
    if (usedMinigames.length == 0) {
      usedMinigames = minigames;
    }
    dispatcher.broadcastMessage(
      dataDecorator_OpCodes.StartMinigame,
      minigame,
      [playerState.presence],
      null
    );
  });
  logger.info(`Minigame started of type: ${state.label.matchType}`);
}
