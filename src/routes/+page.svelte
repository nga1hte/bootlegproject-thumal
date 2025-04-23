<script lang="ts">
  import { guessLetter, deleteLetter, guessWord, gameState, initializeGame, wordNumber, previousWord } from "$lib/state/gameState.svelte";
  import { displayAlert } from "$lib/state/alertState.svelte";
  import { CONSTANTS, ALERT_TYPES } from "$lib/ts/constants";
  import { DICTIONARY } from "$lib/ts/dictionary";
  import { onMount } from "svelte";
  import Overlay from "$lib/components/Overlay.svelte";
  import NewPlayerInfo from "$lib/components/NewPlayerInfo.svelte";
  import Alert from "$lib/components/Alert.svelte";
  import Keyboard from "$lib/components/Keyboard.svelte";
  import WordInput from "$lib/components/WordInput.svelte";
  import Header from "$lib/components/Header.svelte";
    
  let loaded = false;
  let userId: string | null = null;
  let showInstructions = false;

  async function checkAndCreateUser() {
    try {
      // First try to get existing user
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        userId = data.user.id;
        return;
      }

      // If no user exists, create a new one
      const createResponse = await fetch('/api/user', {
        method: 'POST'
      });

      if (createResponse.ok) {
        const data = await createResponse.json();
        userId = data.user.id;
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      console.error('Error in user management:', error);
      displayAlert('Error initializing user session', ALERT_TYPES.DANGER);
    }
  }

  onMount(async () => {
      await checkAndCreateUser();
      await initializeGame();
      loaded = true;
      
      // Show previous word alert if available
      const prevWord = previousWord.getWord();
      if (prevWord) {
          const definition = DICTIONARY[prevWord] || '';
          displayAlert(`Thumal luipen: ${prevWord} - ${definition}`, ALERT_TYPES.INFO, 12000);
      }
  });

  const handleKeydown = (e: KeyboardEvent) => {
      if(e.shiftKey || e.ctrlKey || gameState.state === CONSTANTS.GAME_STATES.WIN){
          return;
      }
      
      const {key} = e;
      if(e.code === "Backspace") {
          deleteLetter();
      }
      else if(e.code === "Enter"){
          e.preventDefault();
          guessWord();
      }
      else if(key === "?"){
          e.preventDefault();
          showInstructions = true;
      }
      else if(isLetter(key)){
          guessLetter(key);
      }
  };

  function isLetter(str: string): boolean {
      const upperStr = str.toUpperCase();
      return CONSTANTS.ALPHABET.some(letter => letter === upperStr);
  }
</script>

<Header wordNumber={wordNumber.number} />
<svelte:window onkeydown={handleKeydown}/>
{#if loaded }
  {#if showInstructions}
      <Overlay onClose={() => showInstructions = false}>
          <NewPlayerInfo/>
      </Overlay>
  {/if}
  <div class="w-full h-screen bg-black text-white mx-auto min-w-10 flex flex-col items-center">
      <div class="flex flex-col gap-y-2 max-w-2xl w-full items-center pt-2">
          <div class="text-center p-4 bg-gray-800 rounded-lg shadow-lg">
              <h3 class="text-xl font-bold mb-2">Competition Start Time</h3>
              <p class="text-lg">Competition starts at <span class="text-yellow-400 font-semibold">9:00 PM</span></p>
          </div>
          <Alert/>
          <div class="flex flex-col gap-y-1">
              {#each Array(CONSTANTS.MAX_GUESSES) as _, i}
                  <div class="flex mx-auto space-x-1 mb-1 text-white">
                      <WordInput wordIndex={i} />
                  </div>
              {/each}
          </div>
          <div class="mt-4 md:mt-8">
              <Keyboard gameState={gameState.state}/>
          </div>
          <div class="mt-8 text-center">
           Visit 
              <a href="https://bootlegproject.shop" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 transition-colors">
                  bootlegproject.
              </a>
          </div>
      </div>
  </div>
{/if}
