export interface User {
  id: string;
  username: string;
  totalPoints: number;
}

export interface Statement {
  id: string;
  userId: string;
  text: string;
  isLie: boolean;
}

export interface Guess {
  id: string;
  userId: string;
  statementId: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface GameState {
  currentView:
    | "welcome"
    | "auth"
    | "create"
    | "play"
    | "result"
    | "leaderboard";
  user?: User;
  statements?: Statement[];
  currentStatementIndex?: number;
  lastGuess?: Guess;
}
