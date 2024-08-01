function rpcGetJoinCodeLength(
  context: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string {

  // The required length of the join code.
  return JSON.stringify({
    success: true,
    codeLength: JOINCODE_LENGTH,
  });
}
