function rpcGetMatchByMatchID(
  context: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string {
  let matchId = JSON.parse(payload).matchID;

  let match;
  try {
    match = nk.matchGet(matchId);
  } catch (error) {
    return '';
  }

  if (match == undefined) {
    return '';
  }

  let matchType = JSON.parse(match.label).matchType;

  return JSON.stringify({ url: '/' + matchType + '/' + matchId });
}
