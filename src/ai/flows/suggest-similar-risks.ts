
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
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
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

// Function to find similar risk in Firestore
const findSimilarRisk = async (description: string) => {
    if (!description || description.length < 20) return null;
    
    const risksRef = collection(db, 'risks');
    // Basic substring search. A more advanced implementation might use a dedicated search service.
    const q = query(risksRef, where('Description', '>=', description.substring(0, 50)), where('Description', '<=', description.substring(0, 50) + '\uf8ff'), limit(1));
    
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            title: data.Title,
            description: data.Description,
            mitigationPlan: data.MitigationPlan,
            contingencyPlan: data.ContingencyPlan,
            probability: data.Probability,
            impactRating: data['Imapct Rating (0.05-0.8)'],
        }
    }
    return null;
}


export async function suggestSimilarRisks(input: SuggestSimilarRisksInput): Promise<SuggestSimilarRisksOutput> {
  // First, check for existing similar risks in our database
  const matchedRisk = await findSimilarRisk(input.description);

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
