import { scrapeGames } from '../Game';


(([username]) => {

  if (typeof username !== 'string') {
    return;
  }
  
  scrapeGames(username);


})(process.argv.slice(2))