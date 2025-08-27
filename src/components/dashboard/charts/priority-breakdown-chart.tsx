
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { RiskIssue } from "@/lib/types"
import type { RiskLevelFilter } from "../dashboard-client"

const riskLevels = [
    { name: 'Low', range: [0.01, 0.04], color: 'hsl(var(--chart-2))' },
    { name: 'Medium', range: [0.05, 0.14], color: 'hsl(var(--chart-4))' },
    { name: 'High', range: [0.18, 0.72], color: 'hsl(var(--chart-1))' },
] as const;

const chartConfig = {
  count: {
    label: "Count",
  },
  Low: { label: "Low Risk", color: riskLevels.find(r => r.name === 'Low')!.color },
  Medium: { label: "Medium Risk", color: riskLevels.find(r => r.name === 'Medium')!.color },
  High: { label: "High Risk", color: riskLevels.find(r => r.name === 'High')!.color },
} satisfies ChartConfig

type RiskScoreBreakdownChartProps = {
    data: RiskIssue[];
    onBarClick: (level: RiskLevelFilter) => void;
    activeFilter: RiskLevelFilter;
}

export function RiskScoreBreakdownChart({ data, onBarClick, activeFilter }: RiskScoreBreakdownChartProps) {
    const chartData = React.useMemo(() => {
        const counts: Record<'Low' | 'Medium' | 'High', number> = {
            Low: 0,
            Medium: 0,
            High: 0,
        };

        data.forEach(item => {
            if (item.type !== 'Risk') return;
            const score = (item.Probability ?? 0) * (item["Impact Rating (0.05-0.8)"] ?? 0);
            
            for (const level of riskLevels) {
                if (score >= level.range[0] && score <= level.range[1]) {
                    counts[level.name]++;
                    break;
                }
            }
        });
        
        return riskLevels.map(level => ({
            name: level.name,
            count: counts[level.name],
            fill: level.color,
        }));
    }, [data]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
            accessibilityLayer 
            data={chartData}
            margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            }}
        >
            <CartesianGrid vertical={false} />
            <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value}
            />
            <YAxis />
            <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="count" radius={4}>
            {chartData.map((entry) => (
                <Cell
                    key={`cell-${entry.name}`}
                    fill={entry.fill}
                    onClick={() => onBarClick(entry.name as RiskLevelFilter)}
                    className={cn(
                        "cursor-pointer transition-opacity",
                        activeFilter && activeFilter !== entry.name ? "opacity-50" : "opacity-100",
                        activeFilter === entry.name && "stroke-primary stroke-2 ring-2 ring-primary"
                    )}
                />
            ))}
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

const Cell = (props: any) => {
    return <rect {...props} />;
};
