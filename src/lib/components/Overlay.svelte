<script lang="ts">
	import { setAndSaveGameState } from "$lib/state/gameState.svelte";
	import { fade } from 'svelte/transition';
	import { CONSTANTS } from "$lib/ts/constants";

	const handleOverlayClick = (e: MouseEvent) => {
		e.stopPropagation();
	};

	const handleClose = () => {
		setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING);
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<div
	class="w-screen h-screen top-0 left-0 fixed text-white flex justify-center items-center opacity-95"
	transition:fade
	onclick={handleClose}
>
	<div
		class="bg-gray-900 text-white rounded-md px-8 py-10 relative max-w-lg"
		onclick={handleOverlayClick}
	>
		<button
			class="absolute top-2 right-3 text-4xl text-gray-300 hover:-translate-y-0.5 transition-transform"
			onclick={handleClose}>&times;</button
		>
		<slot />
	</div>
</div>