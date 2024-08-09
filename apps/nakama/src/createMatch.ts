function rpcCreateMatch(
  context: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string {
  // Return if no match type in payload
  if (payload.length === 0) {
    return JSON.stringify({ success: false });
  }

  let matchType = JSON.parse(payload).matchType;
  let workshopKey = JSON.parse(payload).workshopKey;

  // Creating a random join code that isn't used by a match yet.
  let isUniqueCode = false;
  let randomCode;

  const minCode = Math.pow(10, JOINCODE_LENGTH - 1);
  let maxCodeString: string = '';
  for (let i = 0; i < JOINCODE_LENGTH; i++) {
    maxCodeString += '9';
  }
  const maxCode = Number(maxCodeString);

  while (!isUniqueCode) {
    randomCode = Math.floor(minCode + Math.random() * (maxCode - minCode + 1));
    const matches = nk.matchList(1, true, randomCode.toString(), 0, 10);
    if (matches.length === 0) {
      isUniqueCode = true;
    }
  }

  // Try to create a match and return success with match id.
  try {
    let matchId = nk.matchCreate(matchType, {
      joinCode: randomCode,
      creator: context.userId,
      workshopKey: workshopKey,
    });
    return JSON.stringify({
      success: true,
      id: matchId,
      joinCode: randomCode,
      matchType: matchType,
    });
  } catch (err) {
    logger.error(`Error creating match for ${matchType}: ${err}`);
    return JSON.stringify({ success: false });
  }
}
