import { getModel } from "./database";

export type PlayerRecord = {
  currentRating: number;
  country: string;
  username: string;
  result: 1 | 0 | .5;
}

export type GameRecord = {
  id: string;
  url: string;
  gameTime: string;
  gameType: string;
  moves: number,
  date: Date,
  players: {
    white: PlayerRecord;
    black: PlayerRecord;
  };
}

const model = getModel('game');

export const readGame = (id: string) => model.read<GameRecord>(`/games/${id}`);
export const createOrUpdateGame = (game: GameRecord) => model.createOrUpdate(`/games/${game.id}`, game);
