import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        // First get all registered users
        const { data: registeredUsers, error: authError } = await supabase
            .from('auth_users')
            .select('user_id, username')
            .eq('is_registered', true);

        if (authError) {
            throw authError;
        }

        if (!registeredUsers || registeredUsers.length === 0) {
            return json({ leaderboard: [] });
        }

        // Get user IDs of registered users
        const userIds = registeredUsers.map(user => user.user_id);

        // Then get their statistics
        const { data: stats, error: statsError } = await supabase
            .from('user_statistics')
            .select('*')
            .in('user_id', userIds)
            .order('total_wins', { ascending: false })
            .limit(100);

        if (statsError) {
            throw statsError;
        }

        // Combine the data and add rank
        const leaderboard = stats.map((stat, index) => {
            const user = registeredUsers.find(u => u.user_id === stat.user_id);
            return {
                rank: index + 1,
                username: user?.username || 'Unknown',
                totalWins: stat.total_wins,
                gamesPlayed: stat.total_games_played,
                bestStreak: stat.best_streak,
                averageGuesses: Number(stat.average_guesses.toFixed(1))
            };
        });

        return json({ leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}; 