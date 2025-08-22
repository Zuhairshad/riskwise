
"use client";

import * as React from "react";
import type { RiskIssue, Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MultiSelect } from "react-multi-select-component";
import { DataTable } from "../dashboard/risk-issue-table/data-table";
import { riskColumns } from "../dashboard/risk-issue-table/risk-columns";
import { issueColumns } from "../dashboard/risk-issue-table/issue-columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle } from "lucide-react";

interface BenchmarkingClientProps {
  data: RiskIssue[];
  products: Product[];
}

type SelectedOption = {
  label: string;
  value: string;
};

const ComparisonCard = ({ title, value }: { title: string, value: string | number }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export function BenchmarkingClient({ data, products }: BenchmarkingClientProps) {
  const productOptions = React.useMemo(() => 
    products.map(p => ({ label: p.name, value: p.code })), 
    [products]
  );
  
  const [selected, setSelected] = React.useState<SelectedOption[]>([]);

  const filteredData = React.useMemo(() => {
    if (selected.length === 0) return [];
    const selectedProjectCodes = selected.map(s => s.value);
    return data.filter(item => {
        return item.ProjectCode && selectedProjectCodes.includes(item.ProjectCode);
    });
  }, [data, selected]);

  const comparisonData = React.useMemo(() => {
    if (selected.length === 0) return [];
    
    return selected.map(projectOption => {
      const projectData = data.filter(d => d.ProjectCode === projectOption.value);
      const risks = projectData.filter(d => d.type === "Risk");
      const issues = projectData.filter(d => d.type === "Issue");

      const totalRiskScore = risks.reduce((acc, r) => acc + ((r.Probability ?? 0) * (r["Imapct Rating (0.05-0.8)"] ?? 0)), 0);
      const avgRiskScore = risks.length > 0 ? (totalRiskScore / risks.length).toFixed(3) : "N/A";
      const financialImpact = projectData.reduce((acc, item) => acc + (item["Impact Value ($)"] ?? 0), 0);

      return {
        id: projectOption.value,
        name: projectOption.label,
        totalRisks: risks.length,
        openIssues: issues.filter(i => i.Status === "Open").length,
        avgRiskScore,
        financialImpact: financialImpact.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      };
    });
  }, [data, selected]);

  const risks = filteredData.filter(d => d.type === 'Risk');
  const issues = filteredData.filter(d => d.type === 'Issue');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Selection</CardTitle>
          <CardDescription>Choose two or more projects from the list below to start comparing their performance metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={productOptions}
            value={selected}
            onChange={setSelected}
            labelledBy="Select Projects"
            hasSelectAll={false}
            overrideStrings={{
                "selectSomeItems": "Select projects to compare...",
                "search": "Search projects...",
            }}
          />
        </CardContent>
      </Card>

      {selected.length > 0 && (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Side-by-Side Comparison</CardTitle>
                    <CardDescription>Key performance indicators for the selected projects.</CardDescription>
                </CardHeader>
                <CardContent className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(selected.length, 4)}`}>
                    {comparisonData.map(project => (
                        <Card key={project.id} className="flex-1">
                        <CardHeader>
                            <CardTitle className="truncate">{project.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ComparisonCard title="Total Risks" value={project.totalRisks} />
                            <ComparisonCard title="Open Issues" value={project.openIssues} />
                            <ComparisonCard title="Avg. Risk Score" value={project.avgRiskScore} />
                            <ComparisonCard title="Total Financial Impact" value={project.financialImpact} />
                        </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detailed Data</CardTitle>
                    <CardDescription>All risks and issues for the selected projects. Use the toolbar to filter and export data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="risks" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
                            <TabsTrigger value="risks"><Shield className="mr-2 h-4 w-4" />Risks ({risks.length})</TabsTrigger>
                            <TabsTrigger value="issues"><AlertTriangle className="mr-2 h-4 w-4" />Issues ({issues.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="risks" className="mt-4">
                            <DataTable columns={riskColumns} data={risks} tableId="risks" />
                        </TabsContent>
                        <TabsContent value="issues" className="mt-4">
                             <DataTable columns={issueColumns} data={issues} tableId="issues" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
