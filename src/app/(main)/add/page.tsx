
import type { Product } from "@/lib/types";
import { RiskForm } from "./risk-form";
import { IssueForm } from "./issue-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// This is a server component, so we can fetch data directly.
async function getPageData() {
  const risksCollection = collection(db, 'risks');
  const issuesCollection = collection(db, 'issues');
  
  const riskSnapshot = await getDocs(risksCollection);
  const issueSnapshot = await getDocs(issuesCollection);

  const projectsMap = new Map<string, Product>();

  riskSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data["Project Code"] && data.ProjectName) {
      if (!projectsMap.has(data["Project Code"])) {
        projectsMap.set(data["Project Code"], {
          id: data["Project Code"],
          code: data["Project Code"],
          name: data.ProjectName,
          paNumber: '', 
          value: 0, 
          currentStatus: '', 
        });
      }
    }
  });

  issueSnapshot.docs.forEach(doc => {
    const data = doc.data();
    // Assuming issues might not have a code, but we need one for consistency.
    // We'll use ProjectName as the key if no code exists.
    if (data.ProjectName) {
        const key = data["Project Code"] || data.ProjectName;
        if (!projectsMap.has(key)) {
            projectsMap.set(key, {
                id: key,
                code: data["Project Code"] || 'N/A',
                name: data.ProjectName,
                paNumber: '',
                value: 0,
                currentStatus: '',
            });
        }
    }
  });

  const products: Product[] = Array.from(projectsMap.values());
  
  return {
    products,
  };
}

export default async function AddPage() {
  const { products } = await getPageData();
  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-2xl font-headline font-bold">Add New Entry</h1>
            <p className="text-muted-foreground">
                Fill out the form below to create a new risk or issue.
            </p>
        </div>
        <Tabs defaultValue="risk" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="risk">
                    <Shield className="mr-2 h-4 w-4" />
                    Add Risk
                </TabsTrigger>
                <TabsTrigger value="issue">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Add Issue
                </TabsTrigger>
            </TabsList>
            <TabsContent value="risk" className="mt-6">
                 <RiskForm products={products} />
            </TabsContent>
            <TabsContent value="issue" className="mt-6">
                <IssueForm products={products} />
            </TabsContent>
        </Tabs>
      
    </div>
  );
}
