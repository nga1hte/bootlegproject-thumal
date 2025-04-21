<script lang="ts">
  import { gameState, resetGame, setAndSaveCurrentWord, setAndSaveGameState } from '$lib/state/gameState.svelte';
  import { CONSTANTS } from '$lib/ts/constants';
  import Overlay from './Overlay.svelte';
  import NewPlayerInfo from './NewPlayerInfo.svelte';

  let { wordNumber } = $props<{ wordNumber: number }>();
  let showInstructions = $state(false);

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
      
      // Reset game state directly
      localStorage.setItem(CONSTANTS.CURRENT_LETTER_INDEX_NAME, '0');
      localStorage.setItem(CONSTANTS.CURRENT_WORD_INDEX_NAME, '0');
      localStorage.setItem(CONSTANTS.GUESSES_NAME, JSON.stringify(Array(CONSTANTS.MAX_GUESSES).fill(Array(CONSTANTS.MAX_LETTERS).fill(''))));
      setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING);
      
      // Instead of reloading, just reset the game state
      resetGame(false);
    } catch (error) {
      console.error('Error fetching new word:', error);
    }
  };

  const toggleInstructions = () => {
    showInstructions = !showInstructions;
  };
</script>

<header class="bg-black text-white">
  <div class="container mx-auto px-4 py-3">
    <div class="flex items-center justify-center space-x-8">
      <a href="/" class="text-2xl font-bold hover:text-gray-300 transition-colors">THUMAL</a>
      <div class="text-2xl font-bold">#{wordNumber}</div>
      <a href="/leaderboard" class="hover:text-gray-300 transition-colors" title="Leaderboard" aria-label="Leaderboard">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </a>
      <a href="/stats" class="hover:text-gray-300 transition-colors" title="Stats" aria-label="Stats">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </a>
      <button 
        onclick={toggleInstructions}
        class="hover:text-gray-300 transition-colors"
        title="How to play"
        aria-label="How to play"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <div class="flex items-center space-x-4">
        <div class="text-sm">
          {#if gameState.state === CONSTANTS.GAME_STATES.ERROR}
            <p class="text-red-500 text-sm">No word available. Please try again later.</p>
          {:else if gameState.state === CONSTANTS.GAME_STATES.PLAYING}
            <p class="text-green-400 text-sm">Playing</p>
          {:else if gameState.state === CONSTANTS.GAME_STATES.WIN}
            <span class="text-yellow-400">Won!</span>
          {:else if gameState.state === CONSTANTS.GAME_STATES.LOSE}
            <span class="text-red-400">Lost</span>
          {/if}
        </div>
      </div>
    </div>
  </div>
  <div class="border-b border-gray-700 max-w-2xl mx-auto"></div>
</header>

{#if showInstructions}
  <Overlay onClose={toggleInstructions}>
    <NewPlayerInfo />
  </Overlay>
{/if}

<style>
  a {
    text-decoration: none;
  }
</style> 