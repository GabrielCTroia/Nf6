import { parse } from './parser';
import { fetchHTML, FetchHTMLExceptions, fetchAsStream, delay } from '../lib/util';
import mergeStream from 'merge-stream';
import through2 = require('through2');

enum GameTypes {
  live = 'live',
  daily = 'daily',
}

type Paginator = {
  page: number;
  current: () => string;
  next: () => string;
}

const getPaginator = (username:string, type: GameTypes, page = 0): Paginator => {
  return {
    page,
    current() {
      return `https://www.chess.com/games/archive/${username}?gameType=${type}&page=${page}`;
    },
    next() {
      page++;

      return this.current();
    }
  }
}


const fetch = async (paginator: Paginator) => {
  return fetchHTML(paginator.next(), { waitForSelector: '.post-view-meta-rating' })
    .then(parse)
    .catch((e) => {
      if (e === FetchHTMLExceptions.LookupSelectorNotFound) {
        return null;
      }

      throw e;
    });
}

export const scrape = (username: string) => {
  return mergeStream(
    fetchAsStream(() => fetch(getPaginator(username, GameTypes.daily))),
    fetchAsStream(() => fetch(getPaginator(username, GameTypes.live))),
  )
  .pipe(through2.obj(async function (chunk, _, next) {
    this.push(chunk);

    console.log('Wait 5s');
    await delay(5 * 1000);

    next();
  }));
}