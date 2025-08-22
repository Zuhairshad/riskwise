
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { RiskIssue } from "@/lib/types";
import dbConnect from "@/lib/db";
import Risk from "@/models/Risk";
import Issue from "@/models/Issue";

async function getDashboardData() {
  await dbConnect();

  const riskData = await Risk.find({}).lean();
  const issueData = await Issue.find({}).lean();

  const risks: RiskIssue[] = riskData.map(doc => ({
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
    type: 'Risk',
    Title: doc.title || doc.description,
    Status: doc.riskStatus,
    "Risk Status": doc.riskStatus,
    DueDate: doc.dueDate?.toISOString(),
    createdAt: doc.createdAt?.toISOString(),
  })) as unknown as RiskIssue[];

  const issues: RiskIssue[] = issueData.map(doc => ({
    ...doc,
    id: doc._id.toString(),
    _id: doc._id.toString(),
    type: 'Issue',
    Title: doc.title,
    "Due Date": doc.dueDate?.toISOString(),
    createdAt: doc.createdAt?.toISOString(),
  })) as unknown as RiskIssue[];

  const combinedData: RiskIssue[] = [...risks, ...issues].map((item) => {
    const status = item["Risk Status"] || item.Status || 'Open';
    return {
      ...item,
      Status: status,
      "Risk Status": status,
      ProjectName: item.ProjectName || item['Project Code'],
    }
  });


  return {
    risksAndIssues: combinedData,
  };
}

export default async function DashboardPage() {
  const { risksAndIssues } = await getDashboardData();
  return <DashboardClient data={risksAndIssues} />;
}
