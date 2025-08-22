import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RiskIssue, Product } from "@/lib/types";
import { TopRisksList } from "@/components/dashboard/executive/top-risks-list";

async function getProducts() {
    const productsCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productsCollection);
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}


async function getTopRisks() {
  const risksCollection = collection(db, "risks");
  const riskSnapshot = await getDocs(risksCollection);
  const products = await getProducts();

  const risks: RiskIssue[] = riskSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      _id: doc.id,
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
