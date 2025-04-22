<script lang="ts">
    import { fade } from "svelte/transition";
</script>

<div class="flex flex-col gap-2" transition:fade role="dialog" aria-label="Game Instructions">
    <p><span class="font-bold">THUMAL</span> dik guk(6) vei in sui khiak sawm in.</p>
    <p>Thumal na gelh lut te kha eipau mah ah om ahih di.</p>
    <p>Na gelh lut khit chiang a, a rong ki khek di, huai te apat thumal dik na naih leh gam lat dan sui in.</p>
    <div class="border-[0.5px] my-2 border-gray-100"></div>
    <p>Laimal <span class="font-bold">N</span> bang a om na mun a dik aleh a hing rong suak di.</p>
    <div class="flex gap-1 mb-4">
        <div class="w-14 h-14 flex items-center bg-green-500 justify-center" role="img" aria-label="Correct letter N">
            <span class="text-4xl font-bold">N</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter I">
            <span class="text-4xl font-bold">I</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter A">
            <span class="text-4xl font-bold">A</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter N">
            <span class="text-4xl font-bold">N</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter G">
            <span class="text-4xl font-bold">G</span>  
        </div>
    </div>
    <p>Laimal <span class="font-bold">T</span> bang thumal ah tel, a om na mun a dik kei a leh a rong eng di.</p>
    <div class="flex gap-1 mb-4">
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter A">
            <span class="text-4xl font-bold">A</span>  
        </div>
        <div class="w-14 h-14 flex items-center bg-yellow-500 justify-center" role="img" aria-label="Letter T in wrong spot">
            <span class="text-4xl font-bold">T</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter U">
            <span class="text-4xl font-bold">U</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter A">
            <span class="text-4xl font-bold">A</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter M">
            <span class="text-4xl font-bold">M</span>  
        </div>
    </div>
    <p>Laimal <span class="font-bold">E</span> thumal ah tel kha lou him him ahih a leh grey di.</p>
    <div class="flex gap-1 mb-4">
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter N">
            <span class="text-4xl font-bold">N</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter U">
            <span class="text-4xl font-bold">U</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter M">
            <span class="text-4xl font-bold">M</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 bg-gray-600 border-2 justify-center" role="img" aria-label="Letter E not in word">
            <span class="text-4xl font-bold">E</span>  
        </div>
        <div class="w-14 h-14 flex items-center border-gray-600 border-2 justify-center" role="img" aria-label="Letter I">
            <span class="text-4xl font-bold">I</span>  
        </div>
    </div>
    <div class="border-[0.5px] my-2 border-gray-100"></div>
    <p class="font-bold">Minute 30 zoh thumal thak om zel di.</p>
    <p class="font-bold">Thumal thak om chiang a, thumal lui pen atung lamah dawk ding hi.</p>
</div>