import { readFileSync } from "fs";

const game = readFileSync('./data/games/2793160338.json');

console.log('game', game);