
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { RiskIssue } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskDistributionHeatMapProps {
  data: RiskIssue[];
}

const probabilityLevels = [
  { label: "Very High", value: 0.9, range: [0.8, 1.0] },
  { label: "High", value: 0.7, range: [0.6, 0.8] },
  { label: "Medium", value: 0.5, range: [0.4, 0.6] },
  { label: "Low", value: 0.3, range: [0.2, 0.4] },
  { label: "Very Low", value: 0.1, range: [0, 0.2] },
];

const impactLevels = [
  { label: "Very Low", value: 0.05, range: [0, 0.1] },
  { label: "Low", value: 0.1, range: [0.1, 0.2] },
  { label: "Medium", value: 0.2, range: [0.2, 0.4] },
  { label: "High", value: 0.4, range: [0.4, 0.8] },
  { label: "Very High", value: 0.8, range: [0.8, 1.0] },
];

const getRiskColor = (score: number, count: number): string => {
  if (count === 0) return "bg-muted/30";
  const opacity = Math.min(1, 0.2 + count / 5).toPrecision(2); // Increase opacity based on count

  if (score >= 0.3) return `bg-red-500`; 
  if (score >= 0.15) return `bg-orange-500`;
  if (score >= 0.05) return `bg-yellow-400`;
  return `bg-green-500`;
};

const getTextColor = (score: number, count: number): string => {
    if (count === 0) return "text-muted-foreground";
    if (score >= 0.15) return "text-white";
    return "text-gray-800";
}

export function RiskDistributionHeatMap({ data }: RiskDistributionHeatMapProps) {
  const heatMapData = React.useMemo(() => {
    const grid: number[][] = Array(5)
      .fill(0)
      .map(() => Array(5).fill(0));

    data.forEach((risk) => {
        const prob = risk.Probability ?? 0;
        const impact = risk["Imapct Rating (0.05-0.8)"] ?? 0;

        const probIndex = probabilityLevels.findIndex(p => prob > p.range[0] && prob <= p.range[1]);
        const impactIndex = impactLevels.findIndex(i => impact > i.range[0] && impact <= i.range[1]);
        
        // Find the closest bucket if it's on the boundary
        const finalProbIndex = probIndex === -1 ? probabilityLevels.findIndex(p => prob >= p.range[0] && prob <= p.range[1]) : probIndex;
        const finalImpactIndex = impactIndex === -1 ? impactLevels.findIndex(i => impact >= i.range[0] && impact <= i.range[1]) : impactIndex;


        if (finalProbIndex !== -1 && finalImpactIndex !== -1) {
            grid[finalProbIndex][finalImpactIndex]++;
        }
    });
    return grid;
  }, [data]);

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="grid grid-cols-[auto_1fr] text-xs">
          <div className="flex items-center justify-center rotate-[-60deg] translate-y-4">
            <span className="font-medium text-muted-foreground">Probability</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {impactLevels.map((level) => (
              <div
                key={level.value}
                className="text-center font-medium text-muted-foreground truncate"
              >
                {level.label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-x-2">
          <div className="grid grid-rows-5 gap-1 text-xs text-right font-medium text-muted-foreground">
            {probabilityLevels.map((level) => (
              <div key={level.value} className="flex items-center justify-end">
                {level.label}
              </div>
            ))}
          </div>
          <div className="grid grid-rows-5 grid-cols-5 gap-1">
            {probabilityLevels.map((prob, probIndex) =>
              impactLevels.map((imp, impIndex) => {
                const count = heatMapData[probIndex][impIndex];
                const score = prob.value * imp.value;
                return (
                  <Tooltip key={`${prob.value}-${imp.value}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "h-10 w-full rounded-md flex items-center justify-center font-bold text-lg",
                          getRiskColor(score, count),
                          getTextColor(score, count),
                        )}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{count} risk(s)</p>
                      <p className="text-sm text-muted-foreground">
                        Probability: {prob.label}, Impact: {imp.label}
                      </p>
                       <p className="text-sm text-muted-foreground">
                        Score: ~{score.toFixed(3)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}
          </div>
        </div>
        <div className="text-center font-medium text-muted-foreground text-xs pt-1">
          Impact
        </div>
      </div>
    </TooltipProvider>
  );
}
