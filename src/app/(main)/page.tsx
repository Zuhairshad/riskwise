
import { products } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { RiskIssue } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";

// This is a server component, so we can use mock data directly.
async function getDashboardData() {
  const risksCollection = collection(db, 'risks');
  const issuesCollection = collection(db, 'issues');

  const riskSnapshot = await getDocs(risksCollection);
  const issueSnapshot = await getDocs(issuesCollection);

  const risks: RiskIssue[] = riskSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      _id: doc.id,
      type: 'Risk',
      Title: data.Title || data.Description,
      DueDate: data.DueDate instanceof Timestamp ? data.DueDate.toDate().toISOString() : data.DueDate,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as unknown as RiskIssue;
  });

  const issues: RiskIssue[] = issueSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      _id: doc.id,
      type: 'Issue',
      Title: data.Title,
      DueDate: data["Due Date"] instanceof Timestamp ? data["Due Date"].toDate().toISOString() : data["Due Date"],
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as unknown as RiskIssue;
  });

  const combinedData: RiskIssue[] = [...risks, ...issues].map((item) => ({
    ...item,
    Status: (item.Status || item["Risk Status"]) || 'Open', // Default to Open if status is missing
    "Risk Status": (item["Risk Status"] || item.Status) || 'Open', // Also default Risk Status
    product: 
      (item.type === 'Risk' && products.find((p) => p.code === item["Project Code"])) ||
      (item.type === 'Issue' && products.find((p) => p.name === item.ProjectName)) ||
      products[0],
    ProjectName: item.ProjectName || (products.find((p) => p.code === item["Project Code"])?.name)
  }));


  return {
    risksAndIssues: combinedData,
  };
}

export default async function DashboardPage() {
  const { risksAndIssues } = await getDashboardData();
  return <DashboardClient data={risksAndIssues} />;
}
