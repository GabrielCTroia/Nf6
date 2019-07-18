import fs from 'fs';
import puppeteer, { Page } from 'puppeteer';
import LineByLineReader from 'line-by-line';
import { Path, pathOr } from 'ramda';
import { isArray } from 'util';
import { Readable } from 'stream';

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


export enum FetchHTMLExceptions {
  InvalidHTML,
  LookupSelectorNotFound,
}

export const fetchHTML = async (url: string, opts: {
  waitForSelector?: string;
  timeout?: number;
}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const {
    waitForSelector: selector,
    timeout = 5 * 1000,
  } = opts;

  await page.goto(url);

  if (selector) {
    try {
      await page.waitForSelector(selector, { timeout });
    } catch (e) {
      if (e.name === 'TimeoutError') {
        throw FetchHTMLExceptions.LookupSelectorNotFound;
      }

      throw (e);
    }
  }

  const html = await page.evaluate(() => {
    const html = document.querySelector('html');

    if (html && html.innerHTML) {
      return html.innerHTML;
    }

    throw FetchHTMLExceptions.InvalidHTML;
  });

  await browser.close();

  return html;
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

export const fetchAsStream = <T>(fetchNextData: () => Promise<T | null>) => {
  const stream = new Readable({
    objectMode: true,
    read() { },
  });

  stream._read = async () => {
    const data = await fetchNextData();

    stream.push(data);
  }

  return stream;
}