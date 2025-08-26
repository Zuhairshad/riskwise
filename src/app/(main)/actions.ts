
'use server';

import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, getDocs, deleteDoc, writeBatch, addDoc, setDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { analyzeData as analyzeDataFlow } from "@/ai/flows/analyze-data-flow";
import type { AnalyzeDataInput } from "@/ai/flows/analyze-data-flow";
import { z } from "zod";

async function findDocument(id: string): Promise<{ collectionName: string; docRef: any; data: any } | null> {
    const collections = ['risks', 'issues'];
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      const docSnapshot = snapshot.docs.find(d => d.id === id);
      if (docSnapshot) {
        return { collectionName, docRef: docSnapshot.ref, data: docSnapshot.data() };
      }
    }
    return null;
  }
  
export async function updateRiskIssueField(id: string, field: string, value: any) {
  try {
    const documentInfo = await findDocument(id);
    if (!documentInfo) {
      return { success: false, message: "Document not found in any collection." };
    }
    
    await updateDoc(documentInfo.docRef, { [field]: value });

    // Revalidate the dashboard path to show the updated data
    revalidatePath('/');
    revalidatePath('/executive-dashboard');
    revalidatePath('/benchmarking');

    return { success: true, message: "Field updated successfully." };
  } catch (error) {
    console.error("Error updating document:", error);
    return { success: false, message: "Failed to update field." };
  }
}

export async function deleteRiskIssue(id: string) {
    try {
        const documentInfo = await findDocument(id);
        if (!documentInfo) {
          return { success: false, message: "Document not found in any collection." };
        }
        
        await deleteDoc(documentInfo.docRef);
    
        // Revalidate the dashboard path to show the updated data
        revalidatePath('/');
        revalidatePath('/executive-dashboard');
        revalidatePath('/benchmarking');
    
        return { success: true, message: "Entry deleted successfully." };
      } catch (error) {
        console.error("Error deleting document:", error);
        return { success: false, message: "Failed to delete entry." };
      }
}

export async function changeRiskIssueType(id: string, newType: 'Risk' | 'Issue') {
    try {
        const documentInfo = await findDocument(id);
        if (!documentInfo) {
          return { success: false, message: "Document not found in any collection." };
        }

        const { collectionName, data, docRef } = documentInfo;
        const targetCollection = newType === 'Risk' ? 'risks' : 'issues';

        if (collectionName === targetCollection) {
            return { success: true, message: "Type is already correct." };
        }

        const batch = writeBatch(db);
        
        // Create new document in target collection
        const newDocRef = doc(collection(db, targetCollection));
        
        // Transform data if needed
        const newData = { ...data };
        if (newType === 'Risk') {
            // From Issue to Risk
            newData.Description = data.Discussion || '';
            newData['Risk Status'] = 'Open';
            newData.Probability = 0.2;
            newData['Imapct Rating (0.05-0.8)'] = 0.05;
            newData.Title = data.Title || `Converted from Issue ${id}`;
            const products = (await getDocs(collection(db, 'products'))).docs.map(p => p.data());
            newData['Project Code'] = data.ProjectName ? products.find(p => p.name === data.ProjectName)?.code || '' : '';

            // remove issue specific fields
            delete newData.Discussion;
            delete newData.Resolution;
            delete newData.Response;
            delete newData.Impact;
            delete newData['Impact ($)'];
            delete newData.Priority;
            delete newData.ProjectName;
            delete newData.Status;
            delete newData.Category;
            delete newData.SubCategory;
            delete newData['Due Date'];

        } else {
            // From Risk to Issue
            newData.Discussion = data.Description || '';
            newData.Status = 'Open';
            newData.Priority = 'Medium';
            newData.Impact = 'Medium';
            const products = (await getDocs(collection(db, 'products'))).docs.map(p => p.data());
            newData.ProjectName = data['Project Code'] ? products.find(p => p.code === data['Project Code'])?.name || '' : '';
            newData.Title = data.Title || `Converted from Risk ${id}`;

            // remove risk specific fields
            delete newData.Description;
            delete newData.Probability;
            delete newData['Imapct Rating (0.05-0.8)'];
            delete newData.MitigationPlan;
            delete newData.ContingencyPlan;
            delete newData['Impact Value ($)'];
            delete newData['Budget Contingency'];
            delete newData['Risk Status'];
            delete newData['Project Code'];
            delete newData.DueDate;
        }


        batch.set(newDocRef, newData);

        // Delete old document
        batch.delete(docRef);

        await batch.commit();

        revalidatePath('/');
        revalidatePath('/executive-dashboard');
        revalidatePath('/benchmarking');
        return { success: true, message: `Successfully changed type to ${newType}.` };

    } catch(error) {
        console.error("Error changing document type:", error);
        return { success: false, message: "Failed to change type." };
    }
}


export async function analyzeData(input: AnalyzeDataInput) {
    try {
      const result = await analyzeDataFlow(input);
      return { success: true, ...result };
    } catch (error: any) {
      console.error("Error analyzing data:", error);
      const errorMessage = error.message || "An unexpected error occurred during analysis.";
      return { success: false, message: `Failed to get analysis from AI: ${errorMessage}` };
    }
}

const BaseSchema = z.object({
    id: z.string().optional(),
    type: z.enum(['Risk', 'Issue']),
    Title: z.string().min(1, "Title is required"),
}).catchall(z.any());

export async function importData(data: any[]) {
    const validatedData = z.array(BaseSchema).safeParse(data);

    if (!validatedData.success) {
        console.error("Data validation failed:", validatedData.error);
        return { success: false, message: "Invalid data structure provided." };
    }
    
    let updatedCount = 0;
    let createdCount = 0;
    const errors: string[] = [];

    const batch = writeBatch(db);

    for (const item of validatedData.data) {
        try {
            const { id, type, ...itemData } = item;
            const collectionName = type === 'Risk' ? 'risks' : 'issues';

            if (id) {
                // Update existing document
                const docRef = doc(db, collectionName, id);
                batch.update(docRef, itemData);
                updatedCount++;
            } else {
                // Create new document
                const newDocRef = doc(collection(db, collectionName));
                batch.set(newDocRef, itemData);
                createdCount++;
            }
        } catch (error: any) {
            errors.push(`Failed to process item: ${item.Title || 'Unknown'}. Error: ${error.message}`);
        }
    }
    
    if (errors.length > 0) {
        return { success: false, message: `Import failed with ${errors.length} errors.`, errors };
    }

    try {
        await batch.commit();
        revalidatePath('/');
        return { 
            success: true, 
            message: `Import successful. ${createdCount} records created, ${updatedCount} records updated.` 
        };
    } catch (error: any) {
        console.error("Error committing batch:", error);
        return { success: false, message: `Failed to commit changes to database: ${error.message}` };
    }
}
