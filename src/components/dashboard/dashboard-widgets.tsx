
"use client";

import type { RiskIssue } from "@/lib/types";
import { StatsCards } from "./stats-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDistributionChart } from "./charts/status-distribution-chart";
import { PriorityBreakdownChart } from "./charts/priority-breakdown-chart";
import { RiskDistributionHeatMap } from "./charts/risk-distribution-heat-map";

type DashboardWidgetsProps = {
    data: RiskIssue[];
}

export function DashboardWidgets({ data }: DashboardWidgetsProps) {
    const risks = data.filter((d) => d.type === 'Risk');
    const issues = data.filter((d) => d.type === 'Issue');

    return (
        <div className="space-y-4">
            <StatsCards data={data} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                 <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Risk Distribution Heat Map</CardTitle>
                        <CardDescription>Aggregated view of risks by probability and impact.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RiskDistributionHeatMap data={risks} />
                    </CardContent>
                </Card>
                <Card className="col-span-full sm:col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                         <CardDescription>Distribution across all items.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <StatusDistributionChart data={data} />
                    </CardContent>
                </Card>
                 <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle>Priority Breakdown</CardTitle>
                        <CardDescription>Number of items by priority level.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <PriorityBreakdownChart data={data} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
