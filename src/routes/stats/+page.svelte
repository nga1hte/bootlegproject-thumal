<script lang="ts">
    import { onMount } from 'svelte';
    import { ALERT_TYPES } from '$lib/ts/constants';
    import { displayAlert } from '$lib/state/alertState.svelte';
    import Header from '$lib/components/Header.svelte';
    import { wordNumber } from '$lib/state/gameState.svelte';
    import { goto } from '$app/navigation';

    let stats: any = null;
    let username: string = '';
    let loading = true;
    let error = '';
    let showSettings = false;
    let newUsername = '';
    let password = '';
    let isLoginMode = false; // false for register, true for login
    let authError = '';

    onMount(async () => {
        try {
            const response = await fetch('/api/user');
            if (!response.ok) {
                throw new Error('Failed to fetch user stats');
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.message);
            }
            stats = data.user.stats;
            username = data.user.stats?.username || 'Guest';
            newUsername = username;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load stats';
            displayAlert(error, ALERT_TYPES.DANGER, 3000);
            // Redirect to main page to create new guest account
            await goto('/', { replaceState: true });
        } finally {
            loading = false;
        }
    });

    async function handleAuth() {
        authError = '';
        if (!newUsername.trim()) {
            authError = 'Username cannot be empty';
            return;
        }
        if (!isLoginMode && !password) {
            authError = 'Password is required for registration';
            return;
        }

        try {
            const endpoint = isLoginMode ? '/api/login' : '/api/register';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: newUsername.trim(),
                    password: password
                })
            });

            const data = await response.json();
            if (!response.ok) {
                authError = data.message || 'Authentication failed';
                return;
            }

            // Clear current stats
            stats = null;
            loading = true;

            // Fetch fresh user data
            const userResponse = await fetch('/api/user');
            if (!userResponse.ok) {
                throw new Error('Failed to fetch user stats');
            }
            const userData = await userResponse.json();
            if (userData.error) {
                throw new Error(userData.message);
            }
            stats = userData.user.stats;
            username = userData.user.stats?.username || 'Guest';

            password = '';
            showSettings = false;
            loading = false;
            displayAlert(
                isLoginMode ? 'Logged in successfully' : 'Registered successfully',
                ALERT_TYPES.SUCCESS,
                3000
            );
        } catch (err) {
            loading = false;
            authError = err instanceof Error ? err.message : 'Authentication failed';
        }
    }
</script>

<Header wordNumber={wordNumber.number} />

<div class="flex flex-col items-center justify-start min-h-screen bg-black">
    <div class="w-full max-w-[500px] flex flex-col gap-2 pt-4">
        <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 text-center">
            <h1 class="text-2xl text-white">Statistics</h1>
        </div>

        <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 text-center">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="text-gray-400 text-sm">Username</div>
                    <div class="text-white text-xl font-bold break-all">{username}</div>
                </div>
                <button
                    class="p-2 hover:bg-gray-700 rounded transition-colors"
                    onclick={() => {
                        showSettings = true;
                        authError = '';
                    }}
                    title="Settings"
                    aria-label="Open settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        </div>

        {#if loading}
            <div class="text-center text-white">Loading statistics...</div>
        {:else if error}
            <div class="text-center text-red-500">{error}</div>
        {:else if stats}
            <div class="grid grid-cols-2 gap-2">
                <!-- Games Played -->
                <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 text-center flex flex-col gap-1">
                    <div class="text-gray-400 text-sm">Games Played</div>
                    <div class="text-white text-2xl font-bold">{stats.total_games_played}</div>
                </div>

                <!-- Total Wins -->
                <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 text-center flex flex-col gap-1">
                    <div class="text-gray-400 text-sm">Total Wins</div>
                    <div class="text-white text-2xl font-bold">{stats.total_wins}</div>
                </div>

                <!-- Current Streak -->
                <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 text-center flex flex-col gap-1">
                    <div class="text-gray-400 text-sm">Current Streak</div>
                    <div class="text-white text-2xl font-bold">{stats.current_streak}</div>
                </div>

                <!-- Best Streak -->
                <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 text-center flex flex-col gap-1">
                    <div class="text-gray-400 text-sm">Best Streak</div>
                    <div class="text-white text-2xl font-bold">{stats.best_streak}</div>
                </div>

                <!-- Average Guesses -->
                <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 text-center flex flex-col gap-1">
                    <div class="text-gray-400 text-sm">Average Guesses</div>
                    <div class="text-white text-2xl font-bold">{stats.average_guesses.toFixed(1)}</div>
                </div>

                <!-- Best Guess -->
                <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 text-center flex flex-col gap-1">
                    <div class="text-gray-400 text-sm">Best Guess</div>
                    <div class="text-white text-2xl font-bold">{stats.best_guess === 999 ? '-' : stats.best_guess}</div>
                </div>
            </div>
        {:else}
            <div class="text-center text-white">No statistics available</div>
        {/if}
    </div>
</div>

{#if showSettings}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-gray-800 border-2 border-gray-700 rounded p-4 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl text-white">{isLoginMode ? 'Login' : 'Register'}</h2>
                <button
                    class="text-gray-400 hover:text-white"
                    onclick={() => {
                        showSettings = false;
                        authError = '';
                    }}
                    aria-label="Close settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="flex flex-col gap-4">
                {#if authError}
                    <div class="text-red-500 text-sm text-center">{authError}</div>
                {/if}

                <div class="flex flex-col gap-1">
                    <label class="text-gray-400 text-sm" for="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        class="bg-gray-700 text-white p-2 rounded border border-gray-600"
                        bind:value={newUsername}
                        placeholder="Enter username"
                    />
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-gray-400 text-sm" for="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        class="bg-gray-700 text-white p-2 rounded border border-gray-600"
                        bind:value={password}
                        placeholder="Enter password"
                    />
                </div>

                <div class="flex gap-2">
                    <button
                        class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        onclick={handleAuth}
                    >
                        {isLoginMode ? 'Login' : 'Register'}
                    </button>
                    <button
                        class="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                        onclick={() => {
                            isLoginMode = !isLoginMode;
                            authError = '';
                        }}
                    >
                        {isLoginMode ? 'Switch to Register' : 'Switch to Login'}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}
