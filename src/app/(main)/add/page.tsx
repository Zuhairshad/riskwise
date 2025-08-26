
'use client';

import * as React from "react";
import { RiskForm } from "./risk-form";
import { IssueForm } from "./issue-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle } from "lucide-react";

export default function AddPage() {
  const [activeTab, setActiveTab] = React.useState('risk');

  React.useEffect(() => {
    document.body.classList.remove('theme-risk', 'theme-issue');
    document.body.classList.add(`theme-${activeTab}`);
  }, [activeTab]);

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-headline font-bold">Add New Entry</h1>
            <p className="text-muted-foreground">
                Fill out the form below to create a new risk or issue.
            </p>
        </div>
        <Tabs defaultValue="risk" className="w-full" onValueChange={(value) => setActiveTab(value)}>
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
                 <RiskForm />
            </TabsContent>
            <TabsContent value="issue" className="mt-6">
                <IssueForm />
            </TabsContent>
        </Tabs>
      
    </div>
  );
}
