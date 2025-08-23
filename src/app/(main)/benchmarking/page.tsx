
import type { RiskIssue, Product } from "@/lib/types";
import { getRisksAndIssues, getProducts } from "@/services/data-service";
import { BenchmarkingClient } from "@/components/benchmarking/benchmarking-client";
import { products as mockProducts } from "@/lib/mock-data";


async function getBenchmarkingData() {
  const products = await getProducts();
  const finalProducts = products.length > 0 ? products : mockProducts;
  const combinedData = await getRisksAndIssues(finalProducts);

  return {
    data: combinedData,
    products: finalProducts,
  };
}

export default async function BenchmarkingPage() {
  const { data, products } = await getBenchmarkingData();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Benchmarking</h1>
        <p className="text-muted-foreground">
          Compare key risk and issue metrics across different projects.
        </p>
      </div>
      <BenchmarkingClient data={data} products={products} />
    </div>
  );
}
