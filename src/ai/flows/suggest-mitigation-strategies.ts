
'use server';
/**
 * @fileOverview A Genkit flow for suggesting mitigation strategies for a risk or issue.
 *
 * - suggestMitigationStrategies - A function that takes a description and returns suggested strategies.
 * - SuggestMitigationStrategiesInput - The input type for the suggestMitigationStrategies function.
 * - SuggestMitigationStrategiesOutput - The return type for the suggestMitigationStrategies function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestMitigationStrategiesInputSchema = z.object({
  riskOrIssueDescription: z
    .string()
    .describe('The description of the risk or issue.'),
});
export type SuggestMitigationStrategiesInput = z.infer<typeof SuggestMitigationStrategiesInputSchema>;

const SuggestMitigationStrategiesOutputSchema = z.object({
  suggestedMitigationStrategies: z
    .array(z.string())
    .describe('Suggested mitigation strategies based on the input description.'),
});
export type SuggestMitigationStrategiesOutput = z.infer<typeof SuggestMitigationStrategiesOutputSchema>;

const suggestMitigationStrategiesPrompt = ai.definePrompt({
  name: 'suggestMitigationStrategiesPrompt',
  input: { schema: SuggestMitigationStrategiesInputSchema },
  output: { schema: SuggestMitigationStrategiesOutputSchema },
  prompt: `You are an AI assistant specializing in suggesting mitigation strategies for risks and issues.
  Based on the description of the risk or issue, suggest 3 to 5 potential mitigation strategies.
  Description: {{{riskOrIssueDescription}}}
  Suggest mitigation strategies that are relevant and effective in addressing the described risk or issue.`,
  model: 'googleai/gemini-1.5-flash-preview',
});

const suggestMitigationStrategiesFlow = ai.defineFlow(
  {
    name: 'suggestMitigationStrategiesFlow',
    inputSchema: SuggestMitigationStrategiesInputSchema,
    outputSchema: SuggestMitigationStrategiesOutputSchema,
  },
  async (input) => {
    const { output } = await suggestMitigationStrategiesPrompt(input);
    return output!;
  }
);

export async function suggestMitigationStrategies(input: SuggestMitigationStrategiesInput): Promise<SuggestMitigationStrategiesOutput> {
    return await suggestMitigationStrategiesFlow(input);
}
