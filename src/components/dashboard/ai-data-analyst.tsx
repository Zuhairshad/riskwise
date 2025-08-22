
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, Bot, Loader2, AlertCircle } from "lucide-react";
import { analyzeData } from "@/app/(main)/actions";
import type { RiskIssue, Product } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type AIDataAnalystProps = {
  data: RiskIssue[];
  products: Product[];
};

export function AIDataAnalyst({ data, products }: AIDataAnalystProps) {
  const [question, setQuestion] = React.useState("");
  const [analysis, setAnalysis] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnalysis("");
    setError(null);

    try {
      // Pass the raw data directly to the server action.
      const result = await analyzeData({
        question,
        projects: products,
        risksAndIssues: data,
      });

      if (result.success) {
        setAnalysis(result.analysis!);
      } else {
        setError(result.message || "An unknown error occurred.");
      }
    } catch (err) {
      setError("Failed to fetch analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          <span>AI Data Analyst</span>
        </CardTitle>
        <CardDescription>
          Ask a question about your current dataset to get AI-powered insights. Example: "Which project has the highest financial impact from open risks?"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="e.g., Which project has the most open issues?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !question.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Ask
          </Button>
        </form>
        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {analysis && (
            <Alert className="mt-4 border-accent">
                <Bot className="h-4 w-4" />
                <AlertTitle>Analysis</AlertTitle>
                <AlertDescription>
                    <p className="whitespace-pre-wrap">{analysis}</p>
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
