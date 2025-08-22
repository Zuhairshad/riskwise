
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { RiskIssue } from "@/lib/types"

const chartConfig = {
  count: { label: "Count" },
  Open: { label: "Open", color: "hsl(var(--chart-1))" },
  Closed: { label: "Closed", color: "hsl(var(--chart-2))" },
  Mitigated: { label: "Mitigated", color: "hsl(var(--chart-3))" },
  Transferred: { label: "Transferred", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

type RiskStatusChartProps = {
  data: RiskIssue[];
}

export function RiskStatusChart({ data }: RiskStatusChartProps) {
  const chartData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {
      Open: 0,
      Closed: 0,
      Mitigated: 0,
      Transferred: 0,
    };

    data.forEach(item => {
      if (item.type === 'Risk') {
        const status = item['Risk Status'] || 'Open';
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      }
    });

    return Object.keys(statusCounts).map(status => ({
      status,
      count: statusCounts[status],
      fill: chartConfig[status as keyof typeof chartConfig]?.color || 'hsl(var(--muted))'
    }));
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="status"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis allowDecimals={false} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Bar dataKey="count" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
