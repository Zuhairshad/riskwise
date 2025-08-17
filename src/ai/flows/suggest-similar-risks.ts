
'use server';
/**
 * @fileOverview This file contains a Genkit flow for suggesting similar risks
 * as the user types in the description textarea.
 *
 * - suggestSimilarRisks - A function that takes a description and returns suggested similar entries.
 * - SuggestSimilarRisksInput - The input type for the suggestSimilarRisks function.
 * - SuggestSimilarRisksOutput - The return type for the suggestSimilarRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SuggestSimilarRisksInputSchema = z.object({
  description: z.string().describe('The description of the risk or issue being entered.'),
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


export async function suggestSimilarRisks(input: {description: string}): Promise<SuggestSimilarRisksOutput> {
  // Since we cannot pass the whole DB, we can't find a match.
  // We will just rephrase the description.
  // A more advanced implementation could use a vector DB for similarity search.
  return suggestSimilarRisksFlow({ description: input.description });
}

const prompt = ai.definePrompt({
  name: 'suggestOrRephraseRiskPrompt',
  input: {schema: SuggestSimilarRisksInputSchema},
  output: {schema: SuggestSimilarRisksOutputSchema},
  prompt: `You are an expert risk management analyst.
  
  A user has entered the following risk description:
  "{{{description}}}"

  Your task is to rephrase the user's original description to be clearer, more concise, and professionally worded.
  
  Return this improved text in the 'rephrasedDescription' field. Leave 'matchedRisk' empty.`,
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
