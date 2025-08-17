
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
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AutofillIssueFormInputSchema = z.object({
  title: z.string().optional().describe('The title of the issue.'),
  projectName: z.string().optional().describe('The name of the project.'),
});
export type AutofillIssueFormInput = z.infer<typeof AutofillIssueFormInputSchema>;

const AutofillIssueFormOutputSchema = z.object({
  matchedIssue: z.any().optional().describe('The existing issue that best matches the input.'),
});
export type AutofillIssueFormOutput = z.infer<typeof AutofillIssueFormOutputSchema>;

export async function autofillIssueForm(input: { title?: string, projectName?: string }): Promise<AutofillIssueFormOutput> {
    // This is a simplified search. A real-world app would use a dedicated search service.
    if (!input.title && !input.projectName) {
        return { matchedIssue: null };
    }
    
    const issuesRef = collection(db, 'issues');
    let q;

    if (input.title) {
        q = query(issuesRef, where('Title', '==', input.title), limit(1));
    } else if (input.projectName) {
        q = query(issuesRef, where('ProjectName', '==', input.projectName), limit(1));
    } else {
         return { matchedIssue: null };
    }

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return { matchedIssue: null };
    }

    const matchedIssue = {id: snapshot.docs[0].id, ...snapshot.docs[0].data()};

    return { matchedIssue };
}
