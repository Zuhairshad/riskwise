
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
import type { RiskIssue, Product } from '@/lib/types';

export const AnalyzeDataInputSchema = z.object({
  question: z.string().describe("The user's question about the data."),
  projects: z.array(z.any()).describe('A list of all projects.'),
  risksAndIssues: z.array(z.any()).describe('A list of all risks and issues.'),
});
export type AnalyzeDataInput = z.infer<typeof AnalyzeDataInputSchema>;

export const AnalyzeDataOutputSchema = z.object({
  analysis: z.string().describe("The natural language analysis of the data based on the user's question."),
});
export type AnalyzeDataOutput = z.infer<typeof AnalyzeDataOutputSchema>;

export async function analyzeData(input: AnalyzeDataInput): Promise<AnalyzeDataOutput> {
  return analyzeDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDataPrompt',
  input: { schema: AnalyzeDataInputSchema },
  output: { schema: AnalyzeDataOutputSchema },
  system: `You are a helpful data analyst. Your task is to answer a user's question based on the provided JSON data for projects, risks, and issues.
  
  When analyzing financial impact, look for the fields "Impact Value ($)" for risks and "Impact ($)" for issues.

  When answering questions about projects, use the 'projects' data which contains a list of all available projects.
  When answering questions about risks or issues, use the 'risksAndIssues' data.

  Provide a concise, clear, and data-driven response. If the question cannot be answered with the available data, state that clearly.`,
  prompt: `
  Projects Data:
  {{{json projects}}}

  Risks and Issues Data:
  {{{json risksAndIssues}}}

  Question: {{{question}}}
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
