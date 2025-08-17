import type { Product, RiskIssue, Option } from "@/lib/types";
import { ShieldCheck, AlertTriangle, CircleDashed, CircleX, Timer, CheckCircle2, Shield, TriangleAlert, Thermometer, Waves, GanttChartSquare, FileText, Users, Calendar, BarChart } from "lucide-react";

export const products: Product[] = [
  { id: "prod-001", code: "P-12345", name: "Project Phoenix", paNumber: "PA-2024-01", value: 1500000, currentStatus: "On Track" },
  { id: "prod-002", code: "P-67890", name: "Quantum Leap Initiative", paNumber: "PA-2024-02", value: 3200000, currentStatus: "Delayed" },
  { id: "prod-003", code: "P-13579", name: "DataStream Integration", paNumber: "PA-2024-03", value: 750000, currentStatus: "Completed" },
  { id: "prod-004", code: "P-24680", name: "NextGen UI Framework", paNumber: "PA-2024-04", value: 500000, currentStatus: "On Hold" },
  { id: "prod-005", code: "P-97531", name: "Cloud Migration Phase 2", paNumber: "PA-2024-05", value: 2100000, currentStatus: "On Track" },
];

export const risksAndIssues: RiskIssue[] = [
  {
    id: "ri-001",
    type: "Risk",
    title: "Unexpected dependency deprecation",
    description: "A key third-party library used in the backend is being deprecated in 3 months, requiring a major refactor.",
    product: products[0],
    status: "Open",
    priority: "High",
    probability: 0.75,
    impactRating: 0.8,
    mitigationPlan: "Allocate development resources to migrate to a new library within the next quarter. Perform thorough testing.",
    createdBy: "Alice Johnson",
    createdAt: "2024-07-15T09:00:00Z",
    owner: "Dev Team Lead",
    dueDate: "2024-10-15",
    impactValue: 50000,
    budgetContingency: 20000,
  },
  {
    id: "ri-002",
    type: "Issue",
    title: "Server outage in EU region",
    description: "The primary server for the EU region went offline for 2 hours, affecting all European customers.",
    product: products[1],
    status: "Resolved",
    priority: "Critical",
    category: "Technical",
    resolution: "Root cause analysis performed. Implemented improved failover protocol and monitoring.",
    createdBy: "Bob Williams",
    createdAt: "2024-06-20T14:30:00Z",
    owner: "SRE Team",
    dueDate: "2024-06-20",
    response: "Closed",
    impact: "High",
    impactValue: 120000,
  },
  {
    id: "ri-003",
    type: "Issue",
    title: "Data import performance degradation",
    description: "The nightly data import job is taking significantly longer, delaying data availability for the business day.",
    product: products[2],
    status: "In Progress",
    priority: "Medium",
    category: "Technical",
    resolution: "Optimize database queries and indexing for the import process. Profile the import script for bottlenecks.",
    createdBy: "Charlie Brown",
    createdAt: "2024-07-28T11:00:00Z",
    owner: "DBA Team",
    dueDate: "2024-08-15",
    response: "In Progress",
    impact: "Medium",
  },
  {
    id: "ri-004",
    type: "Risk",
    title: "Potential for scope creep in Q4",
    description: "Stakeholders are requesting additional features not in the original project plan for the Q4 release.",
    product: products[3],
    status: "Open",
    priority: "Medium",
    probability: 0.60,
    impactRating: 0.7,
    mitigationPlan: "Hold a formal scope review meeting with all stakeholders to prioritize requests and manage expectations. Document all change requests formally.",
    createdBy: "Diana Prince",
    createdAt: "2024-08-01T16:00:00Z",
    owner: "Product Manager",
    dueDate: "2024-09-01",
  },
    {
    id: "ri-005",
    type: "Risk",
    title: "Cloud provider cost overrun",
    description: "Monthly cloud infrastructure costs are trending 20% over budget due to unoptimized resource allocation.",
    product: products[4],
    status: "In Progress",
    priority: "High",
    probability: 0.85,
    impactRating: 0.75,
    mitigationPlan: "Conduct a full audit of cloud resources. Implement auto-scaling policies and downsize underutilized instances.",
    createdBy: "Alice Johnson",
    createdAt: "2024-07-22T10:00:00Z",
    owner: "Finance Ops",
    dueDate: "2024-08-30",
    impactValue: 25000,
    budgetContingency: 10000,
  },
];

export const statuses: Option[] = [
  { value: "Open", label: "Open", icon: Shield },
  { value: "In Progress", label: "In Progress", icon: Timer },
  { value: "Resolved", label: "Resolved", icon: ShieldCheck },
  { value: "Closed", label: "Closed", icon: CircleX },
  { value: "Mitigated", label: "Mitigated", icon: CheckCircle2 },
  { value: "Transferred", label: "Transferred", icon: GanttChartSquare },
  { value: "Escalated", label: "Escalated", icon: TriangleAlert },
];

export const priorities: Option[] = [
  { value: "Low", label: "Low", icon: Thermometer },
  { value: "Medium", label: "Medium", icon: Waves },
  { value: "High", label: "High", icon: TriangleAlert },
  { value: "Critical", label: "Critical", icon: AlertTriangle },
];

export const riskTypes: Option[] = [
  { value: "Risk", label: "Risk", icon: Shield },
  { value: "Issue", label: "Issue", icon: AlertTriangle },
];

export const issueCategories: Option[] = [
  { value: "Technical", label: "Technical", icon: BarChart },
  { value: "Contractual", label: "Contractual", icon: FileText },
  { value: "Resource", label: "Resource", icon: Users },
  { value: "Schedule", label: "Schedule", icon: Calendar },
]
