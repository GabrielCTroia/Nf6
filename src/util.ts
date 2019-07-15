import fs from 'fs';
import puppeteer, { Page } from 'puppeteer';
import LineByLineReader from 'line-by-line';

export const saveToFile = (path: string, content: string) => {
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

export const appendToFile = async (path: string, content: string) => {
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

export const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


export const readFromHttp = async (url: string, onPageReady: (page: Page) => Promise<void>) => {
  console.log('Url:', url);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  await onPageReady(page);

  await browser.close();

  console.log('  - done');
}


export const readFromLocal = async (path: string, onPageReady: (page: Page) => Promise<void>) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.setContent(fs.readFileSync(path, 'utf8'));

  await onPageReady(page);

  await browser.close();
}

export const readEachLineAsync = (path: string, cb: (line: any, c: number) => Promise<void>) => {
  const lr = new LineByLineReader(path);
  var count = 0;

  lr.on('line', async (line) => {
    lr.pause();

    await cb(line, count++);

    lr.resume();
  });
}