import fs from 'fs';
import puppeteer, { Page } from 'puppeteer';
import LineByLineReader from 'line-by-line';
import { curry, Path, pathOr } from 'ramda';
import { isArray } from 'util';

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

export const getModelValFor = (obj: any) => <T>(path: Path, defaultVal: T): T => pathOr(defaultVal, path, obj);

/**
 * Iterates over given array async
 *
 * @param arr
 * @param cb
 */
export async function* asyncIterate<T, R>(arr: T[], cb: (val: T) => Promise<R | void>) {
  var i = 0;

  while (i < arr.length) {
    yield await cb(arr[i]);
    i++;
  }
}

export const forEachAsync = async <T, R>(cb: (r: T) => R, arr: T[] | Iterable<T>) => {
  const iterator = (isArray(arr)) ? arr[Symbol.iterator]() : arr;

  for await (let item of iterator) {
    await cb(item);
  }
};