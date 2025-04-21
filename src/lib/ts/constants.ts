export type GameState = 'NEW_PLAYER' | 'PLAYING' | 'WIN' | 'LOSE' | 'ERROR';
export type LetterState = 'NOT_FOUND' | 'CORRECT_SPOT' | 'WRONG_SPOT' | 'AVAILABLE';

export const ALERT_TYPES = {
    SUCCESS: 'success',
    DANGER: 'danger',
    INFO: 'info'
} as const;

export const GAME_STATES = {
    NEW_PLAYER: "NEW_PLAYER",
    PLAYING: "PLAYING",
    WIN: "WIN",
    LOSE: "LOSE",
    ERROR: "ERROR"
} as const;

export const LETTER_STATES = {
    NOT_FOUND: "NOT_FOUND",
    CORRECT_SPOT: "CORRECT_SPOT",
    WRONG_SPOT: "WRONG_SPOT",
    AVAILABLE: "AVAILABLE"
} as const;

export const LETTER_STATUS_TO_BG_MAP = {
    [LETTER_STATES.WRONG_SPOT]: "bg-yellow-500",
    [LETTER_STATES.CORRECT_SPOT]: "bg-green-500",
    [LETTER_STATES.NOT_FOUND]: "bg-gray-500",
    [LETTER_STATES.AVAILABLE]: "bg-gray-700",
} as const;

export const ALPHABET = [
    "A", "AW", "B", "CH","D", "E", "F", "G", "NG", "H", "I", "J", "K", "L", "M",
    "N", "O", "P","R", "S", "T", "U", "V", "Z"
] as const;

export const KEYBOARD_ROWS_ARR = [
    ['A', 'AW', 'B', 'CH', 'D', 'E', 'F', 'G', 'NG'],
    ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
    ['ENTER', 'R', 'S', 'T', 'U', 'V', 'Z', 'DEL']
] as const;

export const MAX_LETTERS = 5;
export const MAX_GUESSES = 6;
export const ID_NAME = "thumal_sessionId";
export const GUESSES_NAME = "thumal_userGuessesStr";
export const LAST_PLAYED_NAME = "thumal_lastPlayedDate";
export const CURRENT_WORD_INDEX_NAME = "thumal_currentWordIndex";
export const CURRENT_LETTER_INDEX_NAME = "thumal_currentLetterIndex";
export const GAME_STATE_NAME = "thumal_gameState";
export const CURRENT_WORD_NAME = "thumal_current_word";
export const CURRENT_WORD_NUMBER_NAME = "thumal_current_word_number";
export const PREVIOUS_WORD_NAME = "thumal_previous_word";
export const PREVIOUS_WORD_NUMBER_NAME = "thumal_previous_word_number";
export const USER_ID_NAME = "thumal_user_id";
export const USERNAME_NAME = "thumal_username";

// If you need a single object export, you can use this:
export const CONSTANTS = {
    GAME_STATES,
    LETTER_STATES,
    LETTER_STATUS_TO_BG_MAP,
    ALPHABET,
    MAX_LETTERS,
    MAX_GUESSES,
    ID_NAME,
    GUESSES_NAME,
    LAST_PLAYED_NAME,
    KEYBOARD_ROWS_ARR,
    CURRENT_LETTER_INDEX_NAME,
    CURRENT_WORD_INDEX_NAME,
    GAME_STATE_NAME,
    CURRENT_WORD_NAME,
    CURRENT_WORD_NUMBER_NAME,
    USER_ID_NAME,
    USERNAME_NAME,
    PREVIOUS_WORD_NAME,
    PREVIOUS_WORD_NUMBER_NAME
} as const;