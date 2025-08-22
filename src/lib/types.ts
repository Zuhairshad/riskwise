
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
export type Priority = "Low" | "Medium" | "High" | "Critical" | "(1) High";
export type RiskType = "Risk" | "Issue";
export type IssueCategory = "Technical" | "Contractual" | "Resource" | "Schedule" | "(15) Budget";
export type IssueImpact = "Low" | "Medium" | "High";
export type IssueResponse = "Under Review" | "In Progress" | "Closed";


export type RiskIssue = {
  id: string;
  _id: string; // From MongoDB
  type: RiskType;
  Title: string;
  Description?: string; // From Risk
  Discussion?: string; // From Issue
  product: Product;
  Status: Status;
  "Risk Status"?: Status;
  Priority: Priority;
  
  // Risk-specific fields
  "Project Code"?: string;
  Probability?: number;
  "Imapct Rating (0.05-0.8)"?: number;
  MitigationPlan?: string;
  ContingencyPlan?: string;
  "Impact Value ($)"?: number;
  "Budget Contingency"?: number;
  
  // Issue-specific fields
  Category?: string;
  SubCategory?: string;
  Resolution?: string;
  Impact?: IssueImpact;
  Response?: IssueResponse | null;
  ProjectName?: string;


  // Common fields
  Owner?: string;
  DueDate?: string; // Using string for simplicity, can be Date
  "Due Date"?: string;
  createdAt: string;
  createdBy?: string;
};


export type Option = {
  value: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
};

    
