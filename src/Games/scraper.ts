import { Page } from 'puppeteer';
import { parseArchivedGames } from './parser';
import { appendToFile, readFromHttp, delay } from '../util';

async function getPageBody(page: Page, { selector, timeout = 5 * 1000 }: {
  selector: string;
  timeout?: number,
}) {
  try {
    await page.waitForSelector(selector, { timeout });
  } catch (e) {
    if (e.name === 'TimeoutError') {
      throw new Error('Done');
    }

    throw (e);
  }

  return await page.evaluate(() => {
    const body = document.querySelector('body');

    return body ? body.innerHTML : '';
  });
}

const onPageReady = async (page: Page) => {
  const body = await getPageBody(page, { selector: '.post-view-meta-rating' });

  const games = parseArchivedGames(body);

  await appendToFile('./data/archived_games.json', games.map((g) => JSON.stringify(g)).join('\n'));
}


const withPagination = (getUrl: (page: number) => string, onEachPageReady: (page: Page) => Promise<void>, currentPage = 1) => {
  (async function go(currentPage) {
    const url = getUrl(currentPage);

    try {
      await readFromHttp(url, onEachPageReady);

      console.log('Wait 5s');
      await delay(5 * 1000);

      go(currentPage + 1);
    } catch (e) {
      if (e.name === 'Done') {
        console.log('Finished');

        return;
      }

      throw e;
    }

  })(currentPage)
}

withPagination((i) => `https://www.chess.com/games/archive/gctroia?gameOwner=other_game&gameTypes%5B0%5D=chess960&gameTypes%5B1%5D=daily&gameType=daily&page=${i}`, onPageReady);
