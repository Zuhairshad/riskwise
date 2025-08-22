
'use client';

import { useEffect, useState } from "react";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { RiskIssue, Product } from "@/lib/types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to safely convert Firestore Timestamps to ISO strings
function toISOString(date: any): string | undefined {
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    // Return as is if it's already a string or undefined
    if (typeof date === 'string' || typeof date === 'undefined') {
        return date;
    }
    return undefined;
}


export default function DashboardPage() {
    const [data, setData] = useState<RiskIssue[] | null>(null);
    const [products, setProducts] = useState<Product[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function getDashboardData() {
        try {
          const risksCollection = collection(db, "risks");
          const issuesCollection = collection(db, "issues");
          const productsCollection = collection(db, "products");
      
          const [riskSnapshot, issueSnapshot, productSnapshot] = await Promise.all([
              getDocs(risksCollection),
              getDocs(issuesCollection),
              getDocs(productsCollection),
          ]);
      
          const productList: Product[] = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setProducts(productList);
      
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
              const product = productList.find(p => p.code === item['Project Code'] || p.name === item.ProjectName);
              return {
              ...item,
              Status: status,
              "Risk Status": status,
              ProjectName: product?.name || item.ProjectName || item['Project Code'],
              }
          });
          
          setData(combinedData);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
      getDashboardData();
    }, []);

    if (loading || !data || !products) {
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-[500px] w-full" />
          </div>
        );
    }
  
  return <DashboardClient data={data} products={products} />;
}
