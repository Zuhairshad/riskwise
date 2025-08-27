
import type { LucideIcon } from "lucide-react";
import type { User as FirebaseUser } from 'firebase/auth';

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
  Status: Status;
  "Risk Status"?: Status;
  Priority: Priority;
  
  // Risk-specific fields
  Probability?: number;
  "Impact Rating (0.05-0.8)"?: number;
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
  
  // Standardized fields
  ProjectName: string;
  ProjectCode: string | null;
  Owner?: string;
  DueDate?: string; // Standardized ISO String date
  "Due Date"?: any; // Original field, can be string, date, or timestamp
  createdAt?: string; // Standardized ISO String date
  createdBy?: string;
};


export type Option = {
  value: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
};

export type Badge = {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
};
  
export type UserProfile = {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    title: string;
    badges: Badge[];
    score: number;
};
