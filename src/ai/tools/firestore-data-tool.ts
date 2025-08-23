
'use server';
/**
 * @fileOverview A direct data access layer for retrieving project, risk, and issue data from Firestore.
 * This is NOT a Genkit tool, but a set of server-side functions to be called directly by other server components.
 */

import { z } from 'zod';
import { getRisksAndIssues } from '@/services/data-service';

const GetProjectDataSchema = z.object({
    projectName: z.string().optional().describe('The name of the project to retrieve data for.'),
    type: z.enum(['Risk', 'Issue']).optional().describe('Filter by entry type.'),
    status: z.string().optional().describe('Filter by status (e.g., Open, Closed).'),
});

type GetProjectDataInput = z.infer<typeof GetProjectDataSchema>;

export async function getProjectData({ projectName, type, status }: GetProjectDataInput) {
    let risksAndIssues = await getRisksAndIssues();

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
