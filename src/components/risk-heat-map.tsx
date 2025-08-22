
"use client";

import { cn } from "@/lib/utils";

interface RiskHeatMapProps {
  probability: number;
  impact: number;
}

const probabilityLevels = [
  { label: "Very High", value: 0.9 },
  { label: "High", value: 0.7 },
  { label: "Medium", value: 0.5 },
  { label: "Low", value: 0.3 },
  { label: "Very Low", value: 0.1 },
];

const impactLevels = [
  { label: "Very Low", value: 0.05 },
  { label: "Low", value: 0.1 },
  { label: "Medium", value: 0.2 },
  { label: "High", value: 0.4 },
  { label: "Very High", value: 0.8 },
];

const getRiskColor = (score: number): string => {
    if (score >= 0.15) return "bg-red-500/80"; // High/Critical
    if (score >= 0.03) return "bg-yellow-400/80"; // Medium
    return "bg-green-500/80"; // Low
  };

export function RiskHeatMap({ probability, impact }: RiskHeatMapProps) {
  return (
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
          {probabilityLevels.map((prob) =>
            impactLevels.map((imp) => {
              const score = prob.value * imp.value;
              const isSelected =
                prob.value === probability && imp.value === impact;
              return (
                <div
                  key={`${prob.value}-${imp.value}`}
                  title={`Risk Score: ${score.toFixed(3)}`}
                  className={cn(
                    "h-8 w-full rounded-md transition-all duration-200",
                    getRiskColor(score),
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                />
              );
            })
          )}
        </div>
      </div>
      <div className="text-center font-medium text-muted-foreground text-xs pt-1">
        Impact / Severity
      </div>
    </div>
  );
}
