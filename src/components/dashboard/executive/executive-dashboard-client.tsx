
"use client";

import type { RiskIssue } from "@/lib/types";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopRisksList } from "./top-risks-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskDistributionHeatMap } from "@/components/dashboard/charts/risk-distribution-heat-map";
import { RiskScoreBreakdownChart } from "@/components/dashboard/charts/risk-score-breakdown-chart";
import * as React from "react";

type ExecutiveDashboardClientProps = {
    top10Risks: (RiskIssue & { riskScore: number; ProjectName: string })[];
    allOpenRisks: RiskIssue[];
    allRisks: RiskIssue[];
};

export function ExecutiveDashboardClient({ top10Risks, allOpenRisks, allRisks }: ExecutiveDashboardClientProps) {

    // Calculate total EMV for the stats card
    const totalEMV = allOpenRisks.reduce((acc, risk) => {
        const probability = risk.Probability ?? 0;
        const impactValue = risk["Impact Value ($)"] ?? 0;
        return acc + (probability * impactValue);
    }, 0);

    const highSeverityRisks = allOpenRisks.filter(risk => {
        const score = (risk.Probability ?? 0) * (risk["Imapct Rating (0.05-0.8)"] ?? 0);
        return score >= 0.15; // High or Critical
    }).length;

    // Data for the stats cards specific to the executive view
    const statsData = [
        { title: "Open Risks", value: allOpenRisks.length, description: "All currently open risks", iconName: "Shield" },
        { title: "High Severity Risks", value: highSeverityRisks, description: "Risks with a high or critical score", iconName: "AlertTriangle" },
        { title: "Total EMV Exposure", value: `$${(totalEMV / 1000000).toFixed(2)}M`, description: "Expected Monetary Value of open risks", iconName: "CircleDot" },
        { title: "Mitigation On Time", value: "92%", description: "Placeholder for on-time mitigation rate", iconName: "CheckCircle2" }
    ];

    return (
        <div className="space-y-6">
            <StatsCards data={allOpenRisks} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Distribution Heat Map</CardTitle>
                            <CardDescription>Overall risk concentration across probability and impact.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                             <RiskDistributionHeatMap 
                                data={allRisks} 
                                onCellClick={() => {}} // Read-only for exec dash
                                activeFilter={null}
                            />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Risk Score Breakdown</CardTitle>
                            <CardDescription>Distribution of risks by severity level.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <RiskScoreBreakdownChart 
                                data={allRisks}
                                onBarClick={() => {}} // Read-only for exec dash
                                activeFilter={null}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <TopRisksList risks={top10Risks} />
                </div>
            </div>
        </div>
    );
}
