
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { RiskIssue } from "@/lib/types"
import { priorities } from "@/lib/data"

const chartConfig = {
  count: {
    label: "Count",
  },
  ...priorities.reduce((acc, p) => {
      acc[p.value] = { label: p.label, color: p.color };
      return acc;
  }, {} as ChartConfig)
} satisfies ChartConfig

type PriorityBreakdownChartProps = {
    data: RiskIssue[];
}

export function PriorityBreakdownChart({ data }: PriorityBreakdownChartProps) {
    const chartData = React.useMemo(() => {
        const counts = data.reduce((acc, item) => {
            const priority = item.Priority || 'Medium';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Ensure all priorities are present in the data for consistent ordering
        const orderedData = priorities.map(p => ({
            priority: p.label,
            count: counts[p.value] || 0,
            fill: p.color,
        }));
        
        return orderedData;
    }, [data]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[250px]">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="priority"
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
        <Bar dataKey="count" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
