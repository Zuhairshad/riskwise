
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RiskIssue, Product } from "@/lib/types";
import { BenchmarkingClient } from "@/components/benchmarking/benchmarking-client";
import { products as mockProducts } from "@/lib/mock-data";

async function getBenchmarkingData() {
  const risksCollection = collection(db, 'risks');
  const issuesCollection = collection(db, 'issues');
  
  const [riskSnapshot, issueSnapshot] = await Promise.all([
    getDocs(risksCollection),
    getDocs(issuesCollection),
  ]);

  const allProducts: Product[] = mockProducts;

  const risks: RiskIssue[] = riskSnapshot.docs.map(doc => {
    const data = doc.data();
    const product = allProducts.find(p => p.code === data["Project Code"]);
    return {
      ...data,
      id: doc.id,
      _id: doc.id,
      type: 'Risk',
      Title: data.Title || data.Description,
      DueDate: data.DueDate instanceof Timestamp ? data.DueDate.toDate().toISOString() : data.DueDate,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      ProjectName: product?.name || data["Project Code"],
      ProjectCode: data["Project Code"],
      product,
    } as unknown as RiskIssue;
  });

  const issues: RiskIssue[] = issueSnapshot.docs.map(doc => {
    const data = doc.data();
    const product = allProducts.find(p => p.name === data.ProjectName);
    return {
      ...data,
      id: doc.id,
      _id: doc.id,
      type: 'Issue',
      Title: data.Title,
      "Due Date": data["Due Date"] instanceof Timestamp ? data["Due Date"].toDate().toISOString() : data["Due Date"],
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      ProjectName: data.ProjectName,
      ProjectCode: product?.code || null, // Ensure ProjectCode is added here
      product,
    } as unknown as RiskIssue;
  });

  const combinedData: RiskIssue[] = [...risks, ...issues].map((item) => ({
    ...item,
    Status: item["Risk Status"] || item.Status || 'Open',
  }));

  return {
    data: combinedData,
    products: allProducts,
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
