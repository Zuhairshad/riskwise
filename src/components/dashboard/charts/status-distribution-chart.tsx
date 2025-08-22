
"use client"

import * as React from "react"
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
} from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { RiskIssue, Option } from "@/lib/types"
import { statuses } from "@/lib/data"

type StatusDistributionChartProps = {
    data: RiskIssue[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
    const chartData = React.useMemo(() => {
        const counts = data.reduce((acc, item) => {
            const status = item.Status || 'Open';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([status, count]) => ({
            status,
            count,
            fill: statuses.find(s => s.value === status)?.color || 'hsl(var(--muted))'
        }));
    }, [data]);

    const chartConfig = statuses.reduce((acc, status) => {
        acc[status.value] = {
            label: status.label,
            color: status.color,
            icon: status.icon,
        };
        return acc;
    }, {} as ChartConfig)

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[250px] w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={60}
                        strokeWidth={5}
                        labelLine={false}
                        label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            percent,
                          }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))
                            if (percent < 0.05) return null;
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="white"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                className="text-xs font-medium"
                              >
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            )
                          }}
                    >
                        {chartData.map((entry) => (
                            <Cell key={entry.status} fill={entry.fill} />
                        ))}
                    </Pie>
                    <ChartLegend
                        content={<ChartLegendContent nameKey="status" />}
                        className="-mt-4 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
