
"use client"

import * as React from "react"
import {
  Pie,
  PieChart,
  Cell,
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
            className="mx-auto aspect-square h-[250px]"
        >
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
                >
                    {chartData.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} />
                    ))}
                </Pie>
                 <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    className="-mt-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
            </PieChart>
        </ChartContainer>
    )
}
