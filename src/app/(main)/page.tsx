
'use client';

import * as React from "react";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { RiskIssue, Product } from "@/lib/types";
import { collection, getDocs, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to safely convert Firestore Timestamps to ISO strings
function toISOString(date: any): string | undefined {
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return date; // Return as is if not a Timestamp or Date
}

async function getDashboardData(): Promise<{data: RiskIssue[], products: Product[]}> {
  const risksCollection = collection(db, "risks");
  const issuesCollection = collection(db, "issues");
  const productsCollection = collection(db, "products");

  const [riskSnapshot, issueSnapshot, productSnapshot] = await Promise.all([
    getDocs(risksCollection),
    getDocs(issuesCollection),
    getDocs(productsCollection),
  ]);

  const products: Product[] = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

  const risks: RiskIssue[] = riskSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
    id: doc.id,
    ...data,
    type: 'Risk',
    Title: data.Title || data.Description,
    Status: data["Risk Status"],
    DueDate: toISOString(data.DueDate),
  }}) as unknown as RiskIssue[];

  const issues: RiskIssue[] = issueSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
    id: doc.id,
    ...data,
    type: 'Issue',
    Title: data.Title,
    "Due Date": toISOString(data["Due Date"]),
  }}) as unknown as RiskIssue[];


  const combinedData: RiskIssue[] = [...risks, ...issues].map((item) => {
    const status = item["Risk Status"] || item.Status || 'Open';
    const product = products.find(p => p.code === item['Project Code'] || p.name === item.ProjectName);
    return {
      ...item,
      Status: status,
      "Risk Status": status,
      ProjectName: product?.name || item.ProjectName || item['Project Code'],
    }
  });

  return { data: combinedData, products };
}

export default function DashboardPage() {
  const [data, setData] = React.useState<RiskIssue[] | null>(null);
  const [products, setProducts] = React.useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getDashboardData()
        .then(fetchedData => {
            setData(fetchedData.data);
            setProducts(fetchedData.products);
            setIsLoading(false);
        })
        .catch(error => {
            console.error("Failed to fetch dashboard data:", error);
            setIsLoading(false);
        });
  }, []);

  if (isLoading || !data || !products) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  return <DashboardClient data={data} products={products} />;
}
