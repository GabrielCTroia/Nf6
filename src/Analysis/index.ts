import { getModelValFor } from "../util";
import { AnalysisTallyRecord } from "../models/AnalysisModel";

export const parse = (rawAnalysis: any) => {
  const { data } = rawAnalysis;
  const { analysis } = data;

  const dataValOr = getModelValFor(data);
  const analysisValOr = getModelValFor(analysis);

  return {
    arc: analysisValOr(['arc'], ''),
    openingName: analysisValOr(['book', 'name'], ''),
    gameDatetime: new Date(dataValOr(['create_date'], '')),
    movesCount: analysisValOr(['totalPositions'], -1),
    white: {
      overallTallies: analysisValOr(['tallies', 'white'], {}) as AnalysisTallyRecord,
    },
    black: {
      overallTallies: analysisValOr(['tallies', 'black'], {}) as AnalysisTallyRecord,
    }
  }
}
