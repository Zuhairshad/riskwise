'use server';
/**
 * @fileOverview This file contains a Genkit flow for suggesting similar risks/issues
 * as the user types in the description textarea.
 *
 * - suggestSimilarRisks - A function that takes a description and returns suggested similar entries.
 * - SuggestSimilarRisksInput - The input type for the suggestSimilarRisks function.
 * - SuggestSimilarRisksOutput - The return type for the suggestSimilarRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarRisksInputSchema = z.object({
  description: z.string().describe('The description of the risk or issue being entered.'),
});
export type SuggestSimilarRisksInput = z.infer<typeof SuggestSimilarRisksInputSchema>;

const SuggestSimilarRisksOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested similar risks/issues.'),
});
export type SuggestSimilarRisksOutput = z.infer<typeof SuggestSimilarRisksOutputSchema>;

export async function suggestSimilarRisks(input: SuggestSimilarRisksInput): Promise<SuggestSimilarRisksOutput> {
  return suggestSimilarRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarRisksPrompt',
  input: {schema: SuggestSimilarRisksInputSchema},
  output: {schema: SuggestSimilarRisksOutputSchema},
  prompt: `You are an AI assistant helping users identify potential duplicate risks or issues based on their descriptions.

  Given the following description, suggest a list of existing risks or issues that are similar. Only return an array of strings that match the description.

  Description: {{{description}}}`,
});

const suggestSimilarRisksFlow = ai.defineFlow(
  {
    name: 'suggestSimilarRisksFlow',
    inputSchema: SuggestSimilarRisksInputSchema,
    outputSchema: SuggestSimilarRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
