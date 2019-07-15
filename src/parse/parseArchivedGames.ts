import cheerio from 'cheerio';

const parsePlayerTagLine = (elm: CheerioElement) => {
  const $ = cheerio.load(elm);
  const country = $('.country-flags-component', elm).attr().class.trim().match(/country-\d/gi);

  return {
    currentRating: Number($('.post-view-meta-rating', elm).text().slice(1, -1)),
    country: country && country[0],
    user: $('.post-view-meta-username').attr('data-username'),
  }
}

const parsePlayerResult = (resultCell: CheerioElement) => {
  const $ = cheerio.load(resultCell);

  const rawResult = $('div').html()

  return {
    result: (rawResult === '1') ? 1 : (rawResult === '0') ? 0 : .5,
  }
}

const parsePlayerAccuracy = (accuracyCell: CheerioElement) => {
  if (!accuracyCell) {
    return {};
  }

  const $ = cheerio.load(accuracyCell);

  return {
    accuracy: Number($('div').text()),
  }
}

export const parseArchivedGames = (html: string) => {
  const $ = cheerio.load(html);

  const $games = $('.archive-games-table tbody tr').map((i, tr) => {
    const $ = cheerio.load(tr);

    const url = $('.archive-games-icon-block a').attr('href') || '';

    const { 0: whiteUserTagLine, 1: blackUserTagLine } = $('.archive-games-user-cell .archive-games-user-tagline').map((_, item) => item);
    const { 0: whiteResultCell, 1: blackResultCell } = $('.archive-games-result-wrapper-score div').map((_, item) => item);
    const { 0: whiteAccuracy, 1: blackAccuracy } = $('.archive-games-analyze-cell div').map((_, item) => item);

    const white = {
      ...parsePlayerTagLine(whiteUserTagLine),
      ...parsePlayerResult(whiteResultCell),
      ...parsePlayerAccuracy(whiteAccuracy),
    };
    const black = {
      ...parsePlayerTagLine(blackUserTagLine),
      ...parsePlayerResult(blackResultCell),
      ...parsePlayerAccuracy(blackAccuracy),
      ...parsePlayerAccuracy(blackAccuracy),
    };

    return {
      id: url.slice(url.lastIndexOf('/') + 1, url.indexOf('?')),
      url,
      gameTime: $('.archive-games-game-time').text().trim(),
      gameType: $('.icon-font-chess', tr).attr('class').split(' ')[1],
      moves: Number($('td:nth-child(5) span').html()),
      date: new Date($('.archive-games-date-cell').text().trim()),
      white,
      black,
    }
  });

  return Array.from($games);
}
