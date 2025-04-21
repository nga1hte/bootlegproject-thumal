import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
    try {
        const now = new Date();
        
        // Get the current and previous scheduled words
        const { data: scheduledWords, error } = await supabase
            .from('scheduled_words')
            .select('word, id')
            .lte('scheduled_for', now.toISOString())
            .order('scheduled_for', { ascending: false })
            .limit(2); // Get current and previous word

        if (error) throw error;
        if (!scheduledWords || scheduledWords.length === 0) {
            return json({ 
                error: 'No word scheduled for current time',
                word: null,
                wordNumber: null,
                previousWord: null,
                previousWordNumber: null
            });
        }

        const currentWord = scheduledWords[0];
        const previousWord = scheduledWords.length > 1 ? scheduledWords[1] : null;

        // Obfuscate current word
        const rot13Current = currentWord.word.split('').map((char: string) => {
            const code = char.charCodeAt(0);
            if (code >= 65 && code <= 90) {
                return String.fromCharCode(((code - 65 + 13) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                return String.fromCharCode(((code - 97 + 13) % 26) + 97);
            }
            return char;
        }).join('');
        const obfuscatedCurrent = btoa(rot13Current);

        // Obfuscate previous word if it exists
        let obfuscatedPrevious = null;
        let previousWordId = null;
        
        if (previousWord) {
            const rot13Previous = previousWord.word.split('').map((char: string) => {
                const code = char.charCodeAt(0);
                if (code >= 65 && code <= 90) {
                    return String.fromCharCode(((code - 65 + 13) % 26) + 65);
                } else if (code >= 97 && code <= 122) {
                    return String.fromCharCode(((code - 97 + 13) % 26) + 97);
                }
                return char;
            }).join('');
            obfuscatedPrevious = btoa(rot13Previous);
            previousWordId = previousWord.id;
        }

        return json({ 
            word: obfuscatedCurrent, 
            wordNumber: currentWord.id,
            previousWord: obfuscatedPrevious,
            previousWordNumber: previousWordId
        });
    } catch (error) {
        console.error('Error in word API:', error);
        return json({ 
            error: 'Failed to process word',
            word: null,
            wordNumber: null,
            previousWord: null,
            previousWordNumber: null
        });
    }
} 