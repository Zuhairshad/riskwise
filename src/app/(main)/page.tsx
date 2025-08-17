import { products } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import dbConnect from "@/lib/db";
import Risk from "@/models/Risk";
import Issue from "@/models/Issue";
import type { RiskIssue } from "@/lib/types";

// This is a server component, so we can fetch data directly.
async function getDashboardData() {
  await dbConnect();

  const risks = await Risk.find({}).lean();
  const issues = await Issue.find({}).lean();

  const combinedData: RiskIssue[] = [
    ...risks.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: r._id.toString(),
      type: 'Risk' as 'Risk',
      product: products.find((p) => p.code === r.projectCode) || products[0],
      dueDate: r.dueDate?.toISOString(),
      createdAt: r.createdAt?.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
    })),
    ...issues.map((i) => ({
      ...i,
      id: i._id.toString(),
      _id: i._id.toString(),
      type: 'Issue' as 'Issue',
      product: products.find((p) => p.name === i.projectName) || products[0],
      dueDate: i.dueDate?.toISOString(),
      createdAt: i.createdAt?.toISOString(),
      updatedAt: i.updatedAt?.toISOString(),
      // Mapping issue fields to common fields for the table
      priority: i.priority,
      status: i.status,
      owner: i.owner,
      description: i.discussion,
    })),
  ];

  return {
    risksAndIssues: combinedData,
  };
}

export default async function DashboardPage() {
  const { risksAndIssues } = await getDashboardData();
  return <DashboardClient data={risksAndIssues} />;
}
