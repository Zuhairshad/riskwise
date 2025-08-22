
"use client";

import type { RiskIssue } from "@/lib/types";
import { StatsCards } from "./stats-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDistributionChart } from "./charts/status-distribution-chart";
import { RiskScoreBreakdownChart } from "./charts/risk-score-breakdown-chart";
import { RiskDistributionHeatMap } from "./charts/risk-distribution-heat-map";
import type { HeatMapFilter, RiskLevelFilter } from "./dashboard-client";

type DashboardWidgetsProps = {
    data: RiskIssue[];
    allRisks: RiskIssue[];
    onHeatMapFilter: (filter: HeatMapFilter) => void;
    activeHeatMapFilter: HeatMapFilter;
    onRiskLevelFilter: (filter: RiskLevelFilter) => void;
    activeRiskLevelFilter: RiskLevelFilter;
    activeTab: 'risks' | 'issues';
}

export function DashboardWidgets({ 
    data, 
    allRisks, 
    onHeatMapFilter, 
    activeHeatMapFilter,
    onRiskLevelFilter,
    activeRiskLevelFilter,
    activeTab 
}: DashboardWidgetsProps) {

    const riskWidgets = (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 col-span-full">
            <Card className="col-span-full lg:col-span-4">
                <CardHeader>
                    <CardTitle>Risk Distribution Heat Map</CardTitle>
                    <CardDescription>Click a cell to filter the risks table by score.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <RiskDistributionHeatMap 
                        data={allRisks} 
                        onCellClick={onHeatMapFilter}
                        activeFilter={activeHeatMapFilter}
                    />
                </CardContent>
            </Card>
            <div className="col-span-full lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Risk Score Breakdown</CardTitle>
                        <CardDescription>Click a bar to filter by risk level.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RiskScoreBreakdownChart 
                            data={allRisks}
                            onBarClick={onRiskLevelFilter}
                            activeFilter={activeRiskLevelFilter}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const issueWidgets = (
        <Card className="col-span-full lg:col-span-4">
            <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>A breakdown of all issues by their current status.</CardDescription>
            </CardHeader>
            <CardContent>
               <StatusDistributionChart data={data} />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 my-6">
            <StatsCards data={data} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {activeTab === 'risks' && riskWidgets}
                {activeTab === 'issues' && issueWidgets}
            </div>
        </div>
    )
}
