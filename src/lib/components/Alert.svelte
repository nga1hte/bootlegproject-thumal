<script lang="ts">
import { ALERT_TYPES } from "$lib/ts/constants";
import { alertMessage, alertType } from "$lib/state/alertState.svelte";

const bgClass = $derived.by(()=> {
  if (alertType.type === ALERT_TYPES.SUCCESS) return 'bg-green-500';
  else if (alertType.type === ALERT_TYPES.DANGER) return 'bg-red-500';
  else return 'bg-gray-500';
})

</script>

<div class="min-h-10 w-full flex justify-center items-center my-2">
  {#if alertMessage.message}
    <div class="text-white text-center rounded-md {bgClass} px-4 py-2">
      {alertMessage.message}
    </div>
  {/if}
</div>
