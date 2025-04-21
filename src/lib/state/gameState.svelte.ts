import { v4 } from 'uuid';
import answers from '$lib/ts/wordlist';
import { ALERT_TYPES, CONSTANTS } from '$lib/ts/constants';
import { displayAlert } from './alertState.svelte';
import { DICTIONARY } from '$lib/ts/dictionary';

// types
type GameState = typeof CONSTANTS.GAME_STATES[keyof typeof CONSTANTS.GAME_STATES];
type LetterState = typeof CONSTANTS.LETTER_STATES[keyof typeof CONSTANTS.LETTER_STATES];
type LetterStatuses = Record<string, LetterState>;
type GuessArray = string[][];

// state
export const correctWord = {
    obfuscatedWord: '',
    getWord() {
        // First base64 decode
        const decodedWord = atob(this.obfuscatedWord);
        // Then apply ROT13 again (ROT13 is its own inverse)
        return decodedWord.split('').map(char => {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCharCode(((code - 65 + 13) % 26) + 65);
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCharCode(((code - 97 + 13) % 26) + 97);
            }
            return char;
        }).join('');
    }
};
export const wordNumber = $state({number:0})
export const wordIndex = $state({index:0})
export const userGuessArray = $state<{guesses:GuessArray}>({guesses:[]})
export const currentWordIndex = $state({wIndex:0})
export const currentLetterIndex = $state({lIndex:0})
export const gameState = $state<{state:GameState}>({state:CONSTANTS.GAME_STATES.PLAYING})
export const letterStatuses = $state<{statuses:LetterStatuses}>({statuses:{}})
const userID = $state({id:''})

// Add new state for previous word
export const previousWord = $state({
    obfuscatedWord: '',
    number: 0,
    getWord() {
        if (!this.obfuscatedWord) return '';
        // First base64 decode
        const decodedWord = atob(this.obfuscatedWord);
        // Then apply ROT13 again
        return decodedWord.split('').map(char => {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCharCode(((code - 65 + 13) % 26) + 65);
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCharCode(((code - 97 + 13) % 26) + 97);
            }
            return char;
        }).join('');
    }
});

// Convert answers array to Map for efficient lookups, storing in uppercase
const answersMap = new Map(answers.map(word => [word.toUpperCase(), true]));

// setters & local storage
const setAndSaveUserID = (id:string) => {
    localStorage.setItem(CONSTANTS.ID_NAME, id)
    userID.id = id
}

export const setAndSaveCurrentWord = (word: string, number: number, prevWord?: string, prevNumber?: number) => {
    // Store the server's encrypted word directly
    correctWord.obfuscatedWord = word;
    wordNumber.number = number;
    localStorage.setItem(CONSTANTS.CURRENT_WORD_NAME, word);
    localStorage.setItem(CONSTANTS.CURRENT_WORD_NUMBER_NAME, number.toString());

    // Handle previous word if provided
    if (prevWord && prevNumber) {
        previousWord.obfuscatedWord = prevWord;
        previousWord.number = prevNumber;
        localStorage.setItem(CONSTANTS.PREVIOUS_WORD_NAME, prevWord);
        localStorage.setItem(CONSTANTS.PREVIOUS_WORD_NUMBER_NAME, prevNumber.toString());
    } else {
        // Clear previous word if not provided
        previousWord.obfuscatedWord = '';
        previousWord.number = 0;
        localStorage.removeItem(CONSTANTS.PREVIOUS_WORD_NAME);
        localStorage.removeItem(CONSTANTS.PREVIOUS_WORD_NUMBER_NAME);
    }
}

const setAndSaveUserGuessArray = (guesses: GuessArray) => {
    localStorage.setItem(CONSTANTS.GUESSES_NAME, JSON.stringify(guesses));
    userGuessArray.guesses = guesses;
}

const setAndSaveCurrentLetterIndex = (lIndex:number) => {
    localStorage.setItem(CONSTANTS.CURRENT_LETTER_INDEX_NAME, lIndex.toString());
    currentLetterIndex.lIndex = lIndex
}

const setAndSaveCurrentWordIndex = (wIndex:number) => {
    localStorage.setItem(CONSTANTS.CURRENT_WORD_INDEX_NAME, wIndex.toString());
    currentWordIndex.wIndex = wIndex
}

export const setAndSaveGameState = (state:any) => {
    localStorage.setItem(CONSTANTS.GAME_STATE_NAME, state)
    gameState.state = state
}


// loaders
const loadGameState = (): GameState => {
    const loadedState = localStorage.getItem(CONSTANTS.GAME_STATE_NAME);
    if (!loadedState || !Object.keys(CONSTANTS.GAME_STATES).includes(loadedState)) {
        return CONSTANTS.GAME_STATES.PLAYING;
    }
    return loadedState as GameState;
}

const loadLastPlayedDate = () => {
    const existingDateStr = localStorage.getItem(CONSTANTS.LAST_PLAYED_NAME);
    if (existingDateStr) {
        return new Date(existingDateStr)
    }
    return null;
}

const loadCurrentWord = async () => {
    try {
        // Always fetch the current scheduled word first
        const response = await fetch('/api/word');
        if (!response.ok) throw new Error('Failed to fetch word');
        const data = await response.json();
        
        if (data.error || !data.word) {
            throw new Error(data.error || 'No word available');
        }

        // Check if we have a saved word
        const savedWord = localStorage.getItem(CONSTANTS.CURRENT_WORD_NAME);
        const savedWordNumber = localStorage.getItem(CONSTANTS.CURRENT_WORD_NUMBER_NAME);

        // If no saved word or if the server word is different from saved word
        if (!savedWord || !savedWordNumber || data.word !== savedWord) {
            // Clear all game progress when getting a new word
            localStorage.clear();
            // Save new word and reset game state
            setAndSaveCurrentWord(data.word, data.wordNumber, data.previousWord, data.previousWordNumber);
            setAndSaveCurrentLetterIndex(0);
            setAndSaveCurrentWordIndex(0);
            setAndSaveUserGuessArray(generateUserGuessArray());
            letterStatuses.statuses = {};
            setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING);
        } else {
            // Use existing word and game state
            setAndSaveCurrentWord(savedWord, parseInt(savedWordNumber));
        }

        return data.word;
    } catch (error) {
        console.error('Error fetching word:', error);
        setAndSaveGameState(CONSTANTS.GAME_STATES.ERROR);
        throw new Error('Failed to load word from server');
    }
}

const loadUserGuessArray = () => {
    const userGuessStr = localStorage.getItem(CONSTANTS.GUESSES_NAME);
    try {
        if (!userGuessStr) return generateUserGuessArray();
        const loadedUserGuessArray = JSON.parse(userGuessStr) as GuessArray;
        if (!Array.isArray(loadedUserGuessArray)) return generateUserGuessArray();
        return loadedUserGuessArray;
    } catch (error) {
        return generateUserGuessArray();
    }
}

const loadUserID = () : string | null => {
    return localStorage.getItem(CONSTANTS.ID_NAME);
}

const loadCurrentLetterIndex = () : number => {
    const index = localStorage.getItem(CONSTANTS.CURRENT_LETTER_INDEX_NAME);
    return index ? Number(index) : 0;
}

const loadCurrentWordIndex = () : number => {
    const index = localStorage.getItem(CONSTANTS.CURRENT_WORD_INDEX_NAME);
    return index ? Number(index) : 0;
}

// Game functions
export const guessLetter = (letter: string): void => {
    if (letter.length > 2 || currentLetterIndex.lIndex >= CONSTANTS.MAX_LETTERS) return;
    
    // Handle two-letter characters
    if (letter.length === 2) {
        // Check if we have space for two letters
        if (currentLetterIndex.lIndex + 1 >= CONSTANTS.MAX_LETTERS) return;
        
        // Fill current and next box
        userGuessArray.guesses[currentWordIndex.wIndex][currentLetterIndex.lIndex] = letter[0].toUpperCase();
        userGuessArray.guesses[currentWordIndex.wIndex][currentLetterIndex.lIndex + 1] = letter[1].toUpperCase();
        setAndSaveCurrentLetterIndex(currentLetterIndex.lIndex + 2);
    } else {
        // Handle single letter
        userGuessArray.guesses[currentWordIndex.wIndex][currentLetterIndex.lIndex] = letter.toUpperCase();
        setAndSaveCurrentLetterIndex(currentLetterIndex.lIndex + 1);
    }
    
    localStorage.setItem(CONSTANTS.GUESSES_NAME, JSON.stringify(userGuessArray.guesses));
}

export const deleteLetter = (): void => {
    if (currentLetterIndex.lIndex > 0) {
        const newGuesses = [...userGuessArray.guesses];
        newGuesses[currentWordIndex.wIndex][currentLetterIndex.lIndex - 1] = '';
        setAndSaveCurrentLetterIndex(currentLetterIndex.lIndex - 1);
        setAndSaveUserGuessArray(newGuesses);
    }
}

const getUpdatedGameState = async (guessStr: string, wordIndex: number): Promise<GameState> => {
    // First check if it's a potential win
    if (guessStr === correctWord.getWord()) {
        // Show win state immediately
        setAndSaveGameState(CONSTANTS.GAME_STATES.WIN);
        
        // Verify with server in the background
        verifyWithServer(guessStr, wordIndex).catch(error => {
            console.error('Background verification error:', error);
            window.location.reload();
        });

        return CONSTANTS.GAME_STATES.WIN;
    } else if (wordIndex === CONSTANTS.MAX_GUESSES - 1) {
        // It's the last attempt and not a win
        setAndSaveGameState(CONSTANTS.GAME_STATES.LOSE);
        
        // Verify with server in the background
        verifyWithServer(guessStr, wordIndex).catch(error => {
            console.error('Background verification error:', error);
            window.location.reload();
        });
        
        return CONSTANTS.GAME_STATES.LOSE;
    } else {
        return CONSTANTS.GAME_STATES.PLAYING;
    }
}

// Separate function for server verification
const verifyWithServer = async (guessStr: string, wordIndex: number) => {
    try {
        // Encode the guess using ROT13 and base64
        const rot13Guess = guessStr.split('').map(char => {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCharCode(((code - 65 + 13) % 26) + 65);
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCharCode(((code - 97 + 13) % 26) + 97);
            }
            return char;
        }).join('');
        const encodedGuess = btoa(rot13Guess);

        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                guess: encodedGuess,
                wordNumber: wordNumber.number,
                numGuesses: wordIndex + 1
            }),
        });

        if (!response.ok) throw new Error('Verification failed');
        
        const data = await response.json();
        
        // If the game was already recorded, just show stats
        if (data.alreadyPlayed) {
            displayAlert('Word already played', ALERT_TYPES.INFO, 2000);
            return;
        }

        // Display updated stats if available
        if (data.stats) {
            const statsMessage = data.valid 
                ? `Stats: ${data.stats.current_streak} streak, ${data.stats.total_wins} wins`
                : `Stats: Streak ended at ${data.stats.current_streak}`;
            displayAlert(statsMessage, ALERT_TYPES.INFO, 4000);
        }
    } catch (error) {
        console.error('Error verifying game:', error);
        window.location.reload();
    }
}

export const guessWord = async (): Promise<void> => {
    if (currentLetterIndex.lIndex < CONSTANTS.MAX_LETTERS) {
        return displayAlert('A mal kim lou!', ALERT_TYPES.INFO, 2000);
    }

    const currentGuessArray = userGuessArray.guesses[currentWordIndex.wIndex];
    const guessStr = currentGuessArray.join('');

    // Check if the guess is in the answers list
    if (!answersMap.has(guessStr)) {
        return displayAlert('Thumal lak a tellou!', ALERT_TYPES.INFO, 2000);
    }

    const updatedGameState = await getUpdatedGameState(guessStr, currentWordIndex.wIndex);
    setAndSaveGameState(updatedGameState);
    displayFeedback(updatedGameState);

    setAndSaveCurrentWordIndex(currentWordIndex.wIndex + 1);
    setAndSaveCurrentLetterIndex(0);
    updateLetterStatuses(userGuessArray.guesses, correctWord.getWord());
    
    localStorage.setItem(CONSTANTS.LAST_PLAYED_NAME, new Date().toISOString());
}

const displayFeedback = (state: GameState): void => {
    if (state === CONSTANTS.GAME_STATES.WIN) {
        displayAlert('A dik e!', ALERT_TYPES.SUCCESS, 2000);
    } else if (state === CONSTANTS.GAME_STATES.LOSE) {
        displayAlert('Diklou!', ALERT_TYPES.DANGER, 2000);
    }
}

export const resetGame = (isNewPlayer: boolean): void => {
    setAndSaveCurrentLetterIndex(0);
    setAndSaveCurrentWordIndex(0);
    setAndSaveUserGuessArray(generateUserGuessArray());
    letterStatuses.statuses = {};
    
    // Only fetch new word if it's a new game request
    if (isNewPlayer) {
        loadCurrentWord();
        setAndSaveGameState(CONSTANTS.GAME_STATES.NEW_PLAYER);
    } else {
        setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING);
    }
}

const handleNewGame = async () => {
    try {
        // Clear existing word from localStorage
        localStorage.removeItem(CONSTANTS.CURRENT_WORD_NAME);
        localStorage.removeItem(CONSTANTS.CURRENT_WORD_NUMBER_NAME);
        
        const response = await fetch('/api/word');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch word');
        }
        const data = await response.json();
        setAndSaveCurrentWord(data.word, data.wordNumber);
        
        // Reset game state for new word
        setAndSaveCurrentLetterIndex(0);
        setAndSaveCurrentWordIndex(0);
        setAndSaveUserGuessArray(generateUserGuessArray());
        letterStatuses.statuses = {};
        setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING);
    } catch (error) {
        console.error('Error fetching new word:', error);
    }
}

// First check if we have any saved state
const hasSavedState = () => {
    return localStorage.getItem(CONSTANTS.CURRENT_WORD_NAME) !== null;
}

// Load saved state from localStorage
const loadFromLocalStorage = () => {
    const savedWord = localStorage.getItem(CONSTANTS.CURRENT_WORD_NAME);
    const savedWordNumber = localStorage.getItem(CONSTANTS.CURRENT_WORD_NUMBER_NAME);
    const savedPrevWord = localStorage.getItem(CONSTANTS.PREVIOUS_WORD_NAME);
    const savedPrevWordNumber = localStorage.getItem(CONSTANTS.PREVIOUS_WORD_NUMBER_NAME);
    
    if (savedWord && savedWordNumber) {
        setAndSaveCurrentWord(
            savedWord, 
            parseInt(savedWordNumber),
            savedPrevWord || undefined,
            savedPrevWordNumber ? parseInt(savedPrevWordNumber) : undefined
        );
    }

    setAndSaveCurrentLetterIndex(loadCurrentLetterIndex());
    setAndSaveCurrentWordIndex(loadCurrentWordIndex());
    setAndSaveUserGuessArray(loadUserGuessArray());
    const loadedState = loadGameState();
    setAndSaveGameState(loadedState);

    if (savedWord) {
        updateLetterStatuses(userGuessArray.guesses, correctWord.getWord());
    }
}

// Fetch new word and initialize new game state
const initializeNewGame = async () => {
    try {
        const response = await fetch('/api/word');
        if (!response.ok) throw new Error('Failed to fetch word');
        const data = await response.json();
        
        if (data.error || !data.word) {
            throw new Error(data.error || 'No word available');
        }

        setAndSaveCurrentWord(data.word, data.wordNumber);
        setAndSaveCurrentLetterIndex(0);
        setAndSaveCurrentWordIndex(0);
        setAndSaveUserGuessArray(generateUserGuessArray());
        letterStatuses.statuses = {};
        setAndSaveGameState(CONSTANTS.GAME_STATES.NEW_PLAYER);

        return data.word;
    } catch (error) {
        console.error('Error fetching word:', error);
        setAndSaveGameState(CONSTANTS.GAME_STATES.ERROR);
        throw error;
    }
}

// Check for word updates in background
const checkForNewWord = async () => {
    try {
        const response = await fetch('/api/word');
        if (!response.ok) throw new Error('Failed to fetch word');
        const data = await response.json();
        
        if (data.error || !data.word) {
            throw new Error(data.error || 'No word available');
        }

        const savedWord = localStorage.getItem(CONSTANTS.CURRENT_WORD_NAME);
        
        // Only update if word has changed
        if (!savedWord || data.word !== savedWord) {
            localStorage.clear();
            setAndSaveCurrentWord(data.word, data.wordNumber, data.previousWord, data.previousWordNumber);
            setAndSaveCurrentLetterIndex(0);
            setAndSaveCurrentWordIndex(0);
            setAndSaveUserGuessArray(generateUserGuessArray());
            letterStatuses.statuses = {};
            setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING);
        }
    } catch (error) {
        console.error('Error checking for new word:', error);
        if (!correctWord.obfuscatedWord) {
            setAndSaveGameState(CONSTANTS.GAME_STATES.ERROR);
        }
    }
}

export const initializeGame = async () => {
    try {
        if (hasSavedState()) {
            // For returning users: load saved state first, then check for updates
            loadFromLocalStorage();
            await checkForNewWord();
        } else {
            // For new users: fetch word and initialize new game immediately
            const response = await fetch('/api/word');
            if (!response.ok) throw new Error('Failed to fetch word');
            const data = await response.json();
            
            if (data.error || !data.word) {
                throw new Error(data.error || 'No word available');
            }

            setAndSaveCurrentWord(data.word, data.wordNumber, data.previousWord, data.previousWordNumber);
            setAndSaveCurrentLetterIndex(0);
            setAndSaveCurrentWordIndex(0);
            setAndSaveUserGuessArray(generateUserGuessArray());
            letterStatuses.statuses = {};
            setAndSaveGameState(CONSTANTS.GAME_STATES.NEW_PLAYER);
        }
    } catch (error) {
        console.error('Error initializing game:', error);
        setAndSaveGameState(CONSTANTS.GAME_STATES.ERROR);
    }
}

const hasAlreadyPlayedToday = (lastPlayed: Date | null): boolean => {
    if (!lastPlayed) return false;
    const today = new Date();
    return (
        lastPlayed.getFullYear() === today.getFullYear() &&
        lastPlayed.getMonth() === today.getMonth() &&
        lastPlayed.getDate() === today.getDate()
    );
}

const updateLetterStatuses = (guesses: GuessArray, word: string): void => {
    const newStatuses = { ...letterStatuses.statuses };
    
    // Count how many times each letter appears in the word
    const letterCounts = new Map<string, number>();
    word.split('').forEach(letter => {
        letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);
    });
    
    guesses.forEach((guess, wordIndex) => {
        if (wordIndex > currentWordIndex.wIndex) return;
        
        // First pass: mark correct positions and count used letters
        const usedPositions = new Set<number>();
        guess.forEach((letter, letterIndex) => {
            if (!letter) return;
            
            if (letter === word[letterIndex]) {
                newStatuses[letter] = CONSTANTS.LETTER_STATES.CORRECT_SPOT;
                usedPositions.add(letterIndex);
                letterCounts.set(letter, (letterCounts.get(letter) || 0) - 1);
            }
        });
        
        // Second pass: mark wrong positions for remaining letters
        guess.forEach((letter, letterIndex) => {
            if (!letter || usedPositions.has(letterIndex)) return;
            
            const remainingCount = letterCounts.get(letter) || 0;
            if (remainingCount > 0) {
                // Only update to wrong spot if it's not already correct
                if (newStatuses[letter] !== CONSTANTS.LETTER_STATES.CORRECT_SPOT) {
                    newStatuses[letter] = CONSTANTS.LETTER_STATES.WRONG_SPOT;
                }
                letterCounts.set(letter, remainingCount - 1);
            } else {
                // Only update to not found if it's not already correct or wrong spot
                if (newStatuses[letter] !== CONSTANTS.LETTER_STATES.CORRECT_SPOT && 
                    newStatuses[letter] !== CONSTANTS.LETTER_STATES.WRONG_SPOT) {
                    newStatuses[letter] = CONSTANTS.LETTER_STATES.NOT_FOUND;
                }
            }
        });

        // Handle special two-letter characters
        const specialPairs = ['AW', 'CH', 'NG'];
        specialPairs.forEach(pair => {
            const firstLetter = pair[0];
            const secondLetter = pair[1];
            
            // Check if both letters are in the word in sequence
            const firstIndex = word.indexOf(firstLetter);
            const secondIndex = word.indexOf(secondLetter);
            
            // Check if both letters are guessed in sequence
            let foundInSequence = false;
            for (let i = 0; i < guess.length - 1; i++) {
                if (guess[i] === firstLetter && guess[i + 1] === secondLetter) {
                    foundInSequence = true;
                    break;
                }
            }

            if (foundInSequence) {
                if (firstIndex !== -1 && secondIndex !== -1 && secondIndex === firstIndex + 1) {
                    // Both letters are in the word in sequence
                    if (newStatuses[firstLetter] === CONSTANTS.LETTER_STATES.CORRECT_SPOT && 
                        newStatuses[secondLetter] === CONSTANTS.LETTER_STATES.CORRECT_SPOT) {
                        newStatuses[pair] = CONSTANTS.LETTER_STATES.CORRECT_SPOT;
                    } else {
                        newStatuses[pair] = CONSTANTS.LETTER_STATES.WRONG_SPOT;
                    }
                } else {
                    newStatuses[pair] = CONSTANTS.LETTER_STATES.NOT_FOUND;
                }
            }
        });
    });
    
    letterStatuses.statuses = newStatuses;
}

const generateUserGuessArray = () => {
    const emptyGuesses: GuessArray = [];
    for (let i = 0; i < CONSTANTS.MAX_GUESSES; i++) {
        emptyGuesses.push(Array(CONSTANTS.MAX_LETTERS).fill(''));
    }
    return emptyGuesses;
}

const generateInitialLetterStatuses = (): LetterStatuses => {
    return CONSTANTS.ALPHABET.reduce((acc: LetterStatuses, cur: string) => {
        acc[cur] = CONSTANTS.LETTER_STATES.AVAILABLE;
        return acc;
    }, {});
}

// Add function to get previous word definition
export const getPreviousWordDefinition = () => {
    const prevWord = previousWord.getWord();
    if (!prevWord) return null;
    return DICTIONARY[prevWord] || null;
}



