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

        // Check if user exists and verify credentials
        const { data: auth, error: authError } = await supabase
            .from('auth_users')
            .select('user_id, password_hash')
            .eq('username', username)
            .single();

        if (authError || !auth) {
            return json({ 
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            }, { status: 401 });
        }

        // Verify password (in production, use proper password hashing)
        if (auth.password_hash !== password) {
            return json({ 
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            }, { status: 401 });
        }

        // Set cookie with user ID
        cookies.set('userId', auth.user_id, cookieOptions);

        // Update last login time
        await supabase
            .from('auth_users')
            .update({ last_login: new Date().toISOString() })
            .eq('user_id', auth.user_id);

        return json({
            message: 'Logged in successfully'
        });

    } catch (error: unknown) {
        console.error('Error in login:', error);
        return json({ 
            error: 'Failed to process login',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}; 