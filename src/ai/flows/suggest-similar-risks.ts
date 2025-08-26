
'use server';
/**
 * @fileOverview A Genkit flow for suggesting similar risks to avoid duplicates.
 *
 * - suggestSimilarRisks - A function that takes a description and returns a detailed analysis of potential duplicates.
 * - SuggestSimilarRisksInput - The input type for the suggestSimilarRisks function.
 * - SuggestSimilarRisksOutput - The return type for the suggestSimilarRisks function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

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
const DetailedSummarySchema = z.object({
    analysis: z.string().describe("A summary of why the new risk is a match to the existing one, including historical context."),
    keyMetrics: z.array(z.object({
        name: z.string().describe("The name of the metric (e.g., 'Probability')"),
        value: z.string().describe("The value of the metric (e.g., '0.9 (High)')"),
    })).describe("A list of key metrics from the matched risk."),
    recommendation: z.string().describe("An AI-powered recommendation based on the historical data."),
});
const SuggestSimilarRisksOutputSchema = z.object({
  matchedRisk: MatchedRiskSchema.optional().describe('The existing risk that matches the description.'),
  rephrasedDescription: z.string().optional().describe('A rephrased version of the description for clarity if no match is found.'),
  detailedSummary: DetailedSummarySchema.optional().describe('A detailed, structured summary and analysis of the matched risk.'),
});
export type SuggestSimilarRisksOutput = z.infer<typeof SuggestSimilarRisksOutputSchema>;

const suggestOrRephraseRiskPrompt = ai.definePrompt({
  name: 'suggestOrRephraseRiskPrompt',
  input: {schema: SuggestSimilarRisksInputSchema},
  output: {schema: SuggestSimilarRisksOutputSchema},
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are an expert risk management analyst. A user is entering a new risk and you need to help them avoid duplicates by providing insightful analysis of past data.
  
  Current risk description:
  "{{{description}}}"

  Here are the existing risks in the database:
  {{{existingRisks}}}
  
  Your primary task is to determine if the new risk is a potential duplicate of an existing one.
  
  - If you find a strong match (semantic similarity > 0.8), your goal is to provide maximum context to the user.
    1. Return the 'matchedRisk' object with the data from the existing risk.
    2. In the 'detailedSummary' field, provide a rich, structured, and analytical summary of the matched risk.
        - In 'analysis', explain WHY it's a match. Include details about the project it occurred on and the historical context.
        - In 'keyMetrics', extract the most important metrics from the matched risk, like 'Probability' and 'Impact Rating'. Format them clearly.
        - In 'recommendation', provide a clear, actionable recommendation for the user. For example, if a contingency plan was missing before, suggest adding one now.
  - If you do not find a strong match, your secondary task is to help the user improve their entry. Rephrase the user's original description to be clearer, more concise, and professionally worded. Return this improved text in the 'rephrasedDescription' field and leave 'matchedRisk' and 'detailedSummary' empty.`,
});

const suggestSimilarRisksFlow = ai.defineFlow(
  {
    name: 'suggestSimilarRisksFlow',
    inputSchema: SuggestSimilarRisksInputSchema,
    outputSchema: SuggestSimilarRisksOutputSchema,
  },
  async (input) => {
    const { output } = await suggestOrRephraseRiskPrompt(input);
    return output!;
  }
);

export async function suggestSimilarRisks(input: SuggestSimilarRisksInput): Promise<SuggestSimilarRisksOutput> {
    return await suggestSimilarRisksFlow(input);
}
