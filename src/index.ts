import { delay, asyncIterate, forEachAsync } from "./util";
import { gameModel, analysisModel } from "./models";
import { readFileSync } from "fs";
import * as Analysis from "./Analysis";

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
//     gameType: valOr(['gametype'], ''),
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

//   return gameModel.createOrUpdate(game);
// });

// console.log('it\'s async')

async function updateAnalysis() {
  const gamesWithAnalysis = gameModel.filter((game) => game.players.white.accuracy > -1);

  // const iterator = asyncIterate(gamesWithAnalysis, async (g) => {
  //   const jsonString = readFileSync(`./db_old/analysis/${g.id}.json`, {
  //     encoding: 'utf-8'
  //   });

  //   const rawAnalysis = JSON.parse(jsonString);

  //   // return rawAnalysis;
  //   return Analysis.parse(rawAnalysis);
  // });

  // var x = 0;
  // for await (let i of gamesWithAnalysis[Symbol.iterator]()) {
  //   console.log(i);

  //   await delay(10);
  // }

  forEachAsync(async (game) => {
    // console.log(item);

    const jsonString = readFileSync(`./db_old/analysis/${game.id}.json`, {
      encoding: 'utf-8'
    });

    const rawAnalysis = JSON.parse(jsonString);

    const analysis = Analysis.parse(rawAnalysis);

    analysisModel.createOrUpdate({
      gameId: game.id,
      ...analysis,
    });

    await delay(10);
  }, gamesWithAnalysis);
}

updateAnalysis();
