import type { Product, Option } from "@/lib/types";
import { ShieldCheck, AlertTriangle, CircleDashed, CircleX, Timer, CheckCircle2, Shield, TriangleAlert, Thermometer, Waves, GanttChartSquare, FileText, Users, Calendar, BarChart } from "lucide-react";

export const products: Product[] = [
  { id: "prod-001", code: "P-12345", name: "Project Phoenix", paNumber: "PA-2024-01", value: 1500000, currentStatus: "On Track" },
  { id: "prod-002", code: "P-67890", name: "Quantum Leap Initiative", paNumber: "PA-2024-02", value: 3200000, currentStatus: "Delayed" },
  { id: "prod-003", code: "P-13579", name: "DataStream Integration", paNumber: "PA-2024-03", value: 750000, currentStatus: "Completed" },
  { id: "prod-004", code: "P-24680", name: "NextGen UI Framework", paNumber: "PA-2024-04", value: 500000, currentStatus: "On Hold" },
  { id: "prod-005", code: "P-97531", name: "Cloud Migration Phase 2", paNumber: "PA-2024-05", value: 2100000, currentStatus: "On Track" },
];

export const risksAndIssues: any[] = [];

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
