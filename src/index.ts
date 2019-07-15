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
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  await onPageReady(page);

  await browser.close();
}


const readFromLocal = async (path: string, onPageReady: (page: Page) => Promise<void>) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.setContent(fs.readFileSync(path, 'utf8'));

  await onPageReady(page);

  await browser.close();
}

const appendToFile = async (path: string, content: string) => {
  fs.writeFile(path, content, (err) => {
    if (err) {
      console.log(err);

      throw err;
    }
  });
}


const onPageReady = async (page: Page) => {
  await page.waitForSelector('.post-view-meta-rating');

  await page.screenshot({ path: 'example.png' });

  const body = await page.evaluate(() => {
    const b = document.querySelector('body');

    return b ? b.innerHTML : '';
  });

  const games = parseArchivedGames(body);

  appendToFile('./archived_games.json', games.map((g) => JSON.stringify(g)).join('\n'));

  // console.log();

  return;
}



// readFromHttp('https://www.chess.com/games/archive/gctroia?gameOwner=other_game&gameTypes%5B0%5D=chess960&gameTypes%5B1%5D=daily&gameType=live&page=1', onPageReady);
readFromLocal('./scrappings/my_games.html', onPageReady);
