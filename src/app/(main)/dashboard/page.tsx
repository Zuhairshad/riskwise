
import type { RiskIssue, Product } from "@/lib/types";
import { getRisksAndIssues, getProducts } from "@/services/data-service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { products as mockProducts } from "@/lib/mock-data";


async function getDashboardData() {
  const products = await getProducts();
  // If there are no products in the database, use mock data as a fallback.
  const finalProducts = products.length > 0 ? products : mockProducts;
  const combinedData = await getRisksAndIssues(finalProducts);

  return {
    data: combinedData,
    products: finalProducts,
  };
}

export default async function DashboardPage() {
  const { data, products } = await getDashboardData();
  
  return <DashboardClient data={data} products={products} />;
}
