
'use server';
/**
 * @fileOverview A Genkit flow for suggesting a category and sub-category for an issue.
 *
 * - suggestCategory - A function that takes a description and returns a suggested category.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestCategoryInputSchema = z.object({
  description: z.string().describe('The issue description to analyze.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  category: z.string().describe('The suggested primary category.'),
  subCategory: z.string().describe('The suggested sub-category.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

const suggestCategoryPrompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: { schema: SuggestCategoryInputSchema },
  output: { schema: SuggestCategoryOutputSchema },
  prompt: `You are an expert at categorizing project management issues.
  
  Based on the following issue description, suggest a relevant Category and Sub-category.
  The categories should be concise and professional.
  
  Description: {{{description}}}`,
  model: 'googleai/gemini-1.5-pro-preview',
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async (input) => {
    const { output } = await suggestCategoryPrompt(input);
    return output!;
  }
);

export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
    return await suggestCategoryFlow(input);
}
