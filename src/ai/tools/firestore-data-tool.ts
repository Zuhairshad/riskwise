
'use server';
/**
 * @fileOverview A direct data access layer for retrieving project, risk, and issue data from Firestore.
 * This is NOT a Genkit tool, but a set of server-side functions to be called directly.
 */

import { z } from 'zod';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RiskIssue, Product } from '@/lib/types';


// Helper function to safely convert Firestore Timestamps to ISO strings
function toISOString(date: any): string | undefined {
    if (!date) {
        return undefined;
    }
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    if (typeof date === 'string') {
        try {
            // Check if the string is already a valid ISO string
            if (!isNaN(new Date(date).getTime())) {
              return new Date(date).toISOString();
            }
        } catch (e) {
            return undefined;
        }
    }
    return undefined;
}


async function getRisksAndIssues(products: Product[]): Promise<RiskIssue[]> {
    const risksCollection = collection(db, "risks");
    const issuesCollection = collection(db, "issues");

    const [riskSnapshot, issueSnapshot] = await Promise.all([
        getDocs(risksCollection),
        getDocs(issuesCollection)
    ]);

    const risks: RiskIssue[] = riskSnapshot.docs.map(doc => {
        const data = doc.data();
        const product = products.find(p => p.code === data['Project Code']);
        return {
          ...data,
          id: doc.id,
          type: 'Risk',
          Title: data.Title || data.Description,
          Status: data["Risk Status"],
          DueDate: toISOString(data.DueDate),
          ProjectName: product?.name || data['Project Code'] || 'Unknown',
        } as unknown as RiskIssue;
    });

    const issues: RiskIssue[] = issueSnapshot.docs.map(doc => {
        const data = doc.data();
        const product = products.find(p => p.name === data.ProjectName);
        return {
          ...data,
          id: doc.id,
          type: 'Issue',
          Title: data.Title,
          ProjectCode: product?.code || data.ProjectName,
          DueDate: toISOString(data["Due Date"]),
          Status: data.Status,
          ProjectName: data.ProjectName || 'Unknown',
        } as unknown as RiskIssue;
    });

    return [...risks, ...issues];
}

async function getProducts(): Promise<Product[]> {
    const productsCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productsCollection);
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

const GetProjectDataSchema = z.object({
    projectName: z.string().optional().describe('The name of the project to retrieve data for.'),
    type: z.enum(['Risk', 'Issue']).optional().describe('Filter by entry type.'),
    status: z.string().optional().describe('Filter by status (e.g., Open, Closed).'),
});

type GetProjectDataInput = z.infer<typeof GetProjectDataSchema>;

export async function getProjectData({ projectName, type, status }: GetProjectDataInput) {
    const products = await getProducts();
    let risksAndIssues = await getRisksAndIssues(products);

    if (projectName) {
        risksAndIssues = risksAndIssues.filter(item => item.ProjectName === projectName);
    }
    if (type) {
        risksAndIssues = risksAndIssues.filter(item => item.type === type);
    }
    if (status) {
        risksAndIssues = risksAndIssues.filter(item => (item.Status) === status);
    }

    return { risksAndIssues };
}
