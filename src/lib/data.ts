import type { Option } from "@/lib/types";
import { ShieldCheck, AlertTriangle, CircleDashed, CircleX, Timer, CheckCircle2, Shield, TriangleAlert, Thermometer, Waves, GanttChartSquare, FileText, Users, Calendar, BarChart } from "lucide-react";
import { products as mockProducts } from './mock-data';

export const products = mockProducts;
export const risksAndIssues: any[] = [];

export const statuses: Option[] = [
  { value: "Open", label: "Open", icon: Shield, color: "hsl(var(--chart-2))" },
  { value: "In Progress", label: "In Progress", icon: Timer, color: "hsl(var(--chart-3))" },
  { value: "Resolved", label: "Resolved", icon: ShieldCheck, color: "hsl(var(--chart-1))" },
  { value: "Closed", label: "Closed", icon: CircleX, color: "hsl(var(--muted-foreground))" },
  { value: "Mitigated", label: "Mitigated", icon: CheckCircle2, color: "hsl(var(--chart-4))" },
  { value: "Transferred", label: "Transferred", icon: GanttChartSquare, color: "hsl(var(--chart-5))" },
  { value: "Escalated", label: "Escalated", icon: TriangleAlert, color: "hsl(var(--destructive))" },
];

export const priorities: Option[] = [
  { value: "Low", label: "Low", icon: Thermometer, color: "hsl(var(--chart-1))" },
  { value: "Medium", label: "Medium", icon: Waves, color: "hsl(var(--chart-2))" },
  { value: "High", label: "High", icon: TriangleAlert, color: "hsl(var(--chart-4))" },
  { value: "Critical", label: "Critical", icon: AlertTriangle, color: "hsl(var(--destructive))" },
  { value: "(1) High", label: "High", icon: TriangleAlert, color: "hsl(var(--chart-4))" },
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

// Add mock-data.ts to avoid cluttering this file
export { products as mockProducts } from './mock-data';
