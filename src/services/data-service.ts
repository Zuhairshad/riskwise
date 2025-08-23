
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
    const productList = products || await getProducts();
    
    const risksCollection = collection(db, "risks");
    const issuesCollection = collection(db, "issues");

    const [riskSnapshot, issueSnapshot] = await Promise.all([
        getDocs(risksCollection),
        getDocs(issuesCollection)
    ]);

    const risks: RiskIssue[] = riskSnapshot.docs.map(doc => {
        const data = doc.data();
        const product = productList.find(p => p.code === data['Project Code']);
        return {
          ...data,
          id: doc.id,
          type: 'Risk',
          Title: data.Title || data.Description || 'Untitled Risk',
          Status: data["Risk Status"] || 'Open',
          ProjectName: product?.name || data['Project Code'] || 'Unknown',
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
          ProjectName: data.ProjectName || 'Unknown',
          ProjectCode: product?.code || null,
          Status: data.Status || 'Open',
          DueDate: toSafeISOString(data["Due Date"]),
        } as unknown as RiskIssue;
    });

    return [...risks, ...issues];
}
