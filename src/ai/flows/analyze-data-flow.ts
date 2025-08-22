
'use server';
/**
 * @fileOverview A Genkit flow for analyzing risk and issue data.
 *
 * - analyzeData - A function that takes a user's question and a dataset to return an analysis.
 * - AnalyzeDataInput - The input type for the analyzeData function.
 * - AnalyzeDataOutput - The return type for the analyzeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeDataInputSchema = z.object({
  question: z.string().describe('The user\'s question about the data.'),
  dataJson: z.string().describe('The risk and issue data in JSON format.'),
});
export type AnalyzeDataInput = z.infer<typeof AnalyzeDataInputSchema>;

export const AnalyzeDataOutputSchema = z.object({
  analysis: z.string().describe('The natural language analysis of the data based on the user\'s question.'),
});
export type AnalyzeDataOutput = z.infer<typeof AnalyzeDataOutputSchema>;

export async function analyzeData(input: AnalyzeDataInput): Promise<AnalyzeDataOutput> {
  return analyzeDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDataPrompt',
  input: {schema: AnalyzeDataInputSchema},
  output: {schema: AnalyzeDataOutputSchema},
  prompt: `You are a helpful data analyst. Your task is to answer a user's question based on the provided JSON data containing risks and issues.

  Analyze the data provided in the 'dataJson' field to answer the following question. Provide a concise, clear, and data-driven response.
  If the question cannot be answered with the given data, state that clearly.

  IMPORTANT: The financial impact of an item can be found in either the "Impact Value ($)" field (for risks) or the "Impact ($)" field (for issues). Please consider both fields when analyzing cost or financial impact.

  JSON Data:
  {{{dataJson}}}

  User's Question:
  "{{{question}}}"
  `,
  model: 'googleai/gemini-1.5-flash',
});


const analyzeDataFlow = ai.defineFlow(
    {
      name: 'analyzeDataFlow',
      inputSchema: AnalyzeDataInputSchema,
      outputSchema: AnalyzeDataOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
      return output!;
    }
  );
