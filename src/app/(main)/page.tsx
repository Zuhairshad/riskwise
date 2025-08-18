
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
    Status: (item["Risk Status"] || item.Status) || 'Open', // Default to Open if status is missing
    product: 
      (item.type === 'Risk' && products.find((p) => p.code === item["Project Code"])) ||
      (item.type === 'Issue' && products.find((p) => p.name === item.ProjectName)) ||
      products[0],
    ProjectName: item.ProjectName || (products.find((p) => p.code === item["Project Code"])?.name)
  }));

  // Apply the default status logic to the 'Risk Status' field as well for consistency in filtering
  combinedData.forEach(item => {
    if (item.type === 'Risk') {
      item['Risk Status'] = item['Risk Status'] || 'Open';
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
