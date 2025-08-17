import { AddRiskIssueForm } from "@/components/add-risk-issue-form";
import { products } from "@/lib/data";
import { RiskForm } from "./risk-form";

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
      <RiskForm products={products} />
    </div>
  );
}
