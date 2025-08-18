
'use server';
/**
 * @fileOverview This file contains a Genkit flow for suggesting similar issues
 * as the user types in the description textarea. It searches existing data for potential duplicates.
 *
 * - suggestSimilarIssues - A function that takes a description and returns a suggested similar entry or a rephrased description.
 * - SuggestSimilarIssuesInput - The input type for the suggestSimilarIssues function.
 * - SuggestSimilarIssuesOutput - The return type for the suggestSimilarIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarIssuesInputSchema = z.object({
  description: z.string().describe('The description of the issue being entered.'),
  existingIssues: z.string().describe('A JSON string of existing issues to compare against.'),
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

export async function suggestSimilarIssues(input: SuggestSimilarIssuesInput): Promise<SuggestSimilarIssuesOutput> {
    return suggestSimilarIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOrRephraseIssuePrompt',
  input: {schema: SuggestSimilarIssuesInputSchema},
  output: {schema: SuggestSimilarIssuesOutputSchema},
  prompt: `You are an expert project manager. A user is entering a new issue and you need to help them avoid duplicates.

  Current issue description:
  "{{{description}}}"
  
  Here are the existing issues in the database:
  {{{existingIssues}}}

  Your task is to determine if the new issue is a potential duplicate of an existing one.
  
  - If you find a strong match (semantic similarity > 0.8), return the 'matchedIssue' object with the data from the existing issue. When you find a match, only return the 'matchedIssue' and nothing else.
  - If you do not find a strong match, your task is to rephrase the user's original discussion to be clearer, more concise, and professionally worded. Return this improved text in the 'rephrasedDescription' field and leave 'matchedIssue' empty.`,
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
