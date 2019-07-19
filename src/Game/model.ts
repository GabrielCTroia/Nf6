import { Model } from '../lib/Model';

export type PlayerResult = '1' | '0' | '.5';

export type PlayerRecord = {
  currentRating: number;
  country: string;
  username: string;
  result: PlayerResult;
  accuracy?: number;
  color: 'white' | 'black';
}

export type GameRecord = {
  id: string;
  url: string;
  gameTime: string;
  gameType: string;
  moves: number,
  playedDate: Date,
  players: {
    white: PlayerRecord;
    black: PlayerRecord;
  };
}

export const gameModel = new Model<GameRecord>({
  name: 'game',
  keyExtractor: (r) => r.id,
});
