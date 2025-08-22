
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { RiskIssue } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { HeatMapFilter } from "../dashboard-client";

const probabilityLevels = [
    { label: "Very High", value: 0.9, range: [0.8, 1.0] },
    { label: "High", value: 0.7, range: [0.6, 0.8] },
    { label: "Medium", value: 0.5, range: [0.4, 0.6] },
    { label: "Low", value: 0.3, range: [0.2, 0.4] },
    { label: "Very Low", value: 0.1, range: [0, 0.2] },
];
  
const impactLevels = [
    { label: "Very Low", value: 0.05, range: [0, 0.05] },
    { label: "Low", value: 0.1, range: [0.05, 0.1] },
    { label: "Medium", value: 0.2, range: [0.1, 0.2] },
    { label: "High", value: 0.4, range: [0.2, 0.4] },
    { label: "Very High", value: 0.8, range: [0.4, 1.0] },
];

const getRiskColor = (score: number, count: number): string => {
    if (count === 0) return "bg-muted/30";
    if (score >= 0.18) return `bg-red-500`;
    if (score >= 0.06) return `bg-yellow-400`;
    return `bg-green-500`;
  };
  
const getTextColor = (score: number, count: number): string => {
    if (count === 0) return "text-muted-foreground";
    if (score >= 0.18) return "text-white";
    return "text-gray-800";
}

interface RiskDistributionHeatMapProps {
  data: RiskIssue[];
  onCellClick: (filter: HeatMapFilter) => void;
  activeFilter: HeatMapFilter;
}


export function RiskDistributionHeatMap({ data, onCellClick, activeFilter }: RiskDistributionHeatMapProps) {
  const heatMapData = React.useMemo(() => {
    const grid: number[][] = Array(5)
      .fill(0)
      .map(() => Array(5).fill(0));

    data.forEach((risk) => {
        if (risk.type !== 'Risk') return;
        const prob = risk.Probability ?? 0;
        const impact = risk["Imapct Rating (0.05-0.8)"] ?? 0;

        const probIndex = probabilityLevels.findIndex(p => prob >= p.range[0] && prob < p.range[1]);
        const impactIndex = impactLevels.findIndex(i => impact >= i.range[0] && impact < i.range[1]);
        
        if (probIndex !== -1 && impactIndex !== -1) {
            grid[probIndex][impactIndex]++;
        } else {
            // Handle edge case for max value
            const maxProbIndex = probabilityLevels.findIndex(p => prob === p.range[1])
            const maxImpactIndex = impactLevels.findIndex(i => impact === i.range[1])
            if (maxProbIndex !== -1 && maxImpactIndex !== -1) {
                grid[maxProbIndex][maxImpactIndex]++;
            }
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
                {level.label} ({level.value})
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-x-2">
          <div className="grid grid-rows-5 gap-1 text-xs text-right font-medium text-muted-foreground">
            {probabilityLevels.map((level) => (
              <div key={level.value} className="flex items-center justify-end">
                {level.label} ({level.value})
              </div>
            ))}
          </div>
          <div className="grid grid-rows-5 grid-cols-5 gap-1">
            {probabilityLevels.map((prob, probIndex) =>
              impactLevels.map((imp, impIndex) => {
                const count = heatMapData[probIndex][impIndex];
                const score = prob.value * imp.value;
                const isSelected = activeFilter?.probRange[0] === prob.range[0] && activeFilter?.impactRange[0] === imp.range[0];

                return (
                  <Tooltip key={`${prob.value}-${imp.value}`}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onCellClick({ probRange: prob.range, impactRange: imp.range, probLabel: prob.label, impactLabel: imp.label })}
                        disabled={count === 0}
                        className={cn(
                          "h-10 w-full rounded-md flex items-center justify-center font-bold text-lg transition-all",
                          getRiskColor(score, count),
                          getTextColor(score, count),
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                          !isSelected && "hover:opacity-80"
                        )}
                      >
                        {count > 0 ? count : ''}
                      </button>
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
          Impact / Severity
        </div>
      </div>
    </TooltipProvider>
  );
}
