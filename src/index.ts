import { delay, asyncIterate, forEachAsync, appendToFile, getModelValFor, readEachLineAsync } from "./lib/util";
// import { gameModel } from "./Game/model";
import { readFileSync } from "fs";
import * as Analysis from "./GameAnalysis";
// import { GameRecord } from "./Game";
import flat from 'flat';
import R from 'ramda';
import { Readable } from "stream";
import through2 = require("through2");
import { GameRecord, startScrapingStream, gameModel } from './Game';
import { scrape } from "./Game/scraper";

// console.log('');
// console.log('');
// console.log('Nothing to do here. Check the following commands:')
// console.log('');
// console.log('For Archived Games:', `$ ts-node-dev --pretty --transpileOnly ./src/archivedGames.ts`)
// console.log('For Games:', `$ ts-node-dev --pretty --transpileOnly ./src/archivedGames.ts`)
// console.log('Archived Games', 'run', `ts-node-dev --pretty --transpileOnly ./src/archivedGames.ts`)


//// Script to update all games from old db to new

// readEachLineAsync('./db_old/games/07152019.json', async (line, i) => {
//   const rawGame = JSON.parse(line);

//   const valOr = getModelValFor(rawGame);

//   const game = {
//     id: valOr(['id'], ''),
//     url: valOr(['url'], ''),
//     gameTime: valOr(['gameTime'], ''),
//     gameType: valOr(['gameType'], ''),
//     moves: valOr(['moves'], 0),
//     date: valOr(['date'], new Date()),
//     players: {
//       white: {
//         currentRating: valOr(['white', 'currentRating'], 0),
//         country: valOr(['white', 'country'], ''),
//         username: valOr(['white', 'user'], ''),
//         result: valOr<'0'>(['white', 'result'], '0'),
//         accuracy: valOr(['white', 'accuracy'], -1),
//       },
//       black: {
//         currentRating: valOr(['black', 'currentRating'], 0),
//         country: valOr(['black', 'country'], ''),
//         username: valOr(['black', 'user'], ''),
//         result: valOr<'0'>(['black', 'result'], '0'),
//         accuracy: valOr(['black', 'accuracy'], -1),
//       }
//     }
//   };

//   console.log(i, game);

//   return gameModel.createOrUpdate(game);
// });

// console.log('it\'s async')

// async function updateAnalysis() {
//   const gamesWithAnalysis = gameModel.filter((game) => game.players.white.accuracy > -1);

//   // const iterator = asyncIterate(gamesWithAnalysis, async (g) => {
//   //   const jsonString = readFileSync(`./db_old/analysis/${g.id}.json`, {
//   //     encoding: 'utf-8'
//   //   });

//   //   const rawAnalysis = JSON.parse(jsonString);

//   //   // return rawAnalysis;
//   //   return Analysis.parse(rawAnalysis);
//   // });

//   // var x = 0;
//   // for await (let i of gamesWithAnalysis[Symbol.iterator]()) {
//   //   console.log(i);

//   //   await delay(10);
//   // }

//   forEachAsync(async (game) => {
//     // console.log(item);

//     const jsonString = readFileSync(`./db_old/analysis/${game.id}.json`, {
//       encoding: 'utf-8'
//     });

//     const rawAnalysis = JSON.parse(jsonString);

//     const analysis = Analysis.parse(rawAnalysis);

//     const me = 'gctroia';



//     analysisModel.createOrUpdate({
//       gameId: game.id,
//       ...analysis,
//     });

//     await delay(10);
//   }, gamesWithAnalysis);
// }

// updateAnalysis();

const me = 'gctroia';

const getPlayerSide = (username: string, game: GameRecord): 'white' | 'black' => {
  if (game.players.white.username === username) {
    return 'white';
  } else if (game.players.black.username === username) {
    return 'black';
  }

  throw new Error(`Invalid Player ${username} for game ${game.id}`);
}

const getOpponentSide = (username: string, game: GameRecord): 'white' | 'black' => {
  if (game.players.white.username === username) {
    return 'black';
  } else if (game.players.black.username === username) {
    return 'white';
  }

  throw new Error(`Invalid Player ${username} for game ${game.id}`);
}

const exportAnalsysisData = () => {
  console.log('exporting data');

  const rows = analysisModel.map((analysis) => {
    const game = gameModel.read(analysis.gameId);

    if (game) {
      const mySide = getPlayerSide(me, game);
      const opponentSide = getOpponentSide(me, game);

      return flat({
        id: game.id,
        gameTime: game.gameTime,
        gameType: game.gameType,
        gameDateTime: analysis.gameDatetime,
        moves: game.moves,

        myAnalysis: {
          // ...analysis[mySide],
          ...game.players[mySide],
        },
        opponentAnalysis: {
          // ...analysis[opponentSide],
          ...game.players[opponentSide],
        },

        // ...game,
        // ...analysis,
      });
    }
  });

  // console.log(rows);
  // console.log(rows.map((g) => JSON.stringify(g)));
  appendToFile('./exports/analysis_16072019.json', rows.map((g) => JSON.stringify(g)).join('\n'));
}

const exportGameData = () => {
  console.log('exporting game data');

  const rows = gameModel.map((game) => {
    const mySide = getPlayerSide(me, game);
    const opponentSide = getOpponentSide(me, game);

    const { players, ...rest } = game;

    return R.omit(['__createdAt', '__updatedAt'], flat({
      ...rest,
      me: {
        color: mySide,
        ...players[mySide],
      },
      oponnent: {
        color: opponentSide,
        ...players[opponentSide],
      }
    }));
  });

  appendToFile('./exports/all_games_17072019.json', rows.map((g) => JSON.stringify(g)).join('\n'));
}

// exportGameData();

// exportData();


// export const scrape = (user: string, withPagination = true) => {
//   const stream = new Readable({
//     objectMode: true,
//     read() {
//       console.log('just read');
//     }
//   });

//   stream._read = () => {
//     console.log('yes _read');
//     console.log('wait 2s');

//     setTimeout(() => {
//       stream.push({ time: new Date().getSeconds() });
//     }, 2 * 1000);
//   }

//   // setInterval(() => {
//   //   stream.push({ time: new Date() });
//   // }, 100);

//   return stream;
// }

// const stream = scrape('s');

//   stream.pipe(through2.obj((chunk, _, next) => {
//     console.log(chunk);

//     // if (chunk.time > 30) {
//     //   stream.pause();
//     // }

//     next();
//   }));

const stream = scrape('gctroia');

stream.pipe(through2.obj((chunk, _, next) => {
  console.log(chunk.length);

  next();
}));

// stream.on('end', function () {
//   console.log('There will be no more data.');

// });

