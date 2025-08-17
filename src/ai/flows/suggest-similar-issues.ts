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
import {risksAndIssues} from '@/lib/data';

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

// Mock function to find similar issue
const findSimilarIssue = (description: string) => {
    const lowercasedDescription = description.toLowerCase();
    // This is a simple mock implementation. A real implementation would use a more sophisticated search.
    const found = risksAndIssues.find(r => r.type === 'Issue' && r.description.toLowerCase().includes(lowercasedDescription.substring(0, 50)));
    if (found) {
        return {
            id: found.id,
            title: found.title,
            discussion: found.description, // Map description to discussion for issues
            resolution: found.resolution,
        }
    }
    return null;
}

export async function suggestSimilarIssues(input: SuggestSimilarIssuesInput): Promise<SuggestSimilarIssuesOutput> {
  // First, check for existing similar issues in our mock data
  const matchedIssue = findSimilarIssue(input.description);

  if (matchedIssue) {
    return { matchedIssue };
  }

  // If no match is found, use AI to rephrase the description
  return suggestSimilarIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rephraseIssueDiscussionPrompt',
  input: {schema: SuggestSimilarIssuesInputSchema},
  output: {schema: SuggestSimilarIssuesOutputSchema},
  prompt: `You are an expert project manager.
  
  A user has entered the following issue discussion. Rephrase it to be clearer, more concise, and professionally worded.
  
  Only return the rephrased description in the 'rephrasedDescription' field.

  Original Discussion: {{{description}}}`,
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

    