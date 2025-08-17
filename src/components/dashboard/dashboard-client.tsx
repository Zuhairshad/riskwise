"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { StatsCards } from "./stats-cards";
import { DataTable } from "./risk-issue-table/data-table";
import { columns } from "./risk-issue-table/columns";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-headline font-bold">Dashboard</h1>
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

      <StatsCards data={data} />

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
              <DataTable columns={columns} data={data} />
            </TabsContent>
            <TabsContent value="risks" className="mt-4">
              <DataTable columns={columns} data={risks} />
            </TabsContent>
            <TabsContent value="issues" className="mt-4">
              <DataTable columns={columns} data={issues} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
