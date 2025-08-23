
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

const getProjectDataTool = ai.defineTool(
  {
    name: 'getProjectData',
    description: 'Retrieves project, risk, and issue data from the database. Use this tool to get the data needed to answer the user\'s question.',
    inputSchema: z.object({
      type: z.enum(['Risk', 'Issue']).optional().describe('The type of data to retrieve.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => getProjectData(input)
);


export const AnalyzeDataInputSchema = z.object({
  question: z.string().describe("The user's question about the data."),
  type: z.enum(['Risk', 'Issue']).optional().describe('The type of data to analyze.'),
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
  tools: [getProjectDataTool],
  system: `You are a helpful data analyst. Your task is to answer the user's question about project risks and issues.

  To do this, you MUST first call the 'getProjectData' tool to retrieve the relevant data from the database. Use the 'type' parameter in the tool call based on the user's request context ('Risk' or 'Issue').

  Once you have the data from the tool, analyze it to answer the user's question.

  When analyzing the data, be aware of the following field names:
  - The 'type' field will be either 'Risk' or 'Issue'.
  - The 'Status' field contains the status for both risks and issues (e.g., "Open", "Closed", "Mitigated").
  - The 'DueDate' field contains the due date for both risks and issues.
  - The 'ProjectName' field contains the project name for both.
  - For financial impact on risks, use 'Impact Value ($)'.
  - For financial impact on issues, use 'Impact ($)'.
  - The 'Probability' and 'Imapct Rating (0.05-0.8)' fields are only available for risks.
  
  Provide a concise, clear, and data-driven response. If the question cannot be answered with the available data, state that clearly.`,
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
