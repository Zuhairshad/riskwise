import { products } from "@/lib/data";
import { RiskForm } from "./risk-form";
import { IssueForm } from "./issue-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle } from "lucide-react";

// This is a server component, so we can fetch data directly.
// In a real application, this would be a database call.
async function getPageData() {
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
