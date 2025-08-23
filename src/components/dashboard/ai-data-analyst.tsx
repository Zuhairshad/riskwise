
"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, Bot, Loader2, AlertCircle, Table2 } from "lucide-react";
import { analyzeData } from "@/app/(main)/actions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "./risk-issue-table/data-table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface AIDataAnalystProps {
    analysisType: 'risks' | 'issues';
}

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function AIDataAnalyst({ analysisType }: AIDataAnalystProps) {
  const [question, setQuestion] = React.useState("");
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [tableData, setTableData] = React.useState<any[] | null>(null);
  const [chartData, setChartData] = React.useState<any[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnalysis(null);
    setTableData(null);
    setChartData(null);
    setError(null);

    try {
      const type = analysisType === 'risks' ? 'Risk' : 'Issue';
      const result = await analyzeData({ question, type });

      if (result.success) {
        setAnalysis(result.analysis || "Here is the data you requested.");
        setTableData(result.tableData || []);
        setChartData(result.chartData || null);
        if (!result.analysis && (!result.tableData || result.tableData.length === 0)) {
            setError("NO_DATA_IN_SCOPE: The AI could not find any data matching your question. Try asking something broader, like 'Show me all open risks.'");
        }
      } else {
        setError(result.message || "An unknown error occurred.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const placeholderText = `e.g., Which project has the most open ${analysisType}?`;
  const descriptionText = `Ask a question about your current ${analysisType} to get AI-powered insights.`;

  // Dynamically generate columns for the data table from the first data object.
  const columns = React.useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    
    // Create columns from the keys of the first object in tableData
    return Object.keys(tableData[0]).map(key => ({
        accessorKey: key,
        header: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), // Add spaces before uppercase letters
        cell: ({ row }: any) => {
            const value = row.getValue(key);
            if (typeof value === 'boolean') {
                return value ? 'Yes' : 'No';
            }
            if (typeof value === 'number') {
                // Check for potential date-like numbers if needed, but for now format as number
                return value.toLocaleString();
            }
            return <div className="truncate w-40">{String(value)}</div>;
        },
    }));
  }, [tableData]);

  // Determine chart type based on data structure
  const isPieChart = chartData && chartData.length > 0 && chartData.every(item => typeof item.name === 'string' && typeof item.value === 'number');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          <span>AI Data Analyst</span>
        </CardTitle>
        <CardDescription>
          {descriptionText}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder={placeholderText}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !question.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Ask
          </Button>
        </form>
        {isLoading && (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-4" />
                <p>Analyzing data...</p>
            </div>
        )}
        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {analysis && !isLoading && (
            <Alert className="mt-4 border-accent">
                <Bot className="h-4 w-4" />
                <AlertTitle>Analysis</AlertTitle>
                <AlertDescription>
                    <p className="whitespace-pre-wrap">{analysis}</p>
                </AlertDescription>
            </Alert>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {tableData && tableData.length > 0 && !isLoading && (
                <div className={cn("col-span-full", chartData && chartData.length > 0 && "lg:col-span-3")}>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><Table2 className="h-5 w-5" /> Data Table</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <DataTable columns={columns} data={tableData} tableId="all" />
                        </CardContent>
                     </Card>
                </div>
            )}
            {chartData && chartData.length > 0 && !isLoading && (
                <div className="col-span-full lg:col-span-2">
                     <Card>
                        <CardHeader>
                             <CardTitle className="text-lg">Chart</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="min-h-[250px] w-full h-[300px]">
                                <ResponsiveContainer>
                                    {isPieChart ? (
                                        <PieChart>
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Legend />
                                        </PieChart>
                                    ) : (
                                        <BarChart data={chartData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} angle={-45} textAnchor="end" height={60} />
                                            <YAxis allowDecimals={false}/>
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="value" fill={COLORS[0]} radius={4} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                     </Card>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
