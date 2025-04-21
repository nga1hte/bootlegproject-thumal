import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        // Fetch top 100 players ordered by total wins
        const { data, error } = await supabase
            .from('user_statistics')
            .select('username, total_wins, total_games_played, best_streak, average_guesses')
            .order('total_wins', { ascending: false })
            .limit(100);

        if (error) {
            throw error;
        }

        // Add rank to each player
        const leaderboard = data.map((player, index) => ({
            rank: index + 1,
            username: player.username,
            totalWins: player.total_wins,
            gamesPlayed: player.total_games_played,
            bestStreak: player.best_streak,
            averageGuesses: Number(player.average_guesses.toFixed(1))
        }));

        return json({ leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}; 