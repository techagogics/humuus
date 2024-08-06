const MAX_TIME_WITHOUT_PLAYERS_IN_SEC = 60;
const JOINCODE_LENGTH = 4;

const GAMETYPE_defaultQuiz = 'defaultQuiz';
const GAMETYPE_dataDecorator = 'dataDecorator';
const GAMETYPE_sharedTextInput = 'sharedTextInput';
const GAMETYPE_guessTheFake = 'guessTheFake';

const GAMETYPE_workshop = 'workshop';

function InitModule(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  logger.info('JavaScript logic loading ...');

  initializer.registerRpc('healthcheck', rpcHealthcheck);

  initializer.registerRpc('Storage_API', rpcStorageAPI);

  initializer.registerRpc('Create_Match', rpcCreateMatch);

  initializer.registerRpc('Find_Match_By_Join_Code', rpcFindMatchByJoinCode);

  initializer.registerRpc('Get_Match_By_MatchID', rpcGetMatchByMatchID);

  initializer.registerRpc('Get_Join_Code_Length', rpcGetJoinCodeLength);

  initializer.registerMatch(GAMETYPE_workshop, {
    matchInit: workshop_MatchInit,
    matchJoinAttempt: workshop_MatchJoinAttempt,
    matchJoin: workshop_MatchJoin,
    matchLeave: workshop_MatchLeave,
    matchLoop: workshop_MatchLoop,
    matchSignal: workshop_MatchSignal,
    matchTerminate: workshop_MatchTerminate,
  });

  initializer.registerMatch(GAMETYPE_sharedTextInput, {
    matchInit: sharedTextInput_MatchInit,
    matchJoinAttempt: sharedTextInput_MatchJoinAttempt,
    matchJoin: sharedTextInput_MatchJoin,
    matchLeave: sharedTextInput_MatchLeave,
    matchLoop: sharedTextInput_MatchLoop,
    matchSignal: sharedTextInput_MatchSignal,
    matchTerminate: sharedTextInput_MatchTerminate,
  });

  initializer.registerMatch(GAMETYPE_defaultQuiz, {
    matchInit: defaultQuiz_MatchInit,
    matchJoinAttempt: defaultQuiz_MatchJoinAttempt,
    matchJoin: defaultQuiz_MatchJoin,
    matchLeave: defaultQuiz_MatchLeave,
    matchLoop: defaultQuiz_MatchLoop,
    matchSignal: defaultQuiz_MatchSignal,
    matchTerminate: defaultQuiz_MatchTerminate,
  });

  initializer.registerMatch(GAMETYPE_guessTheFake, {
    matchInit: guessTheFake_MatchInit,
    matchJoinAttempt: guessTheFake_MatchJoinAttempt,
    matchJoin: guessTheFake_MatchJoin,
    matchLeave: guessTheFake_MatchLeave,
    matchLoop: guessTheFake_MatchLoop,
    matchSignal: guessTheFake_MatchSignal,
    matchTerminate: guessTheFake_MatchTerminate,
  });

  initializer.registerMatch(GAMETYPE_dataDecorator, {
    matchInit: dataDecorator_MatchInit,
    matchJoinAttempt: dataDecorator_MatchJoinAttempt,
    matchJoin: dataDecorator_MatchJoin,
    matchLeave: dataDecorator_MatchLeave,
    matchLoop: dataDecorator_MatchLoop,
    matchSignal: dataDecorator_MatchSignal,
    matchTerminate: dataDecorator_MatchTerminate,
  });

  logger.info('JavaScript logic loaded!');
}
