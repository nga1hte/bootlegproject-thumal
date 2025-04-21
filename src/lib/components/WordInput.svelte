<script lang="ts">
    import { userGuessArray } from "$lib/state/gameState.svelte";
    import LetterInput from "./LetterInput.svelte";
    
    const { wordIndex } = $props<{
        wordIndex: number;
    }>();

    const lettersArr = $derived(userGuessArray.guesses[wordIndex]);
</script>

<div class="flex gap-1.5">
    {#each lettersArr as letter, i }
        <LetterInput letter={letter} wordIndex={wordIndex} letterIndex={i}/>
    {/each}
</div>
