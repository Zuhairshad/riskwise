
'use server';
/**
 * @fileOverview A Genkit tool for retrieving project, risk, and issue data from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RiskIssue, Product } from '@/lib/types';


// Helper function to safely convert Firestore Timestamps to ISO strings
function toISOString(date: any): string | undefined {
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    if (typeof date === 'string' || typeof date === 'undefined') {
        return date;
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
        return {
          ...data,
          id: doc.id,
          type: 'Risk',
          Title: data.Title || data.Description,
          Status: data["Risk Status"],
          DueDate: toISOString(data.DueDate),
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
        } as unknown as RiskIssue;
    });

    return [...risks, ...issues];
}

async function getProducts(): Promise<Product[]> {
    const productsCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productsCollection);
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}


export const getProjectData = ai.defineTool(
  {
    name: 'getProjectData',
    description: 'Returns projects, risks and issues from the database. Can be filtered by project name, risk/issue type, or status.',
    inputSchema: z.object({
        projectName: z.string().optional().describe('The name of the project to retrieve data for.'),
        type: z.enum(['Risk', 'Issue']).optional().describe('Filter by entry type.'),
        status: z.string().optional().describe('Filter by status (e.g., Open, Closed).'),
    }),
    outputSchema: z.object({
        projects: z.array(z.any()).describe("An array of project objects."),
        risksAndIssues: z.array(z.any()).describe('An array of risks and issues.'),
    }),
  },
  async ({ projectName, type, status }) => {
    const projects = await getProducts();
    let risksAndIssues = await getRisksAndIssues(projects);

    if (projectName) {
        risksAndIssues = risksAndIssues.filter(item => {
            const itemProjectName = item.ProjectName || projects.find(p => p.code === item['Project Code'])?.name;
            return itemProjectName === projectName;
        });
    }
    if (type) {
        risksAndIssues = risksAndIssues.filter(item => item.type === type);
    }
    if (status) {
        risksAndIssues = risksAndIssues.filter(item => (item.Status || item['Risk Status']) === status);
    }

    return { projects, risksAndIssues };
  }
);
