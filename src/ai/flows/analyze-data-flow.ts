'use server';
/**
 * @fileOverview A Genkit flow for analyzing risk and issue data by using a tool to query Firestore.
 *
 * - analyzeData - A function that takes a user's question and returns an analysis.
 * - AnalyzeDataInput - The input type for the analyzeData function.
 * - AnalyzeDataOutput - The return type for the analyzeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getProjectData } from '@/ai/tools/firestore-data-tool';

export const AnalyzeDataInputSchema = z.object({
  question: z.string().describe("The user's question about the data."),
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
  system: `You are a helpful data analyst. Your task is to answer the user's question based on the data provided by the 'getProjectData' tool.
  
  Use the 'getProjectData' tool to retrieve the necessary project, risk, and issue data from the database to answer the question. The tool returns a unified list of risks and issues.

  - The 'type' field will be either 'Risk' or 'Issue'.
  - The 'Status' field contains the status for both risks and issues (e.g., "Open", "Closed", "Mitigated").
  - The 'DueDate' field contains the due date for both risks and issues.
  - The 'ProjectName' field contains the project name for both.
  - For financial impact on risks, use 'Impact Value ($)'.
  - For financial impact on issues, use 'Impact ($)'.
  - The 'Probability' and 'Imapct Rating (0.05-0.8)' fields are only available for risks.
  
  Provide a concise, clear, and data-driven response. If the question cannot be answered with the available data, state that clearly.`,
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
        const { output } = await prompt(input);
        return output!;
    }
);
