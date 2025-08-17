import type { LucideIcon } from "lucide-react";

export type Product = {
  id: string;
  code: string;
  name: string;
  paNumber: string;
  value: number;
  currentStatus: string;
};

export type Status = "Open" | "In Progress" | "Resolved" | "Closed" | "Mitigated" | "Transferred" | "Escalated";
export type Priority = "Low" | "Medium" | "High" | "Critical";
export type RiskType = "Risk" | "Issue";
export type IssueCategory = "Technical" | "Contractual" | "Resource" | "Schedule";
export type IssueImpact = "Low" | "Medium" | "High";
export type IssueResponse = "Under Review" | "In Progress" | "Closed";


export type RiskIssue = {
  id: string;
  type: RiskType;
  title: string;
  description: string;
  product: Product;
  status: Status;
  priority: Priority;
  
  // Risk-specific fields
  probability?: number;
  impactRating?: number; // 0.05-0.8
  mitigationPlan?: string;
  contingencyPlan?: string;
  impactValue?: number;
  budgetContingency?: number;
  
  // Issue-specific fields
  category?: IssueCategory;
  resolution?: string;
  impact?: IssueImpact;
  response?: IssueResponse;

  // Common fields
  owner?: string;
  dueDate?: string; // Using string for simplicity, can be Date
  createdAt: string;
  createdBy: string;
};


export type Option = {
  value: string;
  label: string;
  icon?: LucideIcon;
};
