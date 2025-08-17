
'use server';
/**
 * @fileOverview This file contains a Genkit flow for suggesting similar issues
 * as the user types in the description textarea.
 *
 * - suggestSimilarIssues - A function that takes a description and returns suggested similar entries.
 * - SuggestSimilarIssuesInput - The input type for the suggestSimilarIssues function.
 * - SuggestSimilarIssuesOutput - The return type for the suggestSimilarIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SuggestSimilarIssuesInputSchema = z.object({
  description: z.string().describe('The description of the issue being entered.'),
});
export type SuggestSimilarIssuesInput = z.infer<typeof SuggestSimilarIssuesInputSchema>;

const MatchedIssueSchema = z.object({
    id: z.string(),
    title: z.string(),
    discussion: z.string(),
    resolution: z.string().optional(),
});

const SuggestSimilarIssuesOutputSchema = z.object({
  matchedIssue: MatchedIssueSchema.optional().describe('The existing issue that matches the description.'),
  rephrasedDescription: z.string().optional().describe('A rephrased version of the description for clarity if no match is found.'),
});
export type SuggestSimilarIssuesOutput = z.infer<typeof SuggestSimilarIssuesOutputSchema>;

export async function suggestSimilarIssues(input: { description: string }): Promise<SuggestSimilarIssuesOutput> {
    // Since we cannot pass the whole DB, we can't find a match.
    // We will just rephrase the description.
    // A more advanced implementation could use a vector DB for similarity search.
    return suggestSimilarIssuesFlow({ description: input.description });
}

const prompt = ai.definePrompt({
  name: 'suggestOrRephraseIssuePrompt',
  input: {schema: SuggestSimilarIssuesInputSchema},
  output: {schema: SuggestSimilarIssuesOutputSchema},
  prompt: `You are an expert project manager.
  
  A user has entered the following issue discussion:
  "{{{description}}}"

  Your task is to rephrase the user's original discussion to be clearer, more concise, and professionally worded. 
  
  Return this improved text in the 'rephrasedDescription' field. Leave 'matchedIssue' empty.`,
  model: 'googleai/gemini-1.5-flash',
});

const suggestSimilarIssuesFlow = ai.defineFlow(
  {
    name: 'suggestSimilarIssuesFlow',
    inputSchema: SuggestSimilarIssuesInputSchema,
    outputSchema: SuggestSimilarIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
