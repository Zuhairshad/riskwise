
"use client";

import type { RiskIssue } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface TopRisksListProps {
  risks: (RiskIssue & { riskScore: number; ProjectName: string })[];
}

const getRiskLevel = (score: number) => {
    if (score >= 0.3) return { label: "Critical", color: "bg-red-500" };
    if (score >= 0.15) return { label: "High", color: "bg-orange-500" };
    if (score >= 0.05) return { label: "Medium", color: "bg-yellow-400" };
    return { label: "Low", color: "bg-green-500" };
};


export function TopRisksList({ risks }: TopRisksListProps) {
  if (risks.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top 10 Open Risks</CardTitle>
                 <CardDescription>No open risks found.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <TrendingUp className="w-16 h-16 mb-4" />
                    <p>Great job! There are no open risks to display.</p>
                </div>
            </CardContent>
        </Card>
    )
  }
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Open Risks</CardTitle>
        <CardDescription>
          The most critical open risks based on their calculated score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {risks.map((risk, index) => {
             const level = getRiskLevel(risk.riskScore);
            return (
            <div
              key={risk.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                <div className={`w-3 h-10 rounded-full ${level.color}`} />
              </div>
              
              <div>
                <p className="font-semibold">{risk.Title}</p>
                <p className="text-sm text-muted-foreground">
                  {risk.ProjectName}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 text-right">
                 <Badge variant="secondary" className="w-24 justify-center">
                    Score: {risk.riskScore.toFixed(3)}
                </Badge>
                <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>P: {(risk.Probability! * 100).toFixed(0)}%</span>
                    <span>I: {risk["Imapct Rating (0.05-0.8)"]!.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )})}
        </div>
      </CardContent>
    </Card>
  );
}
