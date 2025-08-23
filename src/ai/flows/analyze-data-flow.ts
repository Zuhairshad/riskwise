
'use server';
/**
 * @fileOverview A Genkit flow for analyzing risk and issue data provided as direct context.
 *
 * - analyzeData - A function that takes a user's question and a data context and returns an analysis.
 * - AnalyzeDataInput - The input type for the analyzeData function.
 * - AnalyzeDataOutput - The return type for the analyzeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeDataInputSchema = z.object({
  question: z.string().describe("The user's question about the data."),
  type: z.enum(['Risk', 'Issue']).optional().describe('The type of data to analyze.'),
  contextData: z.string().optional().describe('JSON string of the data to be analyzed.'),
});
export type AnalyzeDataInput = z.infer<typeof AnalyzeDataInputSchema>;

export const AnalyzeDataOutputSchema = z.object({
  analysis: z.string().describe("The natural language analysis of the data based on the user's question."),
});
export type AnalyzeDataOutput = z.infer<typeof AnalyzeDataOutputSchema>;


const prompt = ai.definePrompt({
  name: 'analyzeDataPrompt',
  input: { schema: AnalyzeDataInputSchema },
  output: { schema: AnalyzeDataOutputSchema },
  system: `You are a helpful data analyst. Your task is to answer the user's question about project risks and issues based *only* on the data provided in the 'contextData' field.

  The contextData is a JSON string containing an array of risks or issues.
  Analyze this data to answer the user's question.

  When analyzing the data, be aware of the following field names:
  - The 'type' field will be either 'Risk' or 'Issue'.
  - The 'Status' field contains the status for both risks and issues (e.g., "Open", "Closed", "Mitigated").
  - The 'DueDate' field contains the due date for both risks and issues.
  - The 'ProjectName' field contains the project name for both.
  - For financial impact on risks, use 'Impact Value ($)'.
  - For financial impact on issues, use 'Impact ($)'.
  - The 'Probability' and 'Imapct Rating (0.05-0.8)' fields are only available for risks.
  
  Provide a concise, clear, and data-driven response. If the question cannot be answered with the available data, state that clearly.`,
  prompt: `User Question: {{{question}}}

  Data to Analyze:
  {{{contextData}}}
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

export async function analyzeData(input: AnalyzeDataInput): Promise<AnalyzeDataOutput> {
  return analyzeDataFlow(input);
}
