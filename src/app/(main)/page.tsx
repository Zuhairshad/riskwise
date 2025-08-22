
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { RiskIssue } from "@/lib/types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function getDashboardData() {

  const risksCollection = collection(db, "risks");
  const issuesCollection = collection(db, "issues");

  const [riskSnapshot, issueSnapshot] = await Promise.all([
    getDocs(risksCollection),
    getDocs(issuesCollection),
  ]);

  const risks: RiskIssue[] = riskSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    type: 'Risk',
    Title: doc.data().Title || doc.data().Description,
    Status: doc.data()["Risk Status"],
  })) as unknown as RiskIssue[];

  const issues: RiskIssue[] = issueSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    type: 'Issue',
    Title: doc.data().Title,
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
