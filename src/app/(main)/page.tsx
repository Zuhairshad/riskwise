import { risksAndIssues } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

// This is a server component, so we can fetch data directly.
// In a real application, this would be a database call.
async function getDashboardData() {
  return {
    risksAndIssues,
  };
}

export default async function DashboardPage() {
  const { risksAndIssues } = await getDashboardData();
  return <DashboardClient data={risksAndIssues} />;
}
