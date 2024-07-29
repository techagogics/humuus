let rpcFindMatch: nkruntime.RpcFunction = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string {
  if (!ctx.userId) {
    throw Error('No user ID in context');
  }

  if (!payload) {
    throw Error('Expects payload.');
  }

  let request = {} as RpcFindMatchRequest;
  try {
    request = JSON.parse(payload);
  } catch (error) {
    logger.error('Error parsing json message: %q', error);
    throw error;
  }

  let matches: nkruntime.Match[];
  try {
    const query = '+label.open:1';
    matches = nk.matchList(10, true, null, null, 1, query);
  } catch (error) {
    logger.error('Error listing matches: %v', error);
    throw error;
  }

  let matchIds: string[] = [];
  if (matches.length > 0) {
    // There are one or more ongoing matches the user could join.
    matchIds = matches.map((m) => m.matchId);
  } else {
    // No available matches found, create a new one.
    try {
      matchIds.push(nk.matchCreate(MODULE_ID_GUESS_THE_FAKE));
    } catch (error) {
      logger.error('Error creating match: %v', error);
      throw error;
    }
  }

  let res: RpcFindMatchResponse = { matchIds };
  return JSON.stringify(res);
};

// Payload for an RPC response containing match IDs the user can join.
interface RpcFindMatchResponse {
  // One or more matches that fit the user's request.
  matchIds: string[];
}

// Payload for an RPC request to find a match.
interface RpcFindMatchRequest {
  // User can choose a fast or normal speed match.
  /* fast: boolean */
  // User can choose whether to play with AI
  /* ai?: boolean */
}
