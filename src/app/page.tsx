
'use client';

import { useEffect, useState } from "react";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { RiskIssue, Product } from "@/lib/types";
import { getRisksAndIssues, getProducts } from "@/services/data-service";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const [data, setData] = useState<RiskIssue[] | null>(null);
    const [products, setProducts] = useState<Product[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function getDashboardData() {
        try {
          const productList = await getProducts();
          setProducts(productList);
          const combinedData = await getRisksAndIssues(productList);
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
          <div className="space-y-6 p-4 sm:p-6">
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
