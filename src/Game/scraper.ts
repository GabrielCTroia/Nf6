import { parse } from './parser';
import { fetchHTML, FetchHTMLExceptions, fetchAsStream, delay, getRandom } from '../lib/util';
import multistream = require('multistream');

enum GameTypes {
  live = 'live',
  daily = 'daily',
}

type Paginator = {
  page: number;
  current: () => string;
  next: () => string;
}

const getPaginator = (username: string, type: GameTypes, page = 0): Paginator => {
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
  const nextUrl = paginator.next();

  const waitSeconds = getRandom(15, 5);

  console.log('Fetching', nextUrl);

  try {
    const html = await fetchHTML(nextUrl, { waitForSelector: '.post-view-meta-rating' });

    console.log(' Done.');
    console.log(` Friendly wait for ${waitSeconds} seconds!`);

    // Don't abuse the server!
    await delay(waitSeconds * 1000);

    return parse(html);
  } catch (e) {
    if (e === FetchHTMLExceptions.LookupSelectorNotFound) {
      return null;
    }

    throw e;
  }
}

export const scrape = (username: string) => {
  const livePaginator = getPaginator(username, GameTypes.live, 43);
  const dailyPaginator = getPaginator(username, GameTypes.daily);

  return multistream.obj([
    fetchAsStream(() => fetch(dailyPaginator)),
    fetchAsStream(() => fetch(livePaginator)),
  ]);
}
