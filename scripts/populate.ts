import { supabase } from '../src/lib/supabase';
import answers from '../src/lib/ts/wordlist';

async function populateScheduledWords() {
    try {
        // Clear existing scheduled words
        const { error: deleteError } = await supabase
            .from('scheduled_words')
            .delete()
            .neq('id', 0); // Delete all records

        if (deleteError) throw deleteError;

        // Shuffle the word list
        const shuffledWords = [...answers].sort(() => Math.random() - 0.5);

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

        // Insert remaining words with one-minute intervals
        const insertPromises = shuffledWords.slice(1).map((word, index) => {
            const scheduledTime = new Date(now.getTime() + ((index + 1) * 60 * 1000)); // Add (index + 1) minutes
            return supabase
                .from('scheduled_words')
                .insert([
                    {
                        word: word,
                        scheduled_for: scheduledTime.toISOString()
                    }
                ]);
        });

        await Promise.all(insertPromises);
        console.log('Successfully populated scheduled words');
        console.log(`First word available now, next word in 1 minute`);
    } catch (error) {
        console.error('Error populating scheduled words:', error);
    }
}

populateScheduledWords(); 