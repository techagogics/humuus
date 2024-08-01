/* eslint-disable no-unused-vars */

// Match Types are the names of the registered Matches in the Nakama backend
// the MatchTypes are used to start a new Match with the startMatch(matchType: string) function

export enum GameType {
  defaultQuiz = 'defaultQuiz',
  dataDecorator = 'dataDecorator',
  sharedTextInput = 'sharedTextInput',
  guessTheFake = 'guessTheFake',
}
