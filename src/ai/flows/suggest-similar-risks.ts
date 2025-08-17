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
import {risksAndIssues} from '@/lib/data';

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

// Mock function to find similar risk
const findSimilarRisk = (description: string) => {
    if (!description) return null;
    const lowercasedDescription = description.toLowerCase();
    // This is a simple mock implementation. A real implementation would use a more sophisticated search.
    const found = risksAndIssues.find(r => r.type === 'Risk' && r.description && r.description.toLowerCase().includes(lowercasedDescription.substring(0, 50)));
    if (found) {
        return {
            id: found.id,
            title: found.title,
            description: found.description,
            mitigationPlan: found.mitigationPlan,
            contingencyPlan: found.contingencyPlan,
            probability: found.probability,
            impactRating: found.impactRating,
        }
    }
    return null;
}


export async function suggestSimilarRisks(input: SuggestSimilarRisksInput): Promise<SuggestSimilarRisksOutput> {
  // First, check for existing similar risks in our mock data
  const matchedRisk = findSimilarRisk(input.description);

  if (matchedRisk) {
    return { matchedRisk };
  }

  // If no match is found, use AI to rephrase the description
  return suggestSimilarRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rephraseRiskDescriptionPrompt',
  input: {schema: SuggestSimilarRisksInputSchema},
  output: {schema: SuggestSimilarRisksOutputSchema},
  prompt: `You are an expert risk management analyst.
  
  A user has entered the following risk description. Rephrase it to be clearer, more concise, and professionally worded.
  
  Only return the rephrased description in the 'rephrasedDescription' field.

  Original Description: {{{description}}}`,
});

const suggestSimilarRisksFlow = ai.defineFlow(
  {
    name: 'suggestSimilarRisksFlow',
    inputSchema: SuggestSimilarRisksInputSchema,
    outputSchema: SuggestSimilarRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // When no match is found, we only expect a rephrased description.
    return { rephrasedDescription: output?.rephrasedDescription };
  }
);
