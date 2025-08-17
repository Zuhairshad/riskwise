"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { revalidatePath } from "next/cache";

async function findDocument(id: string): Promise<{ collectionName: string; docRef: any } | null> {
    const collections = ['risks', 'issues'];
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      const docExists = snapshot.docs.find(d => d.id === id);
      if (docExists) {
        return { collectionName, docRef: doc(db, collectionName, id) };
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
