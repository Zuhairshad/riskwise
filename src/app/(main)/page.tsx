import { products, risksAndIssues as mockData } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { RiskIssue } from "@/lib/types";

// This is a server component, so we can use mock data directly.
async function getDashboardData() {
  // Map mock data to include product details
  const combinedData: RiskIssue[] = mockData.map((item) => ({
    ...item,
    id: item.id,
    _id: item.id, // Use mock id for _id as well
    product: 
      (item.type === 'Risk' && products.find((p) => p.code === item.projectCode)) ||
      (item.type === 'Issue' && products.find((p) => p.name === item.projectName)) ||
      products[0],
  }));

  return {
    risksAndIssues: combinedData,
  };
}

export default async function DashboardPage() {
  const { risksAndIssues } = await getDashboardData();
  return <DashboardClient data={risksAndIssues} />;
}
