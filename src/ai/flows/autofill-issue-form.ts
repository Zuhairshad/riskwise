
'use server';
/**
 * @fileOverview This file contains a Genkit flow for auto-filling the issue form
 * based on a title.
 *
 * - autofillIssueForm - A function that takes a title and returns a matching issue.
 * - AutofillIssueFormInput - The input type for the autofillIssueForm function.
 * - AutofillIssueFormOutput - The return type for the autofillIssueForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AutofillIssueFormInputSchema = z.object({
  title: z.string().describe('The title of the issue.'),
});
export type AutofillIssueFormInput = z.infer<typeof AutofillIssueFormInputSchema>;

const AutofillIssueFormOutputSchema = z.object({
  matchedIssue: z.any().optional().describe('The existing issue that best matches the input.'),
});
export type AutofillIssueFormOutput = z.infer<typeof AutofillIssueFormOutputSchema>;

export async function autofillIssueForm(input: { title: string }): Promise<AutofillIssueFormOutput> {
    // This is a simplified search. A real-world app would use a dedicated search service.
    if (!input.title) {
        return { matchedIssue: null };
    }
    
    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef, where('Title', '==', input.title), limit(1));
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return { matchedIssue: null };
    }

    const docData = snapshot.docs[0].data();
    const matchedIssue = {id: snapshot.docs[0].id, ...docData};

    return { matchedIssue };
}
