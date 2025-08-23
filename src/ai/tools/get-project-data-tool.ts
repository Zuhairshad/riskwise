
'use server';
/**
 * @fileOverview A Genkit tool for fetching project risk and issue data from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getRisksAndIssues } from '@/services/data-service';

export const getProjectData = ai.defineTool(
  {
    name: 'getProjectData',
    description: 'Retrieves project risks or issues from the database. Can be filtered by type, status, and project name.',
    inputSchema: z.object({
        type: z.enum(['Risk', 'Issue']).optional().describe('Filter by entry type (Risk or Issue).'),
        status: z.string().optional().describe('Filter by status (e.g., Open, Closed).'),
        projectName: z.string().optional().describe('Filter by a specific project name.'),
      }),
    outputSchema: z.array(z.any()),
  },
  async ({ type, status, projectName }) => {
    console.log(`Tool called with: type=${type}, status=${status}, projectName=${projectName}`);
    
    try {
      let allData = await getRisksAndIssues();

      // Apply filters
      if (type) {
        allData = allData.filter(item => item.type === type);
      }
      if (status) {
        allData = allData.filter(item => item.Status === status);
      }
      if (projectName) {
        allData = allData.filter(item => item.ProjectName?.toLowerCase().includes(projectName.toLowerCase()));
      }
      
      // Enforce a 12-month look-back and a 200-row limit
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const filteredByDate = allData.filter(item => {
        if (!item.DueDate) return true; // Keep items with no due date
        try {
          const itemDate = new Date(item.DueDate);
          return itemDate >= twelveMonthsAgo;
        } catch (e) {
          return false; // Ignore items with invalid date formats
        }
      });
      
      const limitedData = filteredByDate.slice(0, 200);

      if (limitedData.length === 0) {
        // This is not an error, but a valid empty result. 
        // The flow's prompt should handle this case.
        console.warn("NO_DATA_IN_SCOPE: No data found for the given filters.");
        return [];
      }
      
      // Clean up data for the AI to remove redundant or internal fields
      const cleanedData = limitedData.map(item => {
        // Create a copy to avoid mutating the original object
        const itemCopy = { ...item };

        // Remove internal or redundant fields
        delete (itemCopy as any).id;
        delete (itemCopy as any)._id;
        delete (itemCopy as any)['Due Date']; // Keep standardized 'DueDate'
        delete (itemCopy as any)['Risk Status']; // Keep standardized 'Status'
        
        return itemCopy;
      });

      return cleanedData;

    } catch (err: any) {
        if (err.code === 'permission-denied') {
             throw new Error("PERMISSION_DENIED: You do not have permission to access this data.");
        }
        // A more generic error for other database issues
        throw new Error(`BQ_EXECUTION_TIMEOUT: The data query failed to execute in time. Details: ${err.message}`);
    }
  }
);
