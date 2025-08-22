
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { DashboardWidgets } from "./dashboard-widgets";
import { DataTable } from "./risk-issue-table/data-table";
import { columns } from "./risk-issue-table/columns";
import { riskColumns } from "./risk-issue-table/risk-columns";
import { issueColumns } from "./risk-issue-table/issue-columns";
import type { RiskIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, List } from "lucide-react";

type DashboardClientProps = {
  data: RiskIssue[];
};

export type HeatMapFilter = {
  probRange: [number, number];
  impactRange: [number, number];
  probLabel: string;
  impactLabel: string;
} | null;

export function DashboardClient({ data }: DashboardClientProps) {
  const [displayedData, setDisplayedData] = React.useState<RiskIssue[]>(data);
  const [activeFilter, setActiveFilter] = React.useState<HeatMapFilter>(null);

  const risks = React.useMemo(() => data.filter((d) => d.type === 'Risk'), [data]);
  const issues = React.useMemo(() => data.filter((d) => d.type === 'Issue'), [data]);

  const displayedRisks = React.useMemo(() => displayedData.filter((d) => d.type === 'Risk'), [displayedData]);
  const displayedIssues = React.useMemo(() => displayedData.filter((d) => d.type === 'Issue'), [displayedData]);

  const handleHeatMapFilter = (filter: HeatMapFilter) => {
    setActiveFilter(filter);
    if (!filter) {
      setDisplayedData(data);
      return;
    }
    
    const { probRange, impactRange } = filter;
    const filteredRisks = risks.filter(risk => {
        const prob = risk.Probability ?? 0;
        const impact = risk["Imapct Rating (0.05-0.8)"] ?? 0;
        return prob > probRange[0] && prob <= probRange[1] && impact > impactRange[0] && impact <= impactRange[1];
    });

    setDisplayedData([...filteredRisks, ...issues]); // Show all issues plus filtered risks
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
                An overview of all risks and issues.
            </p>
        </div>
        <Button asChild>
          <Link href="/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Entry
          </Link>
        </Button>
      </div>

       {activeFilter && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="font-semibold">Active Filter:</div>
                <div className="text-sm text-muted-foreground">
                    Probability: <span className="font-medium text-foreground">{activeFilter.probLabel}</span>, 
                    Impact: <span className="font-medium text-foreground">{activeFilter.impactLabel}</span>
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleHeatMapFilter(null)}>
                <XCircle className="mr-2 h-4 w-4" />
                Clear Filter
            </Button>
          </CardContent>
        </Card>
      )}

      <DashboardWidgets data={displayedData} allRisks={risks} onHeatMapFilter={handleHeatMapFilter} activeFilter={activeFilter} />

       <Card>
        <CardHeader>
          <CardTitle>Risk & Issue Register</CardTitle>
          <CardDescription>
            Search, filter, and manage all recorded risks and issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
              <TabsTrigger value="all">
                <List className="mr-2 h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="risks">
                <Shield className="mr-2 h-4 w-4" />
                Risks
              </TabsTrigger>
              <TabsTrigger value="issues">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Issues
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <DataTable columns={columns} data={displayedData} tableId="all" />
            </TabsContent>
            <TabsContent value="risks" className="mt-4">
              <DataTable columns={riskColumns} data={displayedRisks} tableId="risks" />
            </TabsContent>
            <TabsContent value="issues" className="mt-4">
              <DataTable columns={issueColumns} data={displayedIssues} tableId="issues" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
