
"use client"

import * as React from "react"
import {
  Pie,
  PieChart,
  ResponsiveContainer,
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
import type { RiskIssue } from "@/lib/types"
import { riskTypes } from "@/lib/data"
import { Shield, AlertTriangle } from "lucide-react"

const chartConfig = {
  Risk: {
    label: "Risks",
    color: "hsl(var(--chart-1))",
    icon: Shield,
  },
  Issue: {
    label: "Issues",
    color: "hsl(var(--chart-2))",
    icon: AlertTriangle,
  },
} satisfies ChartConfig

type TypeDistributionChartProps = {
    data: RiskIssue[];
}

export function TypeDistributionChart({ data }: TypeDistributionChartProps) {
    const chartData = React.useMemo(() => {
        const counts = data.reduce((acc, item) => {
            const type = item.type || 'Risk';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([type, count]) => ({
            type,
            count,
            fill: chartConfig[type as keyof typeof chartConfig]?.color || 'hsl(var(--muted))'
        }));
    }, [data]);

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
                    nameKey="type"
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
                    <Cell key={entry.type} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="type" />}
                    className="-mt-4 flex-wrap gap-2 [&>*]:basis-1/2 [&>*]:justify-center"
                />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
    )
}
