
'use server';
/**
 * @fileOverview This file contains a Genkit flow for auto-filling the issue form
 * based on a title and project name.
 *
 * - autofillIssueForm - A function that takes a title and project name and returns a matching issue.
 * - AutofillIssueFormInput - The input type for the autofillIssueForm function.
 * - AutofillIssueFormOutput - The return type for the autofillIssueForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AutofillIssueFormInputSchema = z.object({
  title: z.string().optional().describe('The title of the issue.'),
  projectName: z.string().optional().describe('The name of the project.'),
  existingIssues: z.array(z.any()).describe('A list of existing issues from the database.'),
});
export type AutofillIssueFormInput = z.infer<typeof AutofillIssueFormInputSchema>;

const AutofillIssueFormOutputSchema = z.object({
  matchedIssue: z.any().optional().describe('The existing issue that best matches the input.'),
});
export type AutofillIssueFormOutput = z.infer<typeof AutofillIssueFormOutputSchema>;

export async function autofillIssueForm(input: { title?: string, projectName?: string }): Promise<AutofillIssueFormOutput> {
    const issuesRef = collection(db, 'issues');
    const snapshot = await getDocs(issuesRef);
    const existingIssues = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    
    // Only proceed if there's something to match on
    if (!input.title && !input.projectName) {
        return { matchedIssue: null };
    }

    return autofillIssueFormFlow({ ...input, existingIssues });
}

const prompt = ai.definePrompt({
  name: 'autofillIssueFormPrompt',
  input: {schema: AutofillIssueFormInputSchema},
  output: {schema: AutofillIssueFormOutputSchema},
  prompt: `You are an expert project management assistant. Your task is to find the most relevant existing issue from a database based on the user's input.

  User's input:
  Title: {{{title}}}
  Project Name: {{{projectName}}}

  Existing Issues:
  {{#each existingIssues}}
  - ID: {{this.id}}, Title: {{this.Title}}, ProjectName: {{this.ProjectName}}, Discussion: {{this.Discussion}}
  {{/each}}

  1.  Analyze the user's input (Title and/or Project Name).
  2.  Find the SINGLE best match from the 'Existing Issues' list. The match should be very strong. If the user provides both Title and Project Name, the existing issue should ideally match both.
  3.  If you find a strong match, populate the 'matchedIssue' field with the complete data object of that existing issue.
  4.  If there is no strong match, return 'matchedIssue' as null. Do not guess or return partial matches.`,
  model: 'googleai/gemini-1.5-flash',
});

const autofillIssueFormFlow = ai.defineFlow(
  {
    name: 'autofillIssueFormFlow',
    inputSchema: AutofillIssueFormInputSchema,
    outputSchema: AutofillIssueFormOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
