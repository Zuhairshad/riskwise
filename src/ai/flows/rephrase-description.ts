'use server';
/**
 * @fileOverview This file contains a Genkit flow for rephrasing a given text description.
 *
 * - rephraseDescription - A function that takes a description and returns a rephrased version.
 * - RephraseDescriptionInput - The input type for the rephraseDescription function.
 * - RephraseDescriptionOutput - The return type for the rephraseDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RephraseDescriptionInputSchema = z.object({
  description: z.string().describe('The text to be rephrased.'),
});
export type RephraseDescriptionInput = z.infer<typeof RephraseDescriptionInputSchema>;

const RephraseDescriptionOutputSchema = z.object({
  rephrasedDescription: z.string().describe('The rephrased version of the description.'),
});
export type RephraseDescriptionOutput = z.infer<typeof RephraseDescriptionOutputSchema>;

export async function rephraseDescription(input: RephraseDescriptionInput): Promise<RephraseDescriptionOutput> {
    return rephraseDescriptionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'rephraseDescriptionPrompt',
    input: {schema: RephraseDescriptionInputSchema},
    output: {schema: RephraseDescriptionOutputSchema},
    prompt: `You are an expert technical writer.
  
    A user has entered the following description. Rephrase it to be clearer, more concise, and professionally worded.
  
    Only return the rephrased description in the 'rephrasedDescription' field.

    Original Description: {{{description}}}`,
});

const rephraseDescriptionFlow = ai.defineFlow(
    {
        name: 'rephraseDescriptionFlow',
        inputSchema: RephraseDescriptionInputSchema,
        outputSchema: RephraseDescriptionOutputSchema,
    },
    async input => {
        const {output} = await prompt(input);
        return output!;
    }
);
