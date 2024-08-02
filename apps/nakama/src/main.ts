const MAX_TIME_WITHOUT_PLAYERS_IN_SEC = 60;
const JOINCODE_LENGTH = 4;

const GAMETYPE_defaultQuiz = 'defaultQuiz';
const GAMETYPE_dataDecorator = 'dataDecorator';
const GAMETYPE_sharedTextInput = 'sharedTextInput';
const GAMETYPE_guessTheFake = 'guessTheFake';

function InitModule(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  logger.info('JavaScript logic loading ...');

  initializer.registerRpc('healthcheck', rpcHealthcheck);

  initializer.registerRpc('Create_Match', rpcCreateMatch);

  initializer.registerRpc('Find_Match_By_Join_Code', rpcFindMatchByJoinCode);

  initializer.registerRpc('Get_Match_By_MatchID', rpcGetMatchByMatchID);

  initializer.registerRpc('Get_Join_Code_Length', rpcGetJoinCodeLength);

  initializer.registerMatch(GAMETYPE_sharedTextInput, {
    matchInit: sharedTextInput.MatchInit,
    matchJoinAttempt: sharedTextInput.MatchJoinAttempt,
    matchJoin: sharedTextInput.MatchJoin,
    matchLeave: sharedTextInput.MatchLeave,
    matchLoop: sharedTextInput.MatchLoop,
    matchSignal: sharedTextInput.MatchSignal,
    matchTerminate: sharedTextInput.MatchTerminate,
  });

  initializer.registerMatch(GAMETYPE_defaultQuiz, {
    matchInit: defaultQuiz.MatchInit,
    matchJoinAttempt: defaultQuiz.MatchJoinAttempt,
    matchJoin: defaultQuiz.MatchJoin,
    matchLeave: defaultQuiz.MatchLeave,
    matchLoop: defaultQuiz.MatchLoop,
    matchSignal: defaultQuiz.MatchSignal,
    matchTerminate: defaultQuiz.MatchTerminate,
  });

  initializer.registerMatch(GAMETYPE_guessTheFake, {
    matchInit: guessTheFake.MatchInit,
    matchJoinAttempt: guessTheFake.MatchJoinAttempt,
    matchJoin: guessTheFake.MatchJoin,
    matchLeave: guessTheFake.MatchLeave,
    matchLoop: guessTheFake.MatchLoop,
    matchSignal: guessTheFake.MatchSignal,
    matchTerminate: guessTheFake.MatchTerminate,
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
