
/**
 * @fileOverview A Genkit flow for rephrasing a description to be clearer and more professional.
 */

import { ai } from '@/ai/client';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const RephraseDescriptionInputSchema = z.object({
  description: z.string().describe('The text to be rephrased.'),
});
export type RephraseDescriptionInput = z.infer<typeof RephraseDescriptionInputSchema>;

const RephraseDescriptionOutputSchema = z.object({
  rephrasedDescription: z.string().describe('The rephrased version of the description.'),
});
export type RephraseDescriptionOutput = z.infer<typeof RephraseDescriptionOutputSchema>;

const rephraseDescriptionPrompt = ai.definePrompt({
  name: 'rephraseDescriptionPrompt',
  input: { schema: RephraseDescriptionInputSchema },
  output: { schema: RephraseDescriptionOutputSchema },
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are an expert technical writer.
  
    A user has entered the following description. Rephrase it to be clearer, more concise, and professionally worded.
  
    Only return the rephrased description in the 'rephrasedDescription' field.

    Original Description: {{{description}}}`,
});

export const rephraseDescriptionFlow = ai.defineFlow(
  {
    name: 'rephraseDescriptionFlow',
    inputSchema: RephraseDescriptionInputSchema,
    outputSchema: RephraseDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await rephraseDescriptionPrompt(input);
    return output!;
  }
);
