import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';

// Cookie options
const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365 // 1 year
} as const;

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { username, password } = await request.json();
        const userId = cookies.get('userId');

        if (!userId) {
            return json({ 
                error: 'Not authenticated',
                message: 'Please create an account first'
            }, { status: 401 });
        }

        // Check if user is already registered
        const { data: existingAuth } = await supabase
            .from('auth_users')
            .select('user_id, is_registered')
            .eq('user_id', userId)
            .single();

        if (existingAuth?.is_registered) {
            return json({ 
                error: 'Already registered',
                message: 'This account is already registered'
            }, { status: 400 });
        }

        // Check if username is already taken
        const { data: existingUsername } = await supabase
            .from('auth_users')
            .select('user_id')
            .eq('username', username)
            .single();

        if (existingUsername) {
            return json({ 
                error: 'Username taken',
                message: 'Please choose a different username'
            }, { status: 400 });
        }

        // Create auth record
        const { error: authError } = await supabase
            .from('auth_users')
            .insert([{
                user_id: userId,
                username,
                password_hash: password, // Note: In production, this should be properly hashed
                is_registered: true,
                last_login: new Date().toISOString()
            }]);

        if (authError) {
            throw authError;
        }

        // Update statistics username
        const { error: statsError } = await supabase
            .from('user_statistics')
            .update({ username })
            .eq('user_id', userId);

        if (statsError) {
            throw statsError;
        }

        return json({
            message: 'Account registered successfully'
        });

    } catch (error: unknown) {
        console.error('Error registering user:', error);
        return json({ 
            error: 'Failed to register account',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}; 