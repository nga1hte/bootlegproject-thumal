// scripts/populateWords.ts
import wordlist from '../ts/wordlist';
import { supabase } from '$lib/supabase';

async function populateWords() {
    try {
        // Shuffle the wordlist
        const shuffledWords = [...wordlist]
            .sort(() => Math.random() - 0.5)
            .map(word => word.toUpperCase());

        // Get current time
        const now = new Date();
        
        // Insert first word for now
        const { error: firstWordError } = await supabase
            .from('scheduled_words')
            .insert([
                {
                    word: shuffledWords[0],
                    scheduled_for: now.toISOString()
                }
            ]);

        if (firstWordError) throw firstWordError;

        // Schedule remaining words with 30-minute intervals
        const scheduledWords = shuffledWords.slice(1).map((word, index) => ({
            word: word,
            scheduled_for: new Date(now.getTime() + ((index + 1) * 30 * 60 * 1000)).toISOString()
        }));

        // Insert words in batches of 100
        const batchSize = 100;
        for (let i = 0; i < scheduledWords.length; i += batchSize) {
            const batch = scheduledWords.slice(i, i + batchSize);
            const { error } = await supabase
                .from('scheduled_words')
                .insert(batch);

            if (error) {
                console.error(`Error inserting batch ${i/batchSize + 1}:`, error);
                continue;
            }

            console.log(`Inserted batch ${i/batchSize + 1} of ${Math.ceil(scheduledWords.length/batchSize)}`);
        }

        console.log(`Successfully scheduled ${scheduledWords.length + 1} words`);
        
        // Log the next few words for verification
        console.log('\nNext few scheduled words:');
        const nextWords = [
            { word: shuffledWords[0], scheduled_for: now.toISOString() },
            ...scheduledWords.slice(0, 5)
        ];
        nextWords.forEach(entry => {
            console.log(`${entry.word} scheduled for ${new Date(entry.scheduled_for).toLocaleString()}`);
        });

    } catch (error) {
        console.error('Error populating words:', error);
    }
}

// Run the script
populateWords();