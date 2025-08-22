
'use client';

import * as React from "react";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { RiskIssue, Product } from "@/lib/types";
import { collection, getDocs, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import withAuth from "@/components/layout/with-auth";

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

function DashboardPage() {
    const [data, setData] = React.useState<{data: RiskIssue[], products: Product[]}>({data: [], products: []});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function getDashboardData() {
            setLoading(true);
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

            setData({ data: combinedData, products });
            setLoading(false);
        }
        getDashboardData();
    }, [])
  
  if (loading) {
      // You can return a skeleton loader here if you want
      return <div>Loading...</div>;
  }
  
  return <DashboardClient data={data.data} products={data.products} />;
}

export default withAuth(DashboardPage);
