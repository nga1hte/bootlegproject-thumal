<script lang="ts">
    import { CONSTANTS } from "$lib/ts/constants";
    import { deleteLetter, guessLetter, guessWord, letterStatuses } from "$lib/state/gameState.svelte";

    const getBgClass = (letter: string) => {
        const status = letterStatuses.statuses[letter.toUpperCase()];
        return CONSTANTS.LETTER_STATUS_TO_BG_MAP[status];
    };
    
    const handleClick = (letter: string) => {
        if(letter === 'ENTER'){
            guessWord();
        }else if(letter === 'DEL') {
            deleteLetter();
        }else {
            guessLetter(letter);
        }
    }

    const isSpecialKey = (letter: string) => letter === 'ENTER' || letter === 'DEL';
</script>

<div class="w-full max-w-md px-2">
    {#each CONSTANTS.KEYBOARD_ROWS_ARR as row }
    <div class="flex gap-1 sm:gap-2 justify-center mb-1 sm:mb-2">
        {#each row as letter }
            <button 
                onclick={() => handleClick(letter)} 
                class={`flex items-center justify-center rounded-md
                        transition-all duration-200 ease-in-out
                        hover:scale-105 hover:brightness-110
                        active:scale-95 active:brightness-90
                        ${isSpecialKey(letter) ? 'px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-base' : 'w-7 sm:w-10 h-8 sm:h-10 text-xs sm:text-base'}
                        ${getBgClass(letter) || 'bg-gray-700 hover:bg-gray-600'}`}
            >
                {letter}
            </button>
        {/each}
    </div>
    {/each}
</div>