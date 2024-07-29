const RPC_ID_HEALTCHCHECK = 'healthcheck';
const RPC_ID_FIND_MATCH = 'find_match';

function InitModule(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
) {
  logger.info('JavaScript logic loading ...');

  initializer.registerRpc(RPC_ID_HEALTCHCHECK, rpcHealthcheck);
  initializer.registerRpc(RPC_ID_FIND_MATCH, rpcFindMatch);

  initializer.registerMatch(MODULE_ID_GUESS_THE_FAKE, {
    matchInit,
    matchJoinAttempt,
    matchJoin,
    matchLeave,
    matchLoop,
    matchTerminate,
    matchSignal,
  });

  logger.info('JavaScript logic loaded!');
}
