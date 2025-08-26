
'use server';
/**
 * @fileOverview A Genkit flow for suggesting a title based on a description.
 *
 * - suggestTitle - A function that takes a description and returns a suggested title.
 * - SuggestTitleInput - The input type for the suggestTitle function.
 * - SuggestTitleOutput - The return type for the suggestTitle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestTitleInputSchema = z.object({
  description: z.string().describe('The text to generate a title from.'),
});
export type SuggestTitleInput = z.infer<typeof SuggestTitleInputSchema>;

const SuggestTitleOutputSchema = z.object({
  title: z.string().describe('The suggested title.'),
});
export type SuggestTitleOutput = z.infer<typeof SuggestTitleOutputSchema>;

const suggestTitlePrompt = ai.definePrompt({
    name: 'suggestTitlePrompt',
    input: {schema: SuggestTitleInputSchema},
    output: {schema: SuggestTitleOutputSchema},
    prompt: `You are an expert project manager. You are great at writing concise, clear, and descriptive titles.

    A user has entered the following description for a risk or issue. Based on this text, suggest a short, clear title. 
    The title should be no more than 10 words.

    Only return the suggested title in the 'title' field.

    Description: {{{description}}}`,
    model: 'googleai/gemini-1.5-flash-preview',
});

const suggestTitleFlow = ai.defineFlow(
  {
    name: 'suggestTitleFlow',
    inputSchema: SuggestTitleInputSchema,
    outputSchema: SuggestTitleOutputSchema,
  },
  async (input) => {
    const { output } = await suggestTitlePrompt(input);
    return output!;
  }
);

export async function suggestTitle(input: SuggestTitleInput): Promise<SuggestTitleOutput> {
    return await suggestTitleFlow(input);
}
