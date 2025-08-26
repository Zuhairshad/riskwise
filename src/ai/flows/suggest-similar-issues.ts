
'use server';
/**
 * @fileOverview A Genkit flow for suggesting similar issues to avoid duplicates.
 *
 * - suggestSimilarIssues - A function that takes a description and returns a detailed analysis of potential duplicates.
 * - SuggestSimilarIssuesInput - The input type for the suggestSimilarIssues function.
 * - SuggestSimilarIssuesOutput - The return type for the suggestSimilarIssues function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

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
const DetailedSummarySchema = z.object({
    analysis: z.string().describe("A summary of why the new issue is a match to the existing one, including historical context."),
    keyMetrics: z.array(z.object({
        name: z.string().describe("The name of the metric (e.g., 'Priority')"),
        value: z.string().describe("The value of the metric (e.g., 'High')"),
    })).describe("A list of key metrics from the matched issue."),
    recommendation: z.string().describe("An AI-powered recommendation based on the historical data."),
});
const SuggestSimilarIssuesOutputSchema = z.object({
  matchedIssue: MatchedIssueSchema.optional().describe('The existing issue that matches the description.'),
  rephrasedDescription: z.string().optional().describe('A rephrased version of the description for clarity if no match is found.'),
  detailedSummary: DetailedSummarySchema.optional().describe('A detailed, structured summary and analysis of the matched issue.'),
});
export type SuggestSimilarIssuesOutput = z.infer<typeof SuggestSimilarIssuesOutputSchema>;


const suggestOrRephraseIssuePrompt = ai.definePrompt({
  name: 'suggestOrRephraseIssuePrompt',
  input: {schema: SuggestSimilarIssuesInputSchema},
  output: {schema: SuggestSimilarIssuesOutputSchema},
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are an expert project manager. A user is entering a new issue and you need to help them avoid duplicates by providing insightful analysis of past data.

  Current issue description:
  "{{{description}}}"
  
  Here are the existing issues in the database:
  {{{existingIssues}}}

  Your primary task is to determine if the new issue is a potential duplicate of an existing one.
  
  - If you find a strong match (semantic similarity > 0.8), your goal is to provide maximum context to the user.
    1. Return the 'matchedIssue' object with the data from the existing issue.
    2. In the 'detailedSummary' field, provide a rich, structured, and analytical summary of the matched issue.
        - In 'analysis', explain WHY it's a match. Include details about the project it occurred on and the historical context.
        - In 'keyMetrics', extract the most important metrics from the matched issue, like 'Priority' and 'Impact'. Format them clearly.
        - In 'recommendation', provide a clear, actionable recommendation for the user. For example, if a resolution was particularly effective, highlight it.
  - If you do not find a strong match, your secondary task is to help the user improve their entry. Rephrase the user's original discussion to be clearer, more concise, and professionally worded. Return this improved text in the 'rephrasedDescription' field and leave 'matchedIssue' and 'detailedSummary' empty.`,
});

const suggestSimilarIssuesFlow = ai.defineFlow(
  {
    name: 'suggestSimilarIssuesFlow',
    inputSchema: SuggestSimilarIssuesInputSchema,
    outputSchema: SuggestSimilarIssuesOutputSchema,
  },
  async (input) => {
    const { output } = await suggestOrRephraseIssuePrompt(input);
    return output!;
  }
);

export async function suggestSimilarIssues(input: SuggestSimilarIssuesInput): Promise<SuggestSimilarIssuesOutput> {
    return await suggestSimilarIssuesFlow(input);
}
