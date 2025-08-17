
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
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SuggestSimilarIssuesInputSchema = z.object({
  description: z.string().describe('The description of the issue being entered.'),
  existingIssues: z.array(z.any()).describe('A list of existing issues from the database.'),
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
    const issuesRef = collection(db, 'issues');
    const snapshot = await getDocs(issuesRef);
    const existingIssues = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

    return suggestSimilarIssuesFlow({ description: input.description, existingIssues });
}

const prompt = ai.definePrompt({
  name: 'suggestOrRephraseIssuePrompt',
  input: {schema: SuggestSimilarIssuesInputSchema},
  output: {schema: SuggestSimilarIssuesOutputSchema},
  prompt: `You are an expert project manager.
  
  A user has entered the following issue discussion:
  "{{{description}}}"

  Here is a list of existing issues from the database:
  {{#each existingIssues}}
  - ID: {{this.id}}, Title: {{this.Title}}, Discussion: {{this.Discussion}}, Resolution: {{this.Resolution}}
  {{/each}}

  1.  Analyze the user's input and compare it to the list of existing issues.
  2.  If you find a substantially similar issue in the list, identify it as a 'matchedIssue'. Populate the 'matchedIssue' object with the data from that existing issue (id, title, discussion, resolution).
  3.  If you DO NOT find a similar issue, leave 'matchedIssue' empty. Instead, rephrase the user's original discussion to be clearer, more concise, and professionally worded. Return this improved text in the 'rephrasedDescription' field.

  Only return one or the other: either a 'matchedIssue' or a 'rephrasedDescription'.`,
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
