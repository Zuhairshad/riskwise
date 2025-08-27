
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
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
    { name: 'Low', range: [0.01, 0.04], color: 'hsl(var(--chart-2))' }, // Green
    { name: 'Medium', range: [0.05, 0.14], color: 'hsl(var(--chart-4))' }, // Yellow
    { name: 'High', range: [0.18, 0.72], color: 'hsl(var(--chart-1))' }, // Red
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
             onClick={(e) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                    onBarClick(e.activePayload[0].payload.name as RiskLevelFilter);
                }
            }}
             margin={{
                top: 5,
                right: 5,
                bottom: 5,
                left: -20,
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
            <YAxis allowDecimals={false} />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="count" radius={4}>
                 {chartData.map((entry) => (
                    <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.fill}
                        className={cn(
                            "cursor-pointer transition-opacity",
                            activeFilter && activeFilter !== entry.name ? "opacity-30" : "opacity-100",
                            activeFilter === entry.name && "stroke-primary stroke-2"
                        )}
                    />
                ))}
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
