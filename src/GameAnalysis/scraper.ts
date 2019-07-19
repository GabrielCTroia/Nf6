import { fetchAsStream, saveToModelAsStream, delay, getRandom, fetchJSON } from '../lib/util';
import { gameAnalysisModel, GameAnalysisRecord } from './model';
import { parse } from './parser';
import { GameRecord } from '../Game/model';

const fetch = async (getNextGame: () => GameRecord | void): Promise<GameAnalysisRecord[] | null> => {
  const nextGame = getNextGame();

  // End the stream when there are no more games.
  if (!nextGame) {
    return null;
  }

  const url = `https://chess.com/callback/analysis/game/live/${nextGame.id}/all`;

  console.log('Fetching', url);

  return fetchJSON(url)
    .then((rawAnalysis) => parse(rawAnalysis, nextGame.id))
    .then((r) => [r]) // as array
    .catch((e) => {
      //  if (e === ParseExceptions.InvalidData) {
      //    // Be permissive on errors and let the stream run when encountering one

      //    // TODO: This might actually break the creation
      //    // This is actually where the Either<left, right> could work nicely
      //    //  io-ts I'm looking at you!
      //    // return {};
      //    // return;
      //  }

      console.log('GameAnalysis FetchError', nextGame.id, e);

      throw e;
    })
    .then(async (data) => {
      const waitSeconds = getRandom(15, 5);

      console.log(' Done.');
      console.log(` Friendly wait for ${waitSeconds} seconds!`);

      await delay(waitSeconds * 1000);

      return data;
    });
}


export const scrape = (games: GameRecord[]) => {
  var c = 0;
  const getNextGame = () => {
    if (!games[c]) {
      return undefined;
    }

    return games[c++];
  }

  return fetchAsStream(() => fetch(getNextGame))
    .pipe(saveToModelAsStream(gameAnalysisModel));
}