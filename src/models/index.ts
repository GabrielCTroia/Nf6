import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { readEachLineAsync } from '../util';

const db = new JsonDB(new Config("db/games", true, true, '/'));

db.push('/games', {}, false);

readEachLineAsync('./db_old/games/07152019.json', async (line, i) => {
  const game = JSON.parse(line);

  // if (game.white.hasOwnProperty('accuracy')) {
  //   console.log(i, game.id);

  // }
  if (i < 7) {
    db.push(`/games/${game.id}`, {
      ...game,
      record_created_at: new Date(),
      record_updated_at: new Date(),
      // analysis: ,
    })
  }

  return;
});


// db.push("/test1", "super test");

type PlayerRecord = {
  currentRating: number;
  country: string;
  username: string;
  result: 1 | 0 | .5;
}

type GameRecord = {
  id: string;
  url: string;
  gameTime: string;
  gameType: string;
  moves: number,
  date: Date,
  players: {
    white: PlayerRecord;
    black: PlayerRecord;
  };
}

const selectGame = (id: string) => {
  try {
    return db.getData(`/games/${id}`);
  } catch {
    return null;
  }
}

const createOrUpdate = <R>(path: string, record: R) => {
  const prev = selectGame(path);

  if (prev) {
    const { __updatedAt: __prevUpdatedAt, __createdAt, prevWithoutMeta } = prev;

    const prevHash = JSON.stringify(prevWithoutMeta);
    const nextHash = JSON.stringify(record);

    db.push(path, {
      ...record,

      // Reset the updatedAt only if the hashes are different
      __updatedAt: (prevHash === nextHash) ? __prevUpdatedAt : new Date(),
    });
  } else {
    db.push(path, {
      ...record,
      __createdAt: new Date(),
      __updatedAt: new Date(),
    });
  }
}

const createGame = (record: GameRecord) => createOrUpdate(`/games/${record.id}`, record);

type AnalysisTallyRecord = {
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

type AnalysisRecord = {
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

const insertAnalysis = (gameId: string, record: AnalysisRecord) => {

}