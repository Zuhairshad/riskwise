
'use server';
/**
 * @fileOverview A Genkit flow for analyzing risk and issue data by providing JSON data directly to the prompt.
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
  type: z.enum(['Risk', 'Issue']).optional().describe('The type of data to analyze.'),
  contextData: z.string().describe('JSON string of the data to be analyzed.'),
});
export type AnalyzeDataInput = z.infer<typeof AnalyzeDataInputSchema>;

export const AnalyzeDataOutputSchema = z.object({
  analysis: z.string().describe("The natural language analysis of the data based on the user's question."),
});
export type AnalyzeDataOutput = z.infer<typeof AnalyzeDataOutputSchema>;

export async function analyzeData(input: Omit<AnalyzeDataInput, 'contextData'>): Promise<AnalyzeDataOutput> {
  // Fetch data based on the type specified in the input.
  const { risksAndIssues } = await getProjectData({ type: input.type });
  const contextData = JSON.stringify(risksAndIssues, null, 2);
  
  // Call the flow with the fetched data.
  return analyzeDataFlow({ ...input, contextData });
}

const prompt = ai.definePrompt({
  name: 'analyzeDataPrompt',
  input: { schema: AnalyzeDataInputSchema },
  output: { schema: AnalyzeDataOutputSchema },
  system: `You are a helpful data analyst. Your task is to answer the user's question based on the JSON data provided in the prompt context.
  
  The JSON data represents a list of risks or issues.
  - The 'type' field will be either 'Risk' or 'Issue'.
  - The 'Status' field contains the status for both risks and issues (e.g., "Open", "Closed", "Mitigated").
  - The 'DueDate' field contains the due date for both risks and issues.
  - The 'ProjectName' field contains the project name for both.
  - For financial impact on risks, use 'Impact Value ($)'.
  - For financial impact on issues, use 'Impact ($)'.
  - The 'Probability' and 'Imapct Rating (0.05-0.8)' fields are only available for risks.
  
  Provide a concise, clear, and data-driven response. If the question cannot be answered with the available data, state that clearly. Analyze the data provided in the 'contextData' field.`,
  model: 'googleai/gemini-1.5-flash',
  prompt: `
    User Question: {{{question}}}

    Data Context:
    \`\`\`json
    {{{contextData}}}
    \`\`\`
  `,
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
