
'use server';
/**
 * @fileOverview A Genkit flow for analyzing risk and issue data using a tool.
 *
 * - analyzeData - A function that takes a user's question and a dataset to return an analysis.
 * - AnalyzeDataInput - The input type for the analyzeData function.
 * - AnalyzeDataOutput - The return type for the analyzeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getProjectData } from '../tools/project-data-tool';
import type { RiskIssue, Product } from '@/lib/types';

export const AnalyzeDataInputSchema = z.object({
  question: z.string().describe('The user\'s question about the data.'),
  // We no longer pass the full dataset in the prompt input.
  // The tool will access it from the request-scoped context.
  projects: z.array(z.any()).describe('A list of all projects.'),
  risksAndIssues: z.array(z.any()).describe('A list of all risks and issues.'),
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
  input: { schema: AnalyzeDataInputSchema },
  output: { schema: AnalyzeDataOutputSchema },
  system: `You are a helpful data analyst. Your task is to answer a user's question about project risks and issues.
  
  Use the 'getProjectData' tool to find the relevant data needed to answer the question. You can call this tool for one or more projects to gather the necessary information.
  
  When analyzing financial impact, look for the fields "Impact Value ($)" for risks and "Impact ($)" for issues.
  
  Provide a concise, clear, and data-driven response. If the question cannot be answered with the available data and tools, state that clearly.`,
  tools: [getProjectData],
  model: 'googleai/gemini-1.5-flash',
});


const analyzeDataFlow = ai.defineFlow(
    {
      name: 'analyzeDataFlow',
      inputSchema: AnalyzeDataInputSchema,
      outputSchema: AnalyzeDataOutputSchema,
    },
    async (input) => {
      // The flow now only needs to call the prompt. The prompt itself will use the tool.
      const { output } = await prompt(input);
      return output!;
    }
);
