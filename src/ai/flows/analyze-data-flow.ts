
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
  question: z.string().describe("The user's question about the data."),
  projects: z.string().describe('A JSON string of all projects.'),
  risksAndIssues: z.string().describe('A JSON string of all risks and issues.'),
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
  system: `You are a helpful data analyst. Your task is to answer the user's question based on the provided JSON data.
The input contains two JSON strings: 'projects' and 'risksAndIssues'.
- Use the 'projects' data for questions about project details.
- Use the 'risksAndIssues' data for questions about risks or issues.
When analyzing financial impact, look for the field "financialImpact".
When looking for due dates, use the "dueDate" field.
When looking for status, use the "status" field.
Provide a concise, clear, and data-driven response. If the question cannot be answered with the available data, state that clearly.`,
  prompt: `The user has asked the following question:
"{{{question}}}"

Analyze the data below to answer it.

Projects Data:
{{{projects}}}

Risks & Issues Data:
{{{risksAndIssues}}}
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
