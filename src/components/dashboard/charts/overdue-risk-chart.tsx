
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { differenceInDays, parseISO } from "date-fns"

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
  dueInLessThan30: { label: "Due in < 30 Days", color: "hsl(var(--chart-2))" },
  overdue30to60: { label: "Overdue 30-60 Days", color: "hsl(var(--chart-4))" },
  criticalOverdue: { label: "Critical Overdue (>60 days)", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

type OverdueRiskChartProps = {
  data: RiskIssue[];
}

export function OverdueRiskChart({ data }: OverdueRiskChartProps) {
  const chartData = React.useMemo(() => {
    const today = new Date()
    const counts = {
      dueInLessThan30: 0,
      overdue30to60: 0,
      criticalOverdue: 0,
    }

    data.forEach((item) => {
        if (item.type !== 'Risk' || !item.DueDate) return;
        const status = item['Risk Status'] || item.Status;
        if (status !== 'Open' && status !== 'In Progress') return;
        
        const dueDate = parseISO(item.DueDate);
        const daysDiff = differenceInDays(today, dueDate);

        if (daysDiff > 60) {
            counts.criticalOverdue++;
        } else if (daysDiff > 30) {
            counts.overdue30to60++;
        } else if (daysDiff > 0) {
            counts.dueInLessThan30++;
        }
    })

    return [
        { name: "dueInLessThan30", count: counts.dueInLessThan30, fill: chartConfig.dueInLessThan30.color },
        { name: "overdue30to60", count: counts.overdue30to60, fill: chartConfig.overdue30to60.color },
        { name: "criticalOverdue", count: counts.criticalOverdue, fill: chartConfig.criticalOverdue.color },
    ]
  }, [data])

  const totalOverdue = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
           <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-mt-4 flex-wrap gap-2 [&>*]:basis-full [&>*]:justify-center"
            />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
