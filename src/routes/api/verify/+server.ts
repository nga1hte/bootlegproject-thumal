import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';
import { CONSTANTS } from '$lib/ts/constants';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { guess, wordNumber, numGuesses } = await request.json();
        const userId = cookies.get('userId');

        if (!userId) {
            return json({ 
                error: 'Not authenticated',
                message: 'User not found'
            }, { status: 401 });
        }
        
        // Fetch the actual word for the given wordNumber from Supabase
        const { data: wordData, error } = await supabase
            .from('scheduled_words')
            .select('word, scheduled_for')
            .eq('id', wordNumber)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        if (!wordData) {
            return json({ 
                valid: false, 
                message: 'Word not found' 
            }, { status: 404 });
        }

        const { word: plainWord } = wordData;
        
        // Encode the word from Supabase using ROT13 and base64
        const rot13Word = plainWord.split('').map((char: string) => {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCharCode(((code - 65 + 13) % 26) + 65);
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCharCode(((code - 97 + 13) % 26) + 97);
            }
            return char;
        }).join('');
        const encodedWord = btoa(rot13Word);

        // Compare the encoded strings to determine win/loss
        const isWin = guess === encodedWord;
        const isLastAttempt = numGuesses === CONSTANTS.MAX_GUESSES;

        // Check if user has already played this word
        const { data: existingGame } = await supabase
            .from('game_history')
            .select('*')
            .eq('user_id', userId)
            .eq('word_id', wordNumber)
            .single();

        if (existingGame) {
            return json({
                valid: isWin,
                message: 'Word already played',
                alreadyPlayed: true
            });
        }

        // Only proceed with stats update if it's a win or the last attempt
        if (isWin || isLastAttempt) {
            // Fetch current stats
            const { data: currentStats, error: statsError } = await supabase
                .from('user_statistics')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (statsError) {
                throw statsError;
            }

            // Calculate new stats
            const newStats = {
                total_games_played: currentStats.total_games_played + 1,
                total_wins: isWin ? currentStats.total_wins + 1 : currentStats.total_wins,
                current_streak: isWin ? currentStats.current_streak + 1 : 0,
                best_streak: isWin ? Math.max(currentStats.best_streak, currentStats.current_streak + 1) : currentStats.best_streak,
                average_guesses: isWin 
                    ? ((currentStats.average_guesses * currentStats.total_wins) + numGuesses) / (currentStats.total_wins + 1)
                    : currentStats.average_guesses,
                best_guess: isWin ? Math.min(currentStats.best_guess, numGuesses) : currentStats.best_guess,
                last_played_at: new Date().toISOString()
            };

            // Update user statistics
            const { error: updateError } = await supabase
                .from('user_statistics')
                .update(newStats)
                .eq('user_id', userId);

            if (updateError) {
                throw updateError;
            }

            // Record game history
            const { error: historyError } = await supabase
                .from('game_history')
                .insert([{
                    user_id: userId,
                    word_id: wordNumber,
                    guesses_count: numGuesses,
                    won: isWin
                }]);

            if (historyError) {
                console.error('Error recording game history:', historyError);
            }

            return json({ 
                valid: isWin,
                message: isWin ? 'Valid win' : 'Game over',
                stats: newStats,
                alreadyPlayed: false
            });
        }

        return json({ 
            valid: false,
            message: 'Invalid guess'
        });
    } catch (error) {
        console.error('Error verifying word:', error);
        return json({ 
            valid: false, 
            message: error instanceof Error ? error.message : 'Verification failed'
        }, { status: 500 });
    }
}; 