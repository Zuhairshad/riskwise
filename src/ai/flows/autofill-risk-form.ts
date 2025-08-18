
'use server';
/**
 * @fileOverview This file contains a Genkit flow for auto-filling the risk form
 * based on a title.
 *
 * - autofillRiskForm - A function that takes a title and returns a matching risk.
 * - AutofillRiskFormInput - The input type for the autofillRiskForm function.
 * - AutofillRiskFormOutput - The return type for the autofillRiskForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AutofillRiskFormInputSchema = z.object({
  title: z.string().describe('The title of the risk.'),
});
export type AutofillRiskFormInput = z.infer<typeof AutofillRiskFormInputSchema>;

const AutofillRiskFormOutputSchema = z.object({
  matchedRisk: z.any().optional().describe('The existing risk that best matches the input.'),
});
export type AutofillRiskFormOutput = z.infer<typeof AutofillRiskFormOutputSchema>;

export async function autofillRiskForm(input: { title: string }): Promise<AutofillRiskFormOutput> {
    // This is a simplified search. A real-world app would use a dedicated search service.
    if (!input.title) {
        return { matchedRisk: null };
    }
    
    const risksRef = collection(db, 'risks');
    const q = query(risksRef, where('Title', '==', input.title), limit(1));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return { matchedRisk: null };
    }

    const matchedRisk = {id: snapshot.docs[0].id, ...snapshot.docs[0].data()};

    return { matchedRisk };
}
