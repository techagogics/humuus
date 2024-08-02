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
  // Stores the votes for companys.
  companyVotes: { [userId: string]: number };
  // How long each round should last.
  roundLength: number;
  // Stores data of the current round.
  roundState: dataDecorator_RoundState;
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
  // A player voted for a company.
  VoteCompany = 7,
  // When all players voted for a company, show the result.
  ResultCompany = 8,
  // After Company result, when the round should be started.
  StartRound = 9,
  // When the minigame is supposed to be started.
  StartMinigame = 10,
  // When the round ended and players are supposed to send their score.
  RoundEnded = 11,
  // When a player reached the target in the minigame.
  TargetReached = 12,
  // A new player round result was recieved by the server.
  PlayerRoundResult = 13,
}

interface dataDecorator_UserState {
  UserId: string;
  Username: string;
  Ready: boolean;
  Position: number;
  Score: number;
  presence: nkruntime.Presence;
}

interface dataDecorator_RoundState {
  // True if players are playing a minigame.
  inMinigame: boolean;
  Round: number;
  TimeLeft: number;
  PlayersReachedTarget: string[];
}
