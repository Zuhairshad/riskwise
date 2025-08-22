
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
    
    const tolerance = 0.0001;

    data.forEach((risk) => {
        if (risk.type !== 'Risk') return;
        const prob = risk.Probability ?? 0;
        const impact = risk["Imapct Rating (0.05-0.8)"] ?? 0;
        const riskScore = prob * impact;

        for (let i = 0; i < probabilityLevels.length; i++) {
            for (let j = 0; j < impactLevels.length; j++) {
                const cellScore = probabilityLevels[i].value * impactLevels[j].value;
                if (Math.abs(riskScore - cellScore) < tolerance) {
                    grid[i][j]++;
                    return; // Move to next risk
                }
            }
        }
    });
    return grid;
  }, [data]);

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="grid grid-cols-[auto_1fr] text-xs">
           <div className="relative w-10">
             <span className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 -rotate-90 font-medium text-muted-foreground whitespace-nowrap">Probability</span>
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
          <div className="grid grid-rows-5 gap-1 text-xs text-right font-medium text-muted-foreground w-20">
            {probabilityLevels.map((level) => (
              <div key={level.value} className="flex items-center justify-end pr-2">
                {level.label} ({level.value})
              </div>
            ))}
          </div>
          <div className="grid grid-rows-5 grid-cols-5 gap-1">
            {probabilityLevels.map((prob, probIndex) =>
              impactLevels.map((imp, impIndex) => {
                const count = heatMapData[probIndex][impIndex];
                const score = prob.value * imp.value;
                const isSelected = activeFilter?.score !== null && Math.abs(activeFilter?.score - score) < 0.0001;

                return (
                  <Tooltip key={`${prob.value}-${imp.value}`}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onCellClick({ score: score, probLabel: prob.label, impactLabel: imp.label })}
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
                        Score: {score.toFixed(3)}
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
