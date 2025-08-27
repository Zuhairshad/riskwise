
'use server';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RiskIssue, Product } from '@/lib/types';
import { isValid, parseISO } from 'date-fns';

// Helper function to safely convert Firestore Timestamps or strings to ISO strings
function toSafeISOString(dateValue: any): string | undefined {
    if (!dateValue) {
        return undefined;
    }
    // If it's a Firestore Timestamp
    if (dateValue && typeof dateValue.toDate === 'function') {
      const jsDate = dateValue.toDate();
      return isValid(jsDate) ? jsDate.toISOString() : undefined;
    }
    // If it's already a JS Date
    if (dateValue instanceof Date && isValid(dateValue)) {
      return dateValue.toISOString();
    }
    // If it's a string, try to parse it
    if (typeof dateValue === 'string') {
        const parsedDate = parseISO(dateValue);
        if (isValid(parsedDate)) {
            return parsedDate.toISOString();
        }
    }
    // Return undefined for any other invalid type
    return undefined;
}


export async function getProducts(): Promise<Product[]> {
    const productsCollection = collection(db, 'products');
    try {
        const productSnapshot = await getDocs(productsCollection);
        return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching 'products' collection:", error);
        return [];
    }
}

export async function getRisksAndIssues(products?: Product[]): Promise<RiskIssue[]> {
    const productList = products || await getProducts();
    
    const risksCollection = collection(db, "risks");
    const issuesCollection = collection(db, "issues");

    try {
        const [riskSnapshot, issueSnapshot] = await Promise.all([
            getDocs(risksCollection),
            getDocs(issuesCollection)
        ]);

        const risks: RiskIssue[] = riskSnapshot.docs.map(doc => {
            const data = doc.data();
            const project = productList.find(p => p.code === data['Project Code']);
            return {
              ...data,
              id: doc.id,
              type: 'Risk',
              Title: data.Title || data.Description || 'Untitled Risk',
              // Correctly map 'Risk Status' from the DB to the unified 'Status' field
              Status: data["Risk Status"] || 'Open', 
              ProjectName: project?.name || data['Project Code'] || 'Unknown',
              ProjectCode: data['Project Code'],
              DueDate: toSafeISOString(data.DueDate),
              // Ensure the correct field name is used here
              "Impact Rating (0.05-0.8)": data["Impact Rating (0.05-0.8)"] || data["Imapct Rating (0.05-0.8)"] || 0
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
              // Issues already use 'Status', so this is fine
              Status: data.Status || 'Open',
              ProjectName: data.ProjectName || 'Unknown',
              ProjectCode: product?.code || null,
              DueDate: toSafeISOString(data["Due Date"]),
            } as unknown as RiskIssue;
        });
        
        const combinedData = [...risks, ...issues].sort((a,b) => {
            const dateA = a.DueDate ? new Date(a.DueDate).getTime() : 0;
            const dateB = b.DueDate ? new Date(b.DueDate).getTime() : 0;
            return dateB - dateA; // Sort descending, most recent first
        });

        return combinedData;

    } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        // In case of an error (e.g., permissions), return an empty array to prevent app crash
        return [];
    }
}
