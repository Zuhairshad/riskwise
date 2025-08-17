"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { StatsCards } from "./stats-cards";
import { DataTable } from "./risk-issue-table/data-table";
import { columns } from "./risk-issue-table/columns";
import type { RiskIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type DashboardClientProps = {
  data: RiskIssue[];
};

export function DashboardClient({ data }: DashboardClientProps) {
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
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
