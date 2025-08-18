
'use server';
/**
 * @fileOverview This file contains a Genkit flow for suggesting similar risks
 * as the user types in the description textarea. It searches existing data for potential duplicates.
 *
 * - suggestSimilarRisks - A function that takes a description and returns a suggested similar entry or a rephrased description.
 * - SuggestSimilarRisksInput - The input type for the suggestSimilarRisks function.
 * - SuggestSimilarRisksOutput - The return type for the suggestSimilarRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarRisksInputSchema = z.object({
  description: z.string().describe('The description of the risk or issue being entered.'),
  existingRisks: z.string().describe('A JSON string of existing risks to compare against.'),
});
export type SuggestSimilarRisksInput = z.infer<typeof SuggestSimilarRisksInputSchema>;

const MatchedRiskSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    mitigationPlan: z.string().optional(),
    contingencyPlan: z.string().optional(),
    probability: z.number().optional(),
    impactRating: z.number().optional(),
});

const SuggestSimilarRisksOutputSchema = z.object({
  matchedRisk: MatchedRiskSchema.optional().describe('The existing risk that matches the description.'),
  rephrasedDescription: z.string().optional().describe('A rephrased version of the description for clarity if no match is found.'),
});
export type SuggestSimilarRisksOutput = z.infer<typeof SuggestSimilarRisksOutputSchema>;


export async function suggestSimilarRisks(input: SuggestSimilarRisksInput): Promise<SuggestSimilarRisksOutput> {
    return suggestSimilarRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOrRephraseRiskPrompt',
  input: {schema: SuggestSimilarRisksInputSchema},
  output: {schema: SuggestSimilarRisksOutputSchema},
  prompt: `You are an expert risk management analyst. A user is entering a new risk and you need to help them avoid duplicates.
  
  Current risk description:
  "{{{description}}}"

  Here are the existing risks in the database:
  {{{existingRisks}}}
  
  Your task is to determine if the new risk is a potential duplicate of an existing one.
  
  - If you find a strong match (semantic similarity > 0.8), return the 'matchedRisk' object with the data from the existing risk. When you find a match, only return the 'matchedRisk' and nothing else.
  - If you do not find a strong match, your task is to rephrase the user's original description to be clearer, more concise, and professionally worded. Return this improved text in the 'rephrasedDescription' field and leave 'matchedRisk' empty.`,
  model: 'googleai/gemini-1.5-flash',
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
