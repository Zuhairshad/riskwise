
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RiskIssue, Product } from "@/lib/types";
import { BenchmarkingClient } from "@/components/benchmarking/benchmarking-client";
import { products as mockProducts } from "@/lib/mock-data";


async function getBenchmarkingData() {
  const risksCollection = collection(db, "risks");
  const issuesCollection = collection(db, "issues");
  const productsCollection = collection(db, 'products');

  const [riskSnapshot, issueSnapshot, productSnapshot] = await Promise.all([
    getDocs(risksCollection),
    getDocs(issuesCollection),
    getDocs(productsCollection)
  ]);
  
  const products = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

  const risks: RiskIssue[] = riskSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      type: 'Risk',
      Title: data.Title || data.Description,
      ProjectCode: data['Project Code'],
      Status: data["Risk Status"] || 'Open',
    } as unknown as RiskIssue;
  });

  const issues: RiskIssue[] = issueSnapshot.docs.map(doc => {
    const data = doc.data();
    const product = products.find(p => p.name === data.ProjectName);
    return {
      ...data,
      id: doc.id,
      type: 'Issue',
      Title: data.Title,
      ProjectName: data.ProjectName,
      ProjectCode: product?.code || data.ProjectName,
      Status: data.Status || 'Open',
    } as unknown as RiskIssue;
  });

  const combinedData: RiskIssue[] = [...risks, ...issues];

  // Use mockProducts if Firestore `products` is empty. This ensures the component always has project data to render.
  const finalProducts = products.length > 0 ? products : mockProducts;

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
