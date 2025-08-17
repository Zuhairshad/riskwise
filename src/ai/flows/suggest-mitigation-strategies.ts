'use server';
/**
 * @fileOverview An AI agent that suggests mitigation strategies for risks and issues.
 *
 * - suggestMitigationStrategies - A function that suggests mitigation strategies.
 * - SuggestMitigationStrategiesInput - The input type for the suggestMitigationStrategies function.
 * - SuggestMitigationStrategiesOutput - The return type for the suggestMitigationStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMitigationStrategiesInputSchema = z.object({
  riskOrIssueDescription: z
    .string()
    .describe('The description of the risk or issue.'),
  existingData: z
    .string()
    .optional()
    .describe('Existing data related to similar risks or issues.'),
});
export type SuggestMitigationStrategiesInput = z.infer<
  typeof SuggestMitigationStrategiesInputSchema
>;

const SuggestMitigationStrategiesOutputSchema = z.object({
  suggestedMitigationStrategies: z
    .array(z.string())
    .describe('Suggested mitigation strategies based on the input description and existing data.'),
});
export type SuggestMitigationStrategiesOutput = z.infer<
  typeof SuggestMitigationStrategiesOutputSchema
>;

export async function suggestMitigationStrategies(
  input: SuggestMitigationStrategiesInput
): Promise<SuggestMitigationStrategiesOutput> {
  return suggestMitigationStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMitigationStrategiesPrompt',
  input: {schema: SuggestMitigationStrategiesInputSchema},
  output: {schema: SuggestMitigationStrategiesOutputSchema},
  prompt: `You are an AI assistant specializing in suggesting mitigation strategies for risks and issues.

  Based on the description of the risk or issue and any existing data provided, suggest potential mitigation strategies.

  Description: {{{riskOrIssueDescription}}}
  Existing Data: {{{existingData}}}

  Suggest mitigation strategies that are relevant and effective in addressing the described risk or issue.`,
});

const suggestMitigationStrategiesFlow = ai.defineFlow(
  {
    name: 'suggestMitigationStrategiesFlow',
    inputSchema: SuggestMitigationStrategiesInputSchema,
    outputSchema: SuggestMitigationStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
