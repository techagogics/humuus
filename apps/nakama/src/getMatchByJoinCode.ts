function rpcFindMatchByJoinCode(
  context: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string {
  // Return if the send code is not equal to JOINCODE_LENGTH.
  // Or if the code is empty
  if (payload.length === 0) {
    return JSON.stringify({ success: false });
  }
  if (JSON.parse(payload).joinCode.length != JOINCODE_LENGTH) {
    return JSON.stringify({ success: false });
  }

  const joinCode = Number(JSON.parse(payload).joinCode);

  // Define what match to look for.
  const query = '+label.joinCode:' + joinCode;

  // Get the matchId of the match with the game type and invite code.
  var matches = nk.matchList(1, true, null, 0, null, query);

  let matchId;
  let matchType;
  const matchFound = matches.length > 0;
  if (matchFound) {
    matchId = matches[0].matchId;
    matchType = JSON.parse(matches[0].label).matchType;
  }

  // Return the matchId of the found match and if a match was found.
  return JSON.stringify({
    success: matchFound,
    matchId: matchId,
    matchType: matchType,
  });
}
