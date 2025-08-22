
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
      "Due Date": data["Due Date"] instanceof Timestamp ? data["Due Date"].toDate().toISOString() : data["Due Date"],
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as unknown as RiskIssue;
  });

  const allProducts = await getDocs(collection(db, 'products')).then(snapshot => 
    snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
  );

  const combinedData: RiskIssue[] = [...risks, ...issues].map((item) => {
    const status = item["Risk Status"] || item.Status || 'Open';
    const product = 
        (item.type === 'Risk' && allProducts.find((p) => p.code === item["Project Code"])) ||
        (item.type === 'Issue' && allProducts.find((p) => p.name === item.ProjectName)) ||
        null;
    return {
      ...item,
      Status: status,
      "Risk Status": status,
      product: product,
      ProjectName: item.ProjectName || product?.name,
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
