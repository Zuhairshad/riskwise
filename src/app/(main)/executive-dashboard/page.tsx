
import dbConnect from "@/lib/db";
import Risk from "@/models/Risk";
import Issue from "@/models/Issue";
import type { RiskIssue, Product } from "@/lib/types";
import { TopRisksList } from "@/components/dashboard/executive/top-risks-list";


async function getProducts() {
    await dbConnect();

    const risks = await Risk.find({}).distinct('projectCode').lean();
    const issues = await Issue.find({}).distinct('projectName').lean();
    const projectCodes = [...new Set([...risks, ...issues])];
    
    return projectCodes.map((code, index) => ({
        id: `proj-${index}`,
        code: code,
        name: code,
        paNumber: '',
        value: 0,
        currentStatus: 'On Track'
    })) as Product[];
}


async function getTopRisks() {
  await dbConnect();
  const riskDocs = await Risk.find({}).lean();
  const products = await getProducts();

  const risks: RiskIssue[] = riskDocs.map((doc) => {
    const data = doc as any;
    return {
      ...data,
      id: data._id.toString(),
      _id: data._id.toString(),
      type: "Risk",
    } as unknown as RiskIssue;
  });

  const scoredRisks = risks
    .map((risk) => {
      const probability = risk.Probability ?? 0;
      const impact = risk["Imapct Rating (0.05-0.8)"] ?? 0;
      const score = probability * impact;
      const project = products.find((p) => p.code === risk["Project Code"]);

      return {
        ...risk,
        riskScore: score,
        ProjectName: project?.name || risk["Project Code"] || "Unknown Project",
      };
    })
    .filter(risk => {
        const status = risk['Risk Status'];
        return status && status !== 'Closed' && status !== 'Converted to Issue';
    });

  scoredRisks.sort((a, b) => b.riskScore - a.riskScore);

  return scoredRisks.slice(0, 10);
}

export default async function ExecutiveDashboardPage() {
  const topRisks = await getTopRisks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Executive Dashboard
        </h1>
        <p className="text-muted-foreground">
          A high-level overview of the most critical risks.
        </p>
      </div>
      <TopRisksList risks={topRisks} />
    </div>
  );
}
