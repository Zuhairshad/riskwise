
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { StatsCards } from "./stats-cards";
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

export function DashboardClient({ data }: DashboardClientProps) {
  const risks = data.filter((d) => d.type === 'Risk');
  const issues = data.filter((d) => d.type === 'Issue');

  const [currentData, setCurrentData] = React.useState(data);

  const onTabChange = (value: string) => {
    if (value === 'risks') {
      setCurrentData(risks);
    } else if (value === 'issues') {
      setCurrentData(issues);
    } else {
      setCurrentData(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
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

      <StatsCards data={currentData} />

       <Card>
        <CardHeader>
          <CardTitle>Risk & Issue Register</CardTitle>
          <CardDescription>
            Search, filter, and manage all recorded risks and issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={onTabChange}>
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
              <DataTable columns={columns} data={data} tableId="all" />
            </TabsContent>
            <TabsContent value="risks" className="mt-4">
              <DataTable columns={riskColumns} data={risks} tableId="risks" />
            </TabsContent>
            <TabsContent value="issues" className="mt-4">
              <DataTable columns={issueColumns} data={issues} tableId="issues" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
