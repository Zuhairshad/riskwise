
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { RiskIssue } from "@/lib/types";
import { collection, getDocs, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Helper function to safely convert Firestore Timestamps to ISO strings
function toISOString(date: any): string | undefined {
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return date; // Return as is if not a Timestamp or Date
  }

async function getDashboardData() {

  const risksCollection = collection(db, "risks");
  const issuesCollection = collection(db, "issues");

  const [riskSnapshot, issueSnapshot] = await Promise.all([
    getDocs(risksCollection),
    getDocs(issuesCollection),
  ]);

  const risks: RiskIssue[] = riskSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
    id: doc.id,
    ...data,
    type: 'Risk',
    Title: data.Title || data.Description,
    Status: data["Risk Status"],
    DueDate: toISOString(data.DueDate),
  }}) as unknown as RiskIssue[];

  const issues: RiskIssue[] = issueSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
    id: doc.id,
    ...data,
    type: 'Issue',
    Title: data.Title,
    "Due Date": toISOString(data["Due Date"]),
  }}) as unknown as RiskIssue[];


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
