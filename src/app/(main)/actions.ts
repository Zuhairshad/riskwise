
"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { analyzeData as analyzeDataFlow, type AnalyzeDataInput } from "@/ai/flows/analyze-data-flow";
import { setProjectData } from "@/ai/tools/project-data-tool";
import type { RiskIssue, Product } from "@/lib/types";

async function findDocument(id: string): Promise<{ collectionName: string; docRef: any, data: any } | null> {
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
            newData['Project Code'] = data.ProjectName ? (await getDocs(collection(db, 'products'))).docs.find(p => p.data().name === data.ProjectName)?.data().code || '' : '';

            // remove issue specific fields
            delete newData.Discussion;
            delete newData.Resolution;
            delete newData.Response;
            delete newData.Impact;
            delete newData['Impact ($)'];
            delete newData.Priority;
            delete newData.ProjectName;
            delete newData.Status;
            delete newData['Category New'];
            delete newData['Due Date'];

        } else {
            // From Risk to Issue
            newData.Discussion = data.Description || '';
            newData.Status = 'Open';
            newData.Priority = 'Medium';
            newData.Impact = 'Medium';
            newData.ProjectName = data['Project Code'] ? (await getDocs(collection(db, 'products'))).docs.find(p => p.data().code === data['Project Code'])?.data().name || '' : '';
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
        return { success: true, message: `Successfully changed type to ${newType}.` };

    } catch(error) {
        console.error("Error changing document type:", error);
        return { success: false, message: "Failed to change type." };
    }
}


export async function analyzeData(input: { question: string, data: RiskIssue[] }) {
    try {
      // Set the data for the tool to use in this request context.
      // In a real multi-user app, you would scope this data to the current user.
      setProjectData(input.data);
      
      const result = await analyzeDataFlow({ question: input.question, projects: [], risksAndIssues: [] });
      return { success: true, analysis: result.analysis };
    } catch (error) {
      console.error("Error analyzing data:", error);
      return { success: false, message: "Failed to get analysis from AI." };
    }
  }
