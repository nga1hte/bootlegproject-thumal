<script lang="ts">
    import { CONSTANTS } from "$lib/ts/constants";
    import { deleteLetter, guessLetter, guessWord, letterStatuses } from "$lib/state/gameState.svelte";

    export let gameState: string;

    const getBgClass = (letter: string) => {
        const status = letterStatuses.statuses[letter.toUpperCase()];
        return CONSTANTS.LETTER_STATUS_TO_BG_MAP[status];
    };
    
    const handleKeyClick = (key: string) => {
        if (gameState === CONSTANTS.GAME_STATES.WIN) return;
        if(key === 'ENTER'){
            guessWord();
        }else if(key === 'DEL') {
            deleteLetter();
        }else {
            guessLetter(key);
        }
    }

    const isSpecialKey = (letter: string) => letter === 'ENTER' || letter === 'DEL';
</script>

<div class="w-full max-w-2xl px-4">
    {#each CONSTANTS.KEYBOARD_ROWS_ARR as row }
    <div class="flex gap-1 justify-center mb-2">
        {#each row as letter }
            <button 
                onclick={() => handleKeyClick(letter)} 
                class={`flex items-center justify-center rounded-md
                        transition-all duration-200 ease-in-out
                        hover:scale-105 hover:brightness-110
                        active:scale-95 active:brightness-90
                        ${isSpecialKey(letter) ? 'px-2 sm:px-4 h-10' : 'w-8 sm:w-10 h-10'}
                        ${getBgClass(letter) || 'bg-gray-700 hover:bg-gray-600'}
                        ${gameState === CONSTANTS.GAME_STATES.WIN ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={gameState === CONSTANTS.GAME_STATES.WIN}
            >
                <span class="text-sm sm:text-base">{letter}</span>
            </button>
        {/each}
    </div>
    {/each}
</div>