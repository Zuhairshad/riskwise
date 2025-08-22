import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2, CircleDot, LucideIcon } from "lucide-react";
import type { RiskIssue } from "@/lib/types";

type StatCardProps = {
    title: string;
    value: number | string;
    icon: LucideIcon;
    description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}


type StatsCardsProps = {
  data: RiskIssue[];
};

export function StatsCards({ data }: StatsCardsProps) {
  const totalItems = data.length;
  
  const openItems = data.filter((item) => {
    const status = item["Risk Status"] || item.Status;
    return status === "Open" || status === "In Progress";
  }).length;

  const highPriorityItems = data.filter((item) => {
    const priority = item.Priority;
    return priority === "High" || priority === "Critical" || priority === "(1) High";
  }).length;
  
  const resolvedItems = data.filter((item) => {
    const status = item["Risk Status"] || item.Status;
    return status === "Resolved" || status === "Closed" || status === "Mitigated";
  }).length;


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Entries" 
        value={totalItems} 
        icon={CircleDot}
        description="All risks and issues"
      />
       <StatCard 
        title="Open Items" 
        value={openItems} 
        icon={Shield}
        description="Currently active"
      />
       <StatCard 
        title="High Priority" 
        value={highPriorityItems} 
        icon={AlertTriangle}
        description="High & Critical items"
      />
      <StatCard 
        title="Resolved" 
        value={resolvedItems} 
        icon={CheckCircle2}
        description="Completed or Mitigated"
      />
    </div>
  );
}
