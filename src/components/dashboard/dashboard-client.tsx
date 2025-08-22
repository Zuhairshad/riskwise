
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { DataTable } from "./risk-issue-table/data-table";
import { riskColumns } from "./risk-issue-table/risk-columns";
import { issueColumns } from "./risk-issue-table/issue-columns";
import type { RiskIssue, Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle } from "lucide-react";
import { AIDataAnalyst } from "./ai-data-analyst";
import { StatsCards } from "./stats-cards";

type DashboardClientProps = {
  data: RiskIssue[];
  products: Product[];
};

export function DashboardClient({ data, products }: DashboardClientProps) {
  const [activeTab, setActiveTab] = React.useState<'risks' | 'issues'>('risks');

  const risks = React.useMemo(() => data.filter((d) => d.type === 'Risk'), [data]);
  const issues = React.useMemo(() => data.filter((d) => d.type === 'Issue'), [data]);

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

      <AIDataAnalyst />

      <StatsCards data={data} />
      
      <Tabs defaultValue="risks" value={activeTab} onValueChange={(value) => setActiveTab(value as 'risks' | 'issues')}>
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
        
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                    Search, filter, and manage all recorded entries for the selected view.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TabsContent value="risks" className="mt-4">
                    <DataTable columns={riskColumns} data={risks} tableId="risks" />
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
