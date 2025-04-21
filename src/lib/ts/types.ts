import { CONSTANTS } from './constants';

export type GameState = typeof CONSTANTS.GAME_STATES[keyof typeof CONSTANTS.GAME_STATES];
export type LetterState = typeof CONSTANTS.LETTER_STATES[keyof typeof CONSTANTS.LETTER_STATES];
export type LetterStatuses = Record<string, LetterState>;
export type GuessArray = string[][]; 