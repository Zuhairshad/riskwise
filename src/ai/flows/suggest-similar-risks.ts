
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
import type { RiskIssue } from '@/lib/types';

const SuggestSimilarRisksInputSchema = z.object({
  description: z.string().describe('The description of the risk or issue being entered.'),
  existingRisks: z.array(z.any()).describe('A list of existing risks from the database.'),
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
  const risksRef = collection(db, 'risks');
  const snapshot = await getDocs(risksRef);
  const existingRisks = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

  // Now, call the flow with the existing risks
  return suggestSimilarRisksFlow({ description: input.description, existingRisks: existingRisks });
}

const prompt = ai.definePrompt({
  name: 'suggestOrRephraseRiskPrompt',
  input: {schema: SuggestSimilarRisksInputSchema},
  output: {schema: SuggestSimilarRisksOutputSchema},
  prompt: `You are an expert risk management analyst.
  
  A user has entered the following risk description:
  "{{{description}}}"

  Here is a list of existing risks from the database:
  {{#each existingRisks}}
  - ID: {{this.id}}, Title: {{this.Title}}, Description: {{this.Description}}
  {{/each}}

  1.  Analyze the user's description and compare it to the list of existing risks.
  2.  If you find a substantially similar risk in the list, identify it as a 'matchedRisk'. Populate the 'matchedRisk' object with the data from that existing risk (id, title, description, mitigationPlan, contingencyPlan, probability, impactRating). Use the exact field names: id, title, description, mitigationPlan, contingencyPlan, probability, impactRating.
  3.  If you DO NOT find a similar risk, leave 'matchedRisk' empty. Instead, rephrase the user's original description to be clearer, more concise, and professionally worded. Return this improved text in the 'rephrasedDescription' field.

  Only return one or the other: either a 'matchedRisk' or a 'rephrasedDescription'.`,
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
