
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { DashboardWidgets } from "./dashboard-widgets";
import { DataTable } from "./risk-issue-table/data-table";
import { riskColumns } from "./risk-issue-table/risk-columns";
import { issueColumns } from "./risk-issue-table/issue-columns";
import type { RiskIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle } from "lucide-react";

type DashboardClientProps = {
  data: RiskIssue[];
};

export type HeatMapFilter = {
  probRange: [number, number];
  impactRange: [number, number];
  probLabel: string;
  impactLabel: string;
} | null;

type ActiveTab = 'risks' | 'issues';

export function DashboardClient({ data }: DashboardClientProps) {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('risks');
  const [activeFilter, setActiveFilter] = React.useState<HeatMapFilter>(null);

  const risks = React.useMemo(() => data.filter((d) => d.type === 'Risk'), [data]);
  const issues = React.useMemo(() => data.filter((d) => d.type === 'Issue'), [data]);

  const handleHeatMapFilter = (filter: HeatMapFilter) => {
    if (activeFilter && filter && activeFilter.probRange[0] === filter.probRange[0] && activeFilter.impactRange[0] === filter.impactRange[0]) {
      setActiveFilter(null); // Clear filter if the same cell is clicked again
    } else {
      setActiveFilter(filter);
    }
    setActiveTab('risks'); // Switch to risks tab when a heat map cell is clicked
  }
  
  const clearFilter = () => handleHeatMapFilter(null);

  const filteredRisks = React.useMemo(() => {
    if (!activeFilter) return risks;
    
    const { probRange, impactRange } = activeFilter;
    return risks.filter(risk => {
        const prob = risk.Probability ?? 0;
        const impact = risk["Imapct Rating (0.05-0.8)"] ?? 0;
        
        const isProbMatch = prob >= probRange[0] && prob <= probRange[1];
        const isImpactMatch = impact >= impactRange[0] && impact <= impactRange[1];
       
        return isProbMatch && isImpactMatch;
    });
  }, [risks, activeFilter]);

  const dataForWidgets = activeTab === 'risks' ? filteredRisks : issues;
  
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
            <Button variant="ghost" size="sm" onClick={clearFilter}>
                <XCircle className="mr-2 h-4 w-4" />
                Clear Filter
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="risks" value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)}>
        <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
          <TabsTrigger value="risks">
            <Shield className="mr-2 h-4 w-4" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="issues">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Issues
          </TabsTrigger>
        </TabsList>
        
        <DashboardWidgets 
            data={dataForWidgets} 
            allRisks={risks}
            onHeatMapFilter={handleHeatMapFilter}
            activeFilter={activeFilter}
            activeTab={activeTab}
        />

        <Card>
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                    Search, filter, and manage all recorded entries for the selected view.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TabsContent value="risks" className="mt-4">
                    <DataTable columns={riskColumns} data={filteredRisks} tableId="risks" />
                </TabsContent>
                <TabsContent value="issues" className="mt-4">
                    <DataTable columns={issueColumns} data={issues} tableId="issues" />
                </TabsContent>
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
