import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2, CircleDot } from "lucide-react";
import type { RiskIssue } from "@/lib/types";

type StatsCardsProps = {
  data: RiskIssue[];
};

export function StatsCards({ data }: StatsCardsProps) {
  const totalItems = data.length;
  const openItems = data.filter((item) => item.status === "Open" || item.status === "In Progress").length;
  const highPriorityItems = data.filter((item) => item.priority === "High" || item.priority === "Critical").length;
  const resolvedItems = data.filter((item) => item.status === "Resolved" || item.status === "Closed").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          <CircleDot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">All risks and issues</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Items</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openItems}</div>
          <p className="text-xs text-muted-foreground">Currently active risks and issues</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{highPriorityItems}</div>
          <p className="text-xs text-muted-foreground">High & Critical priority items</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved Items</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resolvedItems}</div>
          <p className="text-xs text-muted-foreground">Items that have been addressed</p>
        </CardContent>
      </Card>
    </div>
  );
}
