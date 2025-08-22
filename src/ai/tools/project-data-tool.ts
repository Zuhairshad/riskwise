
'use server';
/**
 * @fileOverview A Genkit tool for retrieving project risk and issue data.
 * The data is stored in a simple in--memory variable, suitable for a single-user,
 * request-scoped context. In a real multi-user app, this would need a more
 * sophisticated state management solution (e.g., Redis, session storage) to
 * isolate data between different users' requests.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { RiskIssue } from '@/lib/types';

// In-memory store for the data. This works for a single request context.
let requestScopedData: RiskIssue[] = [];

/**
 * Sets the data for the current request context.
 * This should be called from a server action before invoking the flow.
 * @param data The array of risks and issues for the current request.
 */
export async function setProjectData(data: RiskIssue[]) {
  requestScopedData = data;
}

export const getProjectData = ai.defineTool(
  {
    name: 'getProjectData',
    description: 'Returns all risks and issues for a given project name. Use this to get the data needed to answer a user\'s question.',
    inputSchema: z.object({
      projectName: z.string().describe('The name of the project to retrieve data for.'),
    }),
    outputSchema: z.array(z.any()).describe('An array of risks and issues for the specified project.'),
  },
  async ({ projectName }) => {
    // Filter the request-scoped data based on the provided project name.
    const projectData = requestScopedData.filter(item => item.ProjectName === projectName);
    return projectData;
  }
);
