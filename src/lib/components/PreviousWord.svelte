<script lang="ts">
    import { previousWord, getPreviousWordDefinition } from '$lib/state/gameState.svelte';
    
    let definition = $state(getPreviousWordDefinition());
    let word = $state(previousWord.getWord());
</script>

{#if word && definition}
    <div class="previous-word bg-gray-800 p-3 rounded-lg mt-3 max-w-md mx-auto">
        <h3 class="text-base font-semibold mb-2">Thumal luipen</h3>
        <div class="flex items-center gap-3">
            <div class="word text-lg font-bold">{word}</div>
            <div class="definition text-gray-300 text-sm">- {definition}</div>
        </div>
    </div>
{/if} 