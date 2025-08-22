
import type { RiskIssue, Product } from "@/lib/types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { products as mockProducts } from "@/lib/mock-data";
import { ExecutiveDashboardClient } from "@/components/dashboard/executive/executive-dashboard-client";

// Helper function to safely convert Firestore Timestamps to ISO strings
function toISOString(date: any): string | undefined {
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    if (typeof date === 'string' || typeof date === 'undefined') {
        return date;
    }
    return undefined;
}


async function getExecutiveData() {
  const risksCollection = collection(db, 'risks');
  const productsCollection = collection(db, 'products');
  const issuesCollection = collection(db, 'issues');


  const [riskSnapshot, productSnapshot, issueSnapshot] = await Promise.all([
      getDocs(risksCollection),
      getDocs(productsCollection),
      getDocs(issuesCollection)
  ]);

  const products = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  const finalProducts = products.length > 0 ? products : mockProducts;

  const allRisks: RiskIssue[] = riskSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      type: "Risk",
      DueDate: toISOString(data.DueDate),
    } as unknown as RiskIssue;
  });
  
  const allIssues: RiskIssue[] = issueSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
        type: "Issue",
        "Due Date": toISOString(data["Due Date"]),
    } as unknown as RiskIssue;
  });

  const allData = [...allRisks, ...allIssues];

  const openRisks = allData.filter(item => {
    const status = item['Risk Status'] || item.Status;
    return item.type === 'Risk' && status && status !== 'Closed' && status !== 'Converted to Issue';
  });

  const scoredRisks = openRisks
    .map((risk) => {
      const probability = risk.Probability ?? 0;
      const impact = risk["Imapct Rating (0.05-0.8)"] ?? 0;
      const score = probability * impact;
      const project = finalProducts.find((p) => p.code === risk["Project Code"]);

      return {
        ...risk,
        riskScore: score,
        ProjectName: project?.name || risk["Project Code"] || "Unknown Project",
      };
    });

  scoredRisks.sort((a, b) => b.riskScore - a.riskScore);

  return {
    top10Risks: scoredRisks.slice(0, 10),
    allOpenRisks: scoredRisks,
    allRisks: allRisks, // Pass all risks for charts
    allData: allData,
  };
}

export default async function ExecutiveDashboardPage() {
  const { top10Risks, allOpenRisks, allRisks, allData } = await getExecutiveData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Executive Dashboard
        </h1>
        <p className="text-muted-foreground">
          A high-level overview of the most critical risks.
        </p>
      </div>
      <ExecutiveDashboardClient 
        top10Risks={top10Risks} 
        allOpenRisks={allOpenRisks}
        allRisks={allRisks}
        allData={allData}
      />
    </div>
  );
}
