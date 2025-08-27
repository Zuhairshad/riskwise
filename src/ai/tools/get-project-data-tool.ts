
/**
 * @fileOverview A Genkit tool for fetching project risk and issue data from Firestore.
 */
'use server';
import { ai } from '@/ai/client';
import { z } from 'zod';
import { getRisksAndIssues } from '@/services/data-service';

export const getProjectData = ai.defineTool(
  {
    name: 'getProjectData',
    description: 'Retrieves project risks or issues from the database. Can be filtered by type, status, and project name.',
    inputSchema: z.object({
        type: z.enum(['Risk', 'Issue']).describe('Filter by entry type (Risk or Issue).'),
        // The prompt is now smart enough to infer filters from the user's question,
        // so we don't need to explicitly define every possible filter field here.
        // We only need the 'type' to know which collection to query.
      }),
    outputSchema: z.array(z.any()),
  },
  async ({ type }) => {
    console.log(`[Tool Executed] getProjectData called with type: ${type}`);
    
    try {
      // The data service now handles fetching and combining risks/issues
      const allData = await getRisksAndIssues();

      const filteredData = allData.filter(item => item.type === type);
      
      if (filteredData.length === 0) {
        // Return an empty array. The flow's prompt will handle this scenario.
        console.warn("NO_DATA_IN_SCOPE: No data found for the given type.");
        return [];
      }
      
      // Return the raw data. The AI is capable of handling it and extracting what it needs.
      // Over-processing here can remove valuable context.
      return filteredData;

    } catch (err: any) {
        console.error(`[Tool Error] Failed to get project data: ${err.message}`);
        // Provide a clearer error message to the flow.
        if (err.code === 'permission-denied') {
             throw new Error("PERMISSION_DENIED: You do not have permission to access this data.");
        }
        throw new Error(`DATABASE_ERROR: The data query failed. Details: ${err.message}`);
    }
  }
);
