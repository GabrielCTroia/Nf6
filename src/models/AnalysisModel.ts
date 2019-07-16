import { getModel } from "./database";

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
  brilliant: 0,

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
  arc: string;
  openingName: string;
  gameDatetime: Date,
  white: {
    overallTallies: AnalysisTallyRecord,
  },
  black: {
    overallTallies: AnalysisTallyRecord,
  }
}

const model = getModel('analsysis');

export const read = (gameId: string) => model.read<AnalysisRecord>(`/analysis/${gameId}`);
export const createOrUpdate = (gameId: string, record: AnalysisRecord) => model.createOrUpdate(gameId, record);
