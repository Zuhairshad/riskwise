
'use server';
/**
 * @fileOverview A Genkit flow for analyzing risk and issue data.
 * This flow uses a tool to fetch data and then provides a structured analysis.
 *
 * - analyzeData - The main function to call the flow.
 * - AnalyzeDataInput - The input schema for the analyzeData function.
 * - AnalyzeDataOutput - The output schema for the analyzeData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getProjectData } from '../tools/get-project-data-tool';
import { googleAI } from '@genkit-ai/googleai';

const AnalyzeDataInputSchema = z.object({
  question: z.string().describe("The user's question about the data."),
  type: z.enum(['Risk', 'Issue']).describe('The type of data to analyze.'),
});
export type AnalyzeDataInput = z.infer<typeof AnalyzeDataInputSchema>;

const AnalyzeDataOutputSchema = z.object({
  analysis: z.string().describe("The natural language analysis of the data based on the user's question."),
  tableData: z.any().describe("The raw data used for the analysis, to be displayed in a table. Should be an array of objects."),
  chartData: z.any().optional().describe("Data formatted for a chart (e.g., bar, pie). Should be an array of objects with keys like 'name' and 'value'."),
});
export type AnalyzeDataOutput = z.infer<typeof AnalyzeDataOutputSchema>;

const prompt = ai.definePrompt({
  name: 'dataAnalysisPrompt',
  input: { schema: AnalyzeDataInputSchema },
  output: { schema: AnalyzeDataOutputSchema },
  tools: [getProjectData],
  system: `You are an expert data analyst specializing in project management risks and issues.
  Your primary task is to answer the user's question about their project data.

  You MUST follow these steps:
  1. ALWAYS call the 'getProjectData' tool first to fetch the relevant data. You only need to pass the 'type' to the tool.
  2. The tool will return ALL data of that type (e.g., all risks). YOU are responsible for filtering this data based on the user's specific question (e.g., by status, by project, by date).
  3. Once you have filtered the data, analyze it to answer the user's question.
  4. Formulate a clear, natural language answer in the 'analysis' field. This should directly address the user's question.
  5. Provide the filtered data that you used for your analysis in the 'tableData' field.
  6. If the user's question implies a need for a chart (e.g., "show me the breakdown by status", "compare projects by risk count"), create a simple chart data structure in the 'chartData' field. The chart data should be an array of objects, for example: [{ name: 'Category A', value: 10 }, { name: 'Category B', value: 20 }]. If no chart is relevant, leave this field null.
  
  IMPORTANT: If the tool returns no data or the filtered data is empty, your analysis should state that no relevant data was found. DO NOT make up data.
  
  Be concise and data-driven in your analysis.`,
  prompt: `User Question: {{{question}}}
  Data Type: {{{type}}}
  `,
  model: googleAI.model('gemini-1.5-flash'),
});

const analyzeDataFlow = ai.defineFlow(
  {
    name: 'analyzeDataFlow',
    inputSchema: AnalyzeDataInputSchema,
    outputSchema: AnalyzeDataOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("FLOW_EXECUTION_TIMEOUT: The AI model did not produce an output in time. Please try a simpler question or check the server logs.");
    }
    return output;
  }
);

export async function analyzeData(input: AnalyzeDataInput): Promise<AnalyzeDataOutput> {
  return analyzeDataFlow(input);
}
