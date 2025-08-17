
'use server';
/**
 * @fileOverview This file contains a Genkit flow for auto-filling the risk form
 * based on a title and project code.
 *
 * - autofillRiskForm - A function that takes a title and project code and returns a matching risk.
 * - AutofillRiskFormInput - The input type for the autofillRiskForm function.
 * - AutofillRiskFormOutput - The return type for the autofillRiskForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AutofillRiskFormInputSchema = z.object({
  title: z.string().optional().describe('The title of the risk.'),
  projectCode: z.string().optional().describe('The project code.'),
  existingRisks: z.array(z.any()).describe('A list of existing risks from the database.'),
});
export type AutofillRiskFormInput = z.infer<typeof AutofillRiskFormInputSchema>;

const AutofillRiskFormOutputSchema = z.object({
  matchedRisk: z.any().optional().describe('The existing risk that best matches the input.'),
});
export type AutofillRiskFormOutput = z.infer<typeof AutofillRiskFormOutputSchema>;

export async function autofillRiskForm(input: { title?: string, projectCode?: string }): Promise<AutofillRiskFormOutput> {
    const risksRef = collection(db, 'risks');
    const snapshot = await getDocs(risksRef);
    const existingRisks = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    
    // Only proceed if there's something to match on
    if (!input.title && !input.projectCode) {
        return { matchedRisk: null };
    }

    return autofillRiskFormFlow({ ...input, existingRisks });
}

const prompt = ai.definePrompt({
  name: 'autofillRiskFormPrompt',
  input: {schema: AutofillRiskFormInputSchema},
  output: {schema: AutofillRiskFormOutputSchema},
  prompt: `You are an expert risk management assistant. Your task is to find the most relevant existing risk from a database based on the user's input.

  User's input:
  Title: {{{title}}}
  Project Code: {{{projectCode}}}

  Existing Risks:
  {{#each existingRisks}}
  - ID: {{this.id}}, Title: {{this.Title}}, Project Code: {{this.[Project Code]}}, Description: {{this.Description}}
  {{/each}}

  1.  Analyze the user's input (Title and/or Project Code).
  2.  Find the SINGLE best match from the 'Existing Risks' list. The match should be very strong. If the user provides both Title and Project Code, the existing risk should ideally match both.
  3.  If you find a strong match, populate the 'matchedRisk' field with the complete data object of that existing risk.
  4.  If there is no strong match, return 'matchedRisk' as null. Do not guess or return partial matches.`,
  model: 'googleai/gemini-1.5-flash',
});

const autofillRiskFormFlow = ai.defineFlow(
  {
    name: 'autofillRiskFormFlow',
    inputSchema: AutofillRiskFormInputSchema,
    outputSchema: AutofillRiskFormOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
