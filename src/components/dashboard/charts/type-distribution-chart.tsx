
"use client"

import * as React from "react"
import {
  Pie,
  PieChart,
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

const chartConfig = {
  risks: {
    label: "Risks",
    color: "hsl(var(--chart-1))",
  },
  issues: {
    label: "Issues",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

type TypeDistributionChartProps = {
    data: RiskIssue[];
}

export function TypeDistributionChart({ data }: TypeDistributionChartProps) {
    const chartData = React.useMemo(() => {
        const counts = data.reduce((acc, item) => {
            if (item.type === 'Risk') {
                acc.risks += 1;
            } else {
                acc.issues += 1;
            }
            return acc;
        }, { risks: 0, issues: 0 });

        return [
            { type: 'risks', count: counts.risks, fill: 'var(--color-risks)' },
            { type: 'issues', count: counts.issues, fill: 'var(--color-issues)' },
        ]
    }, [data]);

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[200px]"
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="type"
                    innerRadius={30}
                    strokeWidth={2}
                />
                <ChartLegend
                    content={<ChartLegendContent nameKey="type" />}
                    className="-mt-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
            </PieChart>
        </ChartContainer>
    )
}
