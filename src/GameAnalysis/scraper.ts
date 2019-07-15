import request from 'request';
import { saveToFile, delay, readEachLineAsync } from '../util';

const req = (gameId: string) => {
  console.log('Url', `https://chess.com/callback/analysis/game/live/${gameId}/all`);

  request({
    url: `https://chess.com/callback/analysis/game/live/${gameId}/all`,
    method: 'GET',
    followAllRedirects: true,
  }, async (error, res) => {
    if (error) {
      console.log('Error', error);
      return;
    }
    
    await saveToFile(`./data/games/${gameId}.json`, res.body)

    console.log('  - done');
  });
}

readEachLineAsync('./data/all_games_07152019.json', async (line, i) => {
  const game = JSON.parse(line);

  if (game.white.hasOwnProperty('accuracy')) {
    console.log(i, game.id);

    req(game.id);

    const waitTimeSeconds = 5 + Math.floor(Math.random() * 5);
    
    console.log(`Wait ${waitTimeSeconds}s`);
    await delay(waitTimeSeconds * 1000);
  }

  return;
});
