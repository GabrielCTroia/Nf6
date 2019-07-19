import { getModelValFor } from "../lib/util";
import { AnalysisTallyRecord, GameAnalysisRecord } from "./model";

export enum ParseExceptions {
  InvalidData,
}

export const parse = (rawAnalysis: any, gameId: string): GameAnalysisRecord => {
  if (!(rawAnalysis.hasOwnProperty('data') && rawAnalysis.data.hasOwnProperty('analysis'))) {
    throw ParseExceptions.InvalidData;
  }

  const { data } = rawAnalysis;
  const { analysis } = data;

  const dataValOr = getModelValFor(data);
  const analysisValOr = getModelValFor(analysis);

  return {
    gameId,
    arc: analysisValOr(['arc'], ''),
    openingName: analysisValOr(['book', 'name'], ''),
    playedDatetime: new Date(dataValOr(['create_date'], '')),
    totalPositions: analysisValOr(['totalPositions'], -1),
    white: {
      overallTallies: analysisValOr(['tallies', 'white'], {}) as AnalysisTallyRecord,
    },
    black: {
      overallTallies: analysisValOr(['tallies', 'black'], {}) as AnalysisTallyRecord,
    }
  }
}
