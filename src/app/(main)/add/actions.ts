"use server";

import { z } from "zod";

const riskFormSchema = z.object({
  month: z.string().min(1, "Month is required"),
  projectCode: z.string().min(1, "Project Code is required"),
  riskStatus: z.enum(["Open", "Closed", "Mitigated", "Transferred"]),
  description: z.string().min(10, "Description must be at least 10 characters."),
  probability: z.coerce.number().min(0).max(1),
  impactRating: z.coerce.number().min(0.05).max(0.8),
  mitigationPlan: z.string().optional(),
  contingencyPlan: z.string().optional(),
  impactValue: z.coerce.number().min(0),
  budgetContingency: z.coerce.number().min(0),
  owner: z.string().optional(),
  dueDate: z.date().optional(),
});

// a more generic schema for the page
const formSchema = z.object({
  title: z.string(),
  productId: z.string(),
  type: z.enum(["Risk", "Issue"]),
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  probability: z.number(),
  impact: z.number(),
  description: z.string(),
  mitigationStrategy: z.string().optional(),
});


export async function createRiskIssue(values: z.infer<typeof formSchema>) {
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, message: "Invalid data provided." };
  }

  // In a real application, you would save this data to a database.
  console.log("New Risk/Issue Created:", parsed.data);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true, message: "Entry created successfully." };
}

export async function createRisk(values: z.infer<typeof riskFormSchema>) {
    const parsed = riskFormSchema.safeParse(values);
  
    if (!parsed.success) {
      console.error(parsed.error.errors);
      return { success: false, message: "Invalid data provided." };
    }
  
    // In a real application, you would save this data to a database.
    console.log("New Risk Created:", parsed.data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    return { success: true, message: "Risk created successfully." };
  }