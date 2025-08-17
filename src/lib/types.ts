import type { LucideIcon } from "lucide-react";

export type Product = {
  id: string;
  code: string;
  name: string;
  paNumber: string;
  value: number;
  currentStatus: string;
};

export type Status = "Open" | "In Progress" | "Resolved" | "Closed";
export type Priority = "Low" | "Medium" | "High" | "Critical";
export type RiskType = "Risk" | "Issue";

export type RiskIssue = {
  id: string;
  title: string;
  description: string;
  product: Product;
  type: RiskType;
  status: Status;
  priority: Priority;
  probability: number;
  impact: number;
  mitigationStrategy?: string;
  createdBy: string;
  createdAt: string;
};

export type Option = {
  value: string;
  label: string;
  icon?: LucideIcon;
};
