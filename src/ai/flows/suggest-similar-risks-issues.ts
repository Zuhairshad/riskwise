'use server';
/**
 * @fileOverview This file contains a Genkit flow for suggesting similar risks/issues
 * as the user types in the description textarea.
 *
 * - suggestSimilarRisksIssues - A function that takes a description and returns suggested similar entries.
 * - SuggestSimilarRisksIssuesInput - The input type for the suggestSimilarRisksIssues function.
 * - SuggestSimilarRisksIssuesOutput - The return type for the suggestSimilarRisksIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarRisksIssuesInputSchema = z.object({
  description: z.string().describe('The description of the risk or issue being entered.'),
});
export type SuggestSimilarRisksIssuesInput = z.infer<typeof SuggestSimilarRisksIssuesInputSchema>;

const SuggestSimilarRisksIssuesOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested similar risks/issues.'),
});
export type SuggestSimilarRisksIssuesOutput = z.infer<typeof SuggestSimilarRisksIssuesOutputSchema>;

export async function suggestSimilarRisksIssues(input: SuggestSimilarRisksIssuesInput): Promise<SuggestSimilarRisksIssuesOutput> {
  return suggestSimilarRisksIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarRisksIssuesPrompt',
  input: {schema: SuggestSimilarRisksIssuesInputSchema},
  output: {schema: SuggestSimilarRisksIssuesOutputSchema},
  prompt: `You are an AI assistant helping users identify potential duplicate risks or issues based on their descriptions.

  Given the following description, suggest a list of existing risks or issues that are similar. Only return an array of strings that match the description.

  Description: {{{description}}}
  `,
});

const suggestSimilarRisksIssuesFlow = ai.defineFlow(
  {
    name: 'suggestSimilarRisksIssuesFlow',
    inputSchema: SuggestSimilarRisksIssuesInputSchema,
    outputSchema: SuggestSimilarRisksIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
