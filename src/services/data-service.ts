
'use server';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RiskIssue, Product } from '@/lib/types';
import { isValid, parseISO } from 'date-fns';

// Helper function to safely convert Firestore Timestamps to ISO strings
function toSafeISOString(date: any): string | undefined {
    if (!date) {
        return undefined;
    }
    // If it's a Firestore Timestamp
    if (date && typeof date.toDate === 'function') {
      const jsDate = date.toDate();
      if (isValid(jsDate)) {
        return jsDate.toISOString();
      }
    }
    // If it's already a JS Date
    if (date instanceof Date && isValid(date)) {
      return date.toISOString();
    }
    // If it's a string, try to parse it
    if (typeof date === 'string') {
        const parsedDate = parseISO(date);
        if (isValid(parsedDate)) {
            return parsedDate.toISOString();
        }
    }
    return undefined;
}


export async function getProducts(): Promise<Product[]> {
    const productsCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productsCollection);
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getRisksAndIssues(products?: Product[]): Promise<RiskIssue[]> {
    console.log("Fetching risks and issues...");
    const productList = products || await getProducts();
    
    const risksCollection = collection(db, "risks");
    const issuesCollection = collection(db, "issues");

    try {
        const [riskSnapshot, issueSnapshot] = await Promise.all([
            getDocs(risksCollection),
            getDocs(issuesCollection)
        ]);

        console.log(`Fetched ${riskSnapshot.docs.length} risks and ${issueSnapshot.docs.length} issues.`);

        const risks: RiskIssue[] = riskSnapshot.docs.map(doc => {
            const data = doc.data();
            // Find project using the project code. This is the point of failure.
            const project = productList.find(p => p.code === data['Project Code']);
            return {
              ...data,
              id: doc.id,
              type: 'Risk',
              Title: data.Title || data.Description || 'Untitled Risk',
              Status: data["Risk Status"] || 'Open', // Correctly map Risk Status
              ProjectName: project?.name || data['Project Code'] || 'Unknown', // Assign the found project name
              ProjectCode: data['Project Code'],
              DueDate: toSafeISOString(data.DueDate),
            } as unknown as RiskIssue;
        });

        const issues: RiskIssue[] = issueSnapshot.docs.map(doc => {
            const data = doc.data();
            const product = productList.find(p => p.name === data.ProjectName);
            return {
              ...data,
              id: doc.id,
              type: 'Issue',
              Title: data.Title || 'Untitled Issue',
              Status: data.Status || 'Open',
              ProjectName: data.ProjectName || 'Unknown',
              ProjectCode: product?.code || null,
              DueDate: toSafeISOString(data["Due Date"]),
            } as unknown as RiskIssue;
        });
        
        const combinedData = [...risks, ...issues].sort((a,b) => {
            const dateA = a.DueDate ? new Date(a.DueDate).getTime() : 0;
            const dateB = b.DueDate ? new Date(b.DueDate).getTime() : 0;
            return dateB - dateA;
        });

        console.log(`Returning ${combinedData.length} combined items.`);
        return combinedData;

    } catch (error) {
        console.error("Error fetching risks and issues from Firestore:", error);
        // In case of a permissions error or other issue, return an empty array
        // to prevent the app from crashing. The error will be logged server-side.
        return [];
    }
}
