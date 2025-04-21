import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Cookie options
const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365 // 1 year
} as const;

// Initial stats for new users
const initialStats = {
    total_games_played: 0,
    total_wins: 0,
    current_streak: 0,
    best_streak: 0,
    average_guesses: 0,
    best_guess: 999,
    last_played_at: null
};

export const GET: RequestHandler = async ({ cookies }) => {
    try {
        const userId = cookies.get('userId');
        
        if (!userId) {
            return json({ 
                error: 'No user found',
                message: 'User not authenticated'
            }, { status: 401 });
        }

        // Fetch user stats
        const { data: stats, error: statsError } = await supabase
            .from('user_statistics')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (statsError) {
            console.error('Error fetching user stats:', statsError);
            return json({ 
                error: 'Failed to fetch user stats',
                message: statsError.message 
            }, { status: 500 });
        }

        // Fetch auth info if user is registered
        const { data: auth, error: authError } = await supabase
            .from('auth_users')
            .select('username, is_registered')
            .eq('user_id', userId)
            .single();

        if (authError && authError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching auth info:', authError);
            return json({ 
                error: 'Failed to fetch auth info',
                message: authError.message 
            }, { status: 500 });
        }

        return json({ 
            user: {
                id: userId,
                stats,
                ...(auth ? { username: auth.username, is_registered: auth.is_registered } : {})
            }
        });

    } catch (error: unknown) {
        console.error('Error fetching user:', error);
        return json({ 
            error: 'Failed to fetch user',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ cookies }) => {
    try {
        // Check if user already exists via cookie
        const existingUserId = cookies.get('userId');
        if (existingUserId) {
            const { data: existingStats } = await supabase
                .from('user_statistics')
                .select('*')
                .eq('user_id', existingUserId)
                .single();

            if (existingStats) {
                return json({ user: { id: existingUserId, stats: existingStats } });
            }
        }

        // Create new guest user
        const newUserId = uuidv4();
        
        // Insert initial stats
        const { error: statsError } = await supabase
            .from('user_statistics')
            .insert([{
                user_id: newUserId,
                username: `Guest-${newUserId.slice(0, 8)}`,
                ...initialStats
            }]);

        if (statsError) {
            throw statsError;
        }

        // Set cookie with new user ID
        cookies.set('userId', newUserId, cookieOptions);

        return json({
            user: {
                id: newUserId,
                stats: initialStats
            },
            message: 'New guest user created successfully'
        });

    } catch (error: unknown) {
        console.error('Error in user API:', error);
        return json({ 
            error: 'Failed to process user request',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}; 