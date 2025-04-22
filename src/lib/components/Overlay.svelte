<script lang="ts">
	import { fade } from 'svelte/transition';

	export let onClose: () => void;
	export let dismissible = true;

	const handleOverlayClick = (e: MouseEvent) => {
		e.stopPropagation();
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && dismissible) {
			onClose();
		}
	}
</script>

<div
	class="w-screen h-screen top-0 left-0 fixed text-white flex justify-center items-center opacity-95"
	transition:fade
	onclick={dismissible ? onClose : undefined}
>
	<div
		class="bg-gray-900 text-white rounded-md px-4 sm:px-8 py-6 sm:py-10 relative max-w-[90%] sm:max-w-lg"
		onclick={handleOverlayClick}
	>
		{#if dismissible}
			<button
				class="absolute top-1 right-2 sm:top-2 sm:right-3 text-3xl sm:text-4xl text-gray-300 hover:-translate-y-0.5 transition-transform"
				onclick={onClose}>&times;</button
			>
		{/if}
		<slot />
	</div>
</div>