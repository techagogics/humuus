// ---------------------------- State ---------------------------- //

interface dataDecorator_State {
  // Match label
  label: MatchLabel;
  // Ticks where no actions have occurred.
  emptyTicks: number;
  // Currently connected users.
  playerStates: { [userId: string]: dataDecorator_UserState };
  // User that created the match.
  owner: string;
  // True if there's a game currently in progress.
  playing: boolean;
}

enum dataDecorator_OpCodes {
  // When a player changed his name.
  NameChanged = 0,
  // When a player want's to get the owner of the match.
  GetOwner = 1,
  // When match has been terminated.
  MatchTerminate = 2,
  // When player wants to set if he is ready.
  SetReady = 3,
  // When player want's to get the player states in the match.
  GetPlayer = 4,
  // Game Owner requested to start the match.
  StartMatch = 5,
  // A player wants to send a message to another game.
  Message = 6,
}

interface dataDecorator_UserState {
  UserId: string;
  Username: string;
  Ready: boolean;
  Position: number;
  presence: nkruntime.Presence;
}

interface dataDecorator_UserSendState {
  UserId: string;
  Username: string;
  Ready: boolean;
  Position: number;
}
