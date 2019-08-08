import flat from 'flat';
import R from 'ramda';
import { gameModel, GameRecord } from '../Game';
import { appendToFile, saveToFile } from '../lib/util';
import dateformat from 'dateformat'

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

const exportGameData = async (username: string) => {
  console.log('Exporting Game Data');

  const rows = gameModel.map((game) => {
    const mySide = getPlayerSide(username, game);
    const opponentSide = getOpponentSide(username, game);

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

  const filePath = [
    './exports/',
    `games_${dateformat(new Date(), 'ddmmyyyy')}.json`,
  ].join('');

  await saveToFile(filePath, rows.map((g) => JSON.stringify(g)).join('\n'));

  console.log('Finished exporting', rows.length, 'games', 'at', filePath);
}

(([username]) => {
  if (typeof username !== 'string') {
    console.log('Need your Username!')
    return;
  }

  exportGameData(username);

})(process.argv.slice(2))