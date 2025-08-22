
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { DashboardWidgets } from "./dashboard-widgets";
import { DataTable } from "./risk-issue-table/data-table";
import { riskColumns } from "./risk-issue-table/risk-columns";
import { issueColumns } from "./risk-issue-table/issue-columns";
import type { RiskIssue, Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle } from "lucide-react";
import { AIDataAnalyst } from "./ai-data-analyst";

type DashboardClientProps = {
  data: RiskIssue[];
  products: Product[];
};

export type HeatMapFilter = {
  score: number;
  probLabel: string;
  impactLabel: string;
} | null;

export type RiskLevelFilter = 'Low' | 'Medium' | 'High' | null;


type ActiveTab = 'risks' | 'issues';

export function DashboardClient({ data, products: allProducts }: DashboardClientProps) {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('risks');
  const [heatMapFilter, setHeatMapFilter] = React.useState<HeatMapFilter>(null);
  const [riskLevelFilter, setRiskLevelFilter] = React.useState<RiskLevelFilter>(null);

  const risks = React.useMemo(() => data.filter((d) => d.type === 'Risk'), [data]);
  const issues = React.useMemo(() => data.filter((d) => d.type === 'Issue'), [data]);

  const handleHeatMapFilter = (filter: HeatMapFilter) => {
    if (heatMapFilter && filter && heatMapFilter.score === filter.score) {
      setHeatMapFilter(null); // Clear filter if the same cell is clicked again
    } else {
      setHeatMapFilter(filter);
      setRiskLevelFilter(null); // Clear other filter
    }
    setActiveTab('risks'); // Switch to risks tab when a heat map cell is clicked
  }
  
  const handleRiskLevelFilter = (level: RiskLevelFilter) => {
    if (riskLevelFilter === level) {
      setRiskLevelFilter(null); // Clear filter if same bar is clicked
    } else {
      setRiskLevelFilter(level);
      setHeatMapFilter(null); // Clear other filter
    }
     setActiveTab('risks');
  }

  const clearFilter = () => {
    setHeatMapFilter(null);
    setRiskLevelFilter(null);
  }

  const activeFilter = heatMapFilter || riskLevelFilter;

  const filteredRisks = React.useMemo(() => {
    if (!activeFilter) return risks;

    if (heatMapFilter) {
      const { score } = heatMapFilter;
      const tolerance = 0.0001; // Tolerance for floating point comparison
      return risks.filter(risk => {
          const riskScore = (risk.Probability ?? 0) * (risk["Imapct Rating (0.05-0.8)"] ?? 0);
          return Math.abs(riskScore - score) < tolerance;
      });
    }

    if (riskLevelFilter) {
      const riskLevelRanges = {
        'Low': [0.01, 0.04],
        'Medium': [0.05, 0.14],
        'High': [0.18, 0.72]
      };
      const [min, max] = riskLevelRanges[riskLevelFilter];
      return risks.filter(risk => {
        const score = (risk.Probability ?? 0) * (risk["Imapct Rating (0.05-0.8)"] ?? 0);
        return score >= min && score <= max;
      });
    }

    return risks;
  }, [risks, heatMapFilter, riskLevelFilter, activeFilter]);

  const dataForWidgets = activeTab === 'risks' ? filteredRisks : issues;
  
  const getFilterDescription = () => {
    if (heatMapFilter) {
      return (
        <>
            Risk Score: <span className="font-medium text-foreground">{heatMapFilter.score.toFixed(3)}</span>
            <span className="mx-2">|</span>
            Probability: <span className="font-medium text-foreground">{heatMapFilter.probLabel}</span>, 
            Impact: <span className="font-medium text-foreground">{heatMapFilter.impactLabel}</span>
        </>
      )
    }
    if (riskLevelFilter) {
      return (
         <>
            Risk Level: <span className="font-medium text-foreground">{riskLevelFilter}</span>
        </>
      )
    }
    return null;
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
                   {getFilterDescription()}
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilter}>
                <XCircle className="mr-2 h-4 w-4" />
                Clear Filter
            </Button>
          </CardContent>
        </Card>
      )}

      <AIDataAnalyst data={data} products={allProducts} />
      
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
            activeHeatMapFilter={heatMapFilter}
            onRiskLevelFilter={handleRiskLevelFilter}
            activeRiskLevelFilter={riskLevelFilter}
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
