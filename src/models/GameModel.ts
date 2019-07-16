import { getModel } from "./database";

export type PlayerRecord = {
  currentRating: number;
  country: string;
  username: string;
  result: '1' | '0' | '.5';
  accuracy: number;
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

export const model = getModel<GameRecord>({
  name: 'game',
  path: '/games',
  keyExtractor: (r) => r.id,
});

// export const readGame = (id: string) => model.read<GameRecord>(`/games/${id}`);
// export const createOrUpdateGame = (game: GameRecord) => model.createOrUpdate(`/games/${game.id}`, game);
// export const all = () => model.all<GameRecord>('/games');

