import { getModel } from "../lib/Model";

export type AnalysisTallyRecord = {
  excellent: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
  forced: number;
  book: number;
  missedMate: number;
  fasterMate: number;
  winningToLosing: number;
  missedWin: number;
  critical: number;
  brilliant: number;

  // Others
  blunderGP0: number;
  missedWinGP0: number;
  mistakeGP0: number;
  inaccuracyGP0: number;
  blunderGP1: number;
  missedWinGP1: number;
  mistakeGP1: number;
  inaccuracyGP1: number;
  blunderGP2: number;
  missedWinGP2: number;
  mistakeGP2: number;
  inaccuracyGP2: number;
}

export type AnalysisRecord = {
  gameId: string;
  arc: string;
  openingName: string;

  // TODO: I believe this is Played Time not Analysis but need to check for sure!
  playedDatetime: Date,
  // movesCount: number;
  white: {
    overallTallies: AnalysisTallyRecord,
  },
  black: {
    overallTallies: AnalysisTallyRecord,
  }
}
 
export const model = getModel<AnalysisRecord>({
  name: 'gameAnalsysis',
  keyExtractor: (r) => r.gameId,
});
