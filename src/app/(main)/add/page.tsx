
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

  // Prioritize risks for more descriptive project names
  riskSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const projectCode = data["Project Code"];
    const projectName = data.ProjectName || data.Title; // Fallback to Title if ProjectName is generic

    if (projectCode && projectName) {
      if (!projectsMap.has(projectCode)) {
        projectsMap.set(projectCode, {
          id: projectCode,
          code: projectCode,
          name: projectName,
          paNumber: '', 
          value: 0, 
          currentStatus: '', 
        });
      }
    }
  });

  issueSnapshot.docs.forEach(doc => {
    const data = doc.data();
    // Issues might have ProjectName as code, so we use it as a key
    const projectCode = data.ProjectName;
    if (projectCode) {
        if (!projectsMap.has(projectCode)) {
            projectsMap.set(projectCode, {
                id: projectCode,
                code: projectCode, // Issues might not have a separate code field
                name: data.Title || projectCode, // Fallback to the code itself if no better name
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
