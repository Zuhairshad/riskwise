

import type { RiskIssue, Product } from "@/lib/types";
import { getRisksAndIssues, getProducts } from "@/services/data-service";
import { products as mockProducts } from "@/lib/mock-data";
import { ExecutiveDashboardClient } from "@/components/dashboard/executive/executive-dashboard-client";

async function getExecutiveData() {
  
  const products = await getProducts();
  const finalProducts = products.length > 0 ? products : mockProducts;
  
  const allData = await getRisksAndIssues(finalProducts);
  
  const allRisks = allData.filter(item => item.type === 'Risk');
  const allIssues = allData.filter(item => item.type === 'Issue');

  const openRisks = allData.filter(item => {
    return item.type === 'Risk' && item.Status && item.Status !== 'Closed' && item.Status !== 'Converted to Issue';
  });

  const scoredRisks = openRisks
    .map((risk) => {
      const probability = risk.Probability ?? 0;
      const impact = risk["Imapct Rating (0.05-0.8)"] ?? 0;
      const score = probability * impact;
      return {
        ...risk,
        riskScore: score,
      };
    });

  scoredRisks.sort((a, b) => b.riskScore - a.riskScore);

  return {
    top10Risks: scoredRisks.slice(0, 10),
    allOpenRisks: scoredRisks,
    allRisks: allRisks,
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
