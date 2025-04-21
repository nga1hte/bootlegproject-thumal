<script lang="ts">
    const { letter, letterIndex, wordIndex } = $props<{
        letter: string;
        letterIndex: number;
        wordIndex: number;
    }>();
    
    import { correctWord, currentLetterIndex, currentWordIndex, userGuessArray } from "$lib/state/gameState.svelte";
    import { fade } from 'svelte/transition';

    const bgClass = $derived.by(() => {
        const showResults = wordIndex < currentWordIndex.wIndex;
        if (!showResults) return "bg-transparent";

        const currentGuess = userGuessArray.guesses[wordIndex];
        
        // First check if this letter is in the correct position
        if (letter === correctWord.getWord()[letterIndex]) {
            return "bg-green-500";
        }

        // Check if this letter exists in the word at all
        if (!correctWord.getWord().includes(letter)) {
            return "bg-gray-500";
        }

        // Count how many times this letter appears in the correct word
        const letterCountInWord = correctWord.getWord().split('').filter(l => l === letter).length;
        
        // Count how many times this letter is in the correct position in the entire guess
        let correctPositions = 0;
        for (let i = 0; i < currentGuess.length; i++) {
            if (currentGuess[i] === letter && letter === correctWord.getWord()[i]) {
                correctPositions++;
            }
        }

        // Count how many times this letter appears before current position
        let occurrencesBefore = 0;
        for (let i = 0; i < letterIndex; i++) {
            if (currentGuess[i] === letter) {
                occurrencesBefore++;
            }
        }

        // If we've already found all correct positions for this letter, or
        // we've used up all available instances before this position
        if (correctPositions >= letterCountInWord || 
            occurrencesBefore >= letterCountInWord) {
            return "bg-gray-500";
        }

        // Otherwise, it's yellow
        return "bg-yellow-500";
    });
</script>

{#if wordIndex < currentWordIndex.wIndex }
<div class="w-14 h-14 {bgClass} flex items-center justify-center" in:fade={{ delay: 100 * letterIndex }}>
    <span class="text-4xl font-bold">{letter}</span>  
</div>
{:else if letterIndex < currentLetterIndex.lIndex && wordIndex === currentWordIndex.wIndex}
<div class="w-14 h-14 border-2 border-gray-600 flex items-center justify-center">
    <span class="text-4xl font-bold" in:fade>{letter}</span>          
</div>
{:else}
    <span class="w-14 h-14 border-2 border-gray-600">{letter}</span>          
{/if}
    