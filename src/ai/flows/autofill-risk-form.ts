
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
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AutofillRiskFormInputSchema = z.object({
  title: z.string().optional().describe('The title of the risk.'),
  projectCode: z.string().optional().describe('The project code.'),
});
export type AutofillRiskFormInput = z.infer<typeof AutofillRiskFormInputSchema>;

const AutofillRiskFormOutputSchema = z.object({
  matchedRisk: z.any().optional().describe('The existing risk that best matches the input.'),
});
export type AutofillRiskFormOutput = z.infer<typeof AutofillRiskFormOutputSchema>;

export async function autofillRiskForm(input: { title?: string, projectCode?: string }): Promise<AutofillRiskFormOutput> {
    // This is a simplified search. A real-world app would use a dedicated search service.
    if (!input.title && !input.projectCode) {
        return { matchedRisk: null };
    }
    
    const risksRef = collection(db, 'risks');
    let q;

    if (input.title) {
        q = query(risksRef, where('Title', '==', input.title), limit(1));
    } else if (input.projectCode) {
        q = query(risksRef, where('Project Code', '==', input.projectCode), limit(1));
    } else {
        return { matchedRisk: null };
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return { matchedRisk: null };
    }

    const matchedRisk = {id: snapshot.docs[0].id, ...snapshot.docs[0].data()};

    return { matchedRisk };
}
