
import dbConnect from "@/lib/db";
import Risk from "@/models/Risk";
import Issue from "@/models/Issue";
import type { RiskIssue, Product } from "@/lib/types";
import { BenchmarkingClient } from "@/components/benchmarking/benchmarking-client";

async function getProducts() {
    await dbConnect();

    const risks = await Risk.find({}).distinct('projectCode').lean();
    const issues = await Issue.find({}).distinct('projectName').lean();
    
    // In a real app, you'd likely have a separate 'Projects' collection.
    // For now, we derive projects from risks and issues.
    // We'll assume projectName in issues corresponds to a projectCode in risks,
    // or we'd need a lookup collection.
    
    const projectCodes = [...new Set([...risks, ...issues])];
    
    // Create a simple product list. We'll use the code as the name for simplicity.
    return projectCodes.map((code, index) => ({
        id: `proj-${index}`,
        code: code,
        name: code, // Assuming name is the same as code for now
        paNumber: '',
        value: 0,
        currentStatus: 'On Track'
    })) as Product[];
}


async function getBenchmarkingData() {
  await dbConnect();
  
  const [riskDocs, issueDocs, products] = await Promise.all([
    Risk.find({}).lean(),
    Issue.find({}).lean(),
    getProducts()
  ]);

  const risks: RiskIssue[] = riskDocs.map(doc => {
    const data = doc as any;
    return {
      ...data,
      id: data._id.toString(),
      _id: data._id.toString(),
      type: 'Risk',
      Title: data.title || data.description,
      DueDate: data.dueDate?.toISOString(),
      createdAt: data.createdAt?.toISOString(),
      ProjectName: data.projectCode,
      ProjectCode: data.projectCode,
    } as unknown as RiskIssue;
  });

  const issues: RiskIssue[] = issueDocs.map(doc => {
    const data = doc as any;
    // Attempt to find a matching project code if possible
    const product = products.find(p => p.name === data.projectName);
    return {
      ...data,
      id: data._id.toString(),
      _id: data._id.toString(),
      type: 'Issue',
      Title: data.title,
      "Due Date": data.dueDate?.toISOString(),
      createdAt: data.createdAt?.toISOString(),
      ProjectName: data.projectName,
      ProjectCode: data.projectName, // Assuming the name is the code for issues
    } as unknown as RiskIssue;
  });

  const combinedData: RiskIssue[] = [...risks, ...issues].map((item) => ({
    ...item,
    Status: item["riskStatus"] || item.status || 'Open',
  }));

  return {
    data: combinedData,
    products: products,
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
