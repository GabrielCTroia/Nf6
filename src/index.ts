import puppeteer, { Page } from 'puppeteer';
import fs from 'fs';
import { parseArchivedGames } from './parse/parseArchivedGames';

// const jsonlines = require('jsonlines');

const saveToFile = (path: string, content: string) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const readFromHttp = async (url: string, onPageReady: (page: Page) => Promise<void>) => {
  console.log('Url:', url);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  await onPageReady(page);

  await browser.close();

  console.log('  - done');
}


const readFromLocal = async (path: string, onPageReady: (page: Page) => Promise<void>) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.setContent(fs.readFileSync(path, 'utf8'));

  await onPageReady(page);

  await browser.close();
}

const appendToFile = async (path: string, content: string) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, content, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  })
}


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


// readFromHttp('https://www.chess.com/games/archive/gctroia?gameOwner=other_game&gameTypes%5B0%5D=chess960&gameTypes%5B1%5D=daily&gameType=live&page=2', onPageReady);

withPagination((i) => `https://www.chess.com/games/archive/gctroia?gameOwner=other_game&gameTypes%5B0%5D=chess960&gameTypes%5B1%5D=daily&gameType=daily&page=${i}`, onPageReady);

// readFromLocal('./scrappings/my_games.html', onPageReady);
