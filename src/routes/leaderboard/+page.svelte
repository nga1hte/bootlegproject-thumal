<script lang="ts">
    import { onMount } from 'svelte';
    import Header from '$lib/components/Header.svelte';
    import { wordNumber } from '$lib/state/gameState.svelte';

    type LeaderboardEntry = {
        rank: number;
        username: string;
        totalWins: number;
        gamesPlayed: number;
        bestStreak: number;
        averageGuesses: number;
    };

    let leaderboard: LeaderboardEntry[] = [];
    let loading = true;
    let error = '';

    onMount(async () => {
        try {
            const response = await fetch('/api/leaderboard');
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            leaderboard = data.leaderboard;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load leaderboard';
        } finally {
            loading = false;
        }
    });
</script>

<Header wordNumber={wordNumber.number} />

<div class="flex flex-col items-center justify-start min-h-screen bg-black">
    <div class="w-full max-w-[500px] flex flex-col gap-2 pt-4">
        <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 text-center">
            <h1 class="text-2xl text-white">Leaderboard</h1>
            <p class="text-green-500">2nd May tana sang pen in free merch from <a href="https://bootlegproject.shop" class="underline">bootlegproject</a></p>
        </div>

        {#if loading}
            <div class="text-center text-white">Loading leaderboard...</div>
        {:else if error}
            <div class="text-center text-red-500">{error}</div>
        {:else if leaderboard.length > 0}
            <div class="grid grid-cols-1 gap-2">
                {#each leaderboard as player}
                    <div class="bg-gray-800 border-2 border-gray-700 rounded p-3 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="text-gray-400 w-6 text-center">{player.rank}</div>
                            <div class="text-white font-medium">{player.username}</div>
                        </div>
                        <div class="text-white font-bold">{player.totalWins} vei zou.</div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="text-center text-white">
                <p>No registered users yet.</p>
                <p class="text-gray-400 text-sm mt-2">Register to be the first on the leaderboard!</p>
            </div>
        {/if}
    </div>
</div> 