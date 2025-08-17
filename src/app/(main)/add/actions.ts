"use server";

import { z } from "zod";

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
