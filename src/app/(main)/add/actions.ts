"use server";

import { z } from "zod";
import dbConnect from "@/lib/db";
import Risk from "@/models/Risk";
import Issue from "@/models/Issue";

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

const issueFormSchema = z.object({
    month: z.string().min(1, "Month is required"),
    category: z.enum(["Technical", "Contractual", "Resource", "Schedule"]),
    portfolio: z.string().optional(),
    title: z.string().min(5, "Title must be at least 5 characters."),
    discussion: z.string().min(10, "Discussion must be at least 10 characters."),
    resolution: z.string().optional(),
    dueDate: z.date().optional(),
    owner: z.string().min(1, "Owner is required."),
    response: z.enum(["Under Review", "In Progress", "Closed"]),
    impact: z.enum(["Low", "Medium", "High"]),
    impactValue: z.coerce.number().optional(),
    priority: z.enum(["Low", "Medium", "High", "Critical"]),
    projectName: z.string().min(1, "Project Name is required."),
    status: z.enum(["Open", "Resolved", "Escalated", "Closed"]),
});


export async function createRisk(values: z.infer<typeof riskFormSchema>) {
    const parsed = riskFormSchema.safeParse(values);
  
    if (!parsed.success) {
      return { success: false, message: "Invalid data provided." };
    }
  
    try {
      await dbConnect();
      await Risk.create(parsed.data);
      return { success: true, message: "Risk created successfully." };
    } catch (error) {
      console.error("Error creating risk:", error);
      return { success: false, message: "Failed to create risk." };
    }
  }

  export async function createIssue(values: z.infer<typeof issueFormSchema>) {
    const parsed = issueFormSchema.safeParse(values);
  
    if (!parsed.success) {
      return { success: false, message: "Invalid data provided." };
    }
  
    try {
        await dbConnect();
        await Issue.create(parsed.data);
        return { success: true, message: "Issue created successfully." };
      } catch (error) {
        console.error("Error creating issue:", error);
        return { success: false, message: "Failed to create issue." };
      }
  }
