'use server';

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

// Schemas for form data
const riskFormSchema = z.object({
  Month: z.string().min(1, "Month is required"),
  "Project Code": z.string().min(1, "Project Code is required"),
  "Risk Status": z.enum(["Open", "Closed", "Mitigated", "Transferred"]),
  Description: z.string().min(10, "Description must be at least 10 characters."),
  Probability: z.coerce.number().min(0).max(1),
  "Imapct Rating (0.05-0.8)": z.coerce.number().min(0.05).max(0.8),
  MitigationPlan: z.string().optional(),
  ContingencyPlan: z.string().optional(),
  "Impact Value ($)": z.coerce.number().min(0),
  "Budget Contingency": z.coerce.number().min(0),
  Owner: z.string().optional(),
  DueDate: z.date().optional(),
  Title: z.string().min(5, "Title must be at least 5 characters."),
});

const issueFormSchema = z.object({
    Month: z.string().min(1, "Month is required"),
    Category: z.string().optional(),
    SubCategory: z.string().optional(),
    Portfolio: z.string().optional(),
    Title: z.string().min(5, "Title must be at least 5 characters."),
    Discussion: z.string().min(10, "Discussion must be at least 10 characters."),
    Resolution: z.string().optional(),
    "Due Date": z.date().optional(),
    Owner: z.string().min(1, "Owner is required."),
    Response: z.enum(["Under Review", "In Progress", "Closed"]).nullable(),
    Impact: z.enum(["Low", "Medium", "High"]).nullable(),
    "Impact ($)": z.coerce.number().optional().nullable(),
    Priority: z.enum(["Low", "Medium", "High", "Critical", "(1) High"]),
    ProjectName: z.string().min(1, "Project Name is required."),
    Status: z.enum(["Open", "Resolved", "Escalated", "Closed"]),
});

// Firestore data creation functions
export async function createRisk(values: z.infer<typeof riskFormSchema>) {
    const parsed = riskFormSchema.safeParse(values);
  
    if (!parsed.success) {
      return { success: false, message: "Invalid data provided." };
    }
  
    try {
      await addDoc(collection(db, "risks"), parsed.data);
      revalidatePath('/');
      return { success: true, message: "Risk created successfully." };
    } catch (error) {
      console.error("Error creating risk:", error);
      return { success: false, message: "Failed to create risk." };
    }
}

export async function createIssue(values: z.infer<typeof issueFormSchema>) {
    const parsed = issueFormSchema.safeParse(values);
  
    if (!parsed.success) {
      console.log(parsed.error.errors)
      return { success: false, message: "Invalid data provided." };
    }
  
    try {
        await addDoc(collection(db, "issues"), parsed.data);
        revalidatePath('/');
        return { success: true, message: "Issue created successfully." };
      } catch (error) {
        console.error("Error creating issue:", error);
        return { success: false, message: "Failed to create issue." };
      }
}
