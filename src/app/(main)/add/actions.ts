
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { ai } from "@/ai/genkit";

// Schemas for form data
const riskFormSchema = z.object({
  Month: z.string().min(1, "Month is required"),
  "Project Code": z.string().min(1, "Project Code is required"),
  "Risk Status": z.enum(["Open", "Closed", "Mitigated", "Transferred"]),
  Description: z.string().min(10, "Description must be at least 10 characters."),
  Probability: z.coerce.number().min(0).max(1),
  "Imapct Rating (0.05-0.8)": z.coerce.number().min(0.05).max(0.8),
  MitigationPlan: z.string().optional(),
  ContingencyPlan: z.string().optional(),
  "Impact Value ($)": z.coerce.number().min(0),
  "Budget Contingency": z.coerce.number().min(0),
  Owner: z.string().optional(),
  DueDate: z.date().optional(),
  Title: z.string().min(5, "Title must be at least 5 characters."),
});

const issueFormSchema = z.object({
    Month: z.string().min(1, "Month is required"),
    "Category New": z.enum(["(15) Budget", "Technical", "Contractual", "Resource", "Schedule", "(13) Supply"]),
    Portfolio: z.string().optional(),
    Title: z.string().min(5, "Title must be at least 5 characters."),
    Discussion: z.string().min(10, "Discussion must be at least 10 characters."),
    Resolution: z.string().optional(),
    "Due Date": z.date().optional(),
    Owner: z.string().min(1, "Owner is required."),
    Response: z.enum(["Under Review", "In Progress", "Closed"]).nullable(),
    Impact: z.enum(["Low", "Medium", "High"]).nullable(),
    "Impact ($)": z.coerce.number().optional().nullable(),
    Priority: z.enum(["Low", "Medium", "High", "Critical", "(1) High"]),
    ProjectName: z.string().min(1, "Project Name is required."),
    Status: z.enum(["Open", "Resolved", "Escalated", "Closed"]),
});

// Firestore data creation functions
export async function createRisk(values: z.infer<typeof riskFormSchema>) {
    const parsed = riskFormSchema.safeParse(values);
  
    if (!parsed.success) {
      return { success: false, message: "Invalid data provided." };
    }
  
    try {
      await addDoc(collection(db, "risks"), parsed.data);
      revalidatePath('/');
      return { success: true, message: "Risk created successfully." };
    } catch (error) {
      console.error("Error creating risk:", error);
      return { success: false, message: "Failed to create risk." };
    }
}

export async function createIssue(values: z.infer<typeof issueFormSchema>) {
    const parsed = issueFormSchema.safeParse(values);
  
    if (!parsed.success) {
      console.log(parsed.error.errors)
      return { success: false, message: "Invalid data provided." };
    }
  
    try {
        await addDoc(collection(db, "issues"), parsed.data);
        revalidatePath('/');
        return { success: true, message: "Issue created successfully." };
      } catch (error) {
        console.error("Error creating issue:", error);
        return { success: false, message: "Failed to create issue." };
      }
}


// AI-powered function schemas and implementations

// Suggest Title
const SuggestTitleInputSchema = z.object({
  description: z.string().describe('The text to generate a title from.'),
});
const SuggestTitleOutputSchema = z.object({
  title: z.string().describe('The suggested title.'),
});
const suggestTitlePrompt = ai.definePrompt({
    name: 'suggestTitlePrompt',
    input: {schema: SuggestTitleInputSchema},
    output: {schema: SuggestTitleOutputSchema},
    prompt: `You are an expert project manager. You are great at writing concise, clear, and descriptive titles.

    A user has entered the following description for a risk or issue. Based on this text, suggest a short, clear title. 
    The title should be no more than 10 words.

    Only return the suggested title in the 'title' field.

    Description: {{{description}}}`,
    model: 'googleai/gemini-1.5-flash',
});
export async function suggestTitle(input: z.infer<typeof SuggestTitleInputSchema>): Promise<z.infer<typeof SuggestTitleOutputSchema>> {
    const {output} = await suggestTitlePrompt(input);
    return output!;
}


// Rephrase Description
const RephraseDescriptionInputSchema = z.object({
  description: z.string().describe('The text to be rephrased.'),
});
const RephraseDescriptionOutputSchema = z.object({
  rephrasedDescription: z.string().describe('The rephrased version of the description.'),
});
const rephraseDescriptionPrompt = ai.definePrompt({
    name: 'rephraseDescriptionPrompt',
    input: {schema: RephraseDescriptionInputSchema},
    output: {schema: RephraseDescriptionOutputSchema},
    prompt: `You are an expert technical writer.
  
    A user has entered the following description. Rephrase it to be clearer, more concise, and professionally worded.
  
    Only return the rephrased description in the 'rephrasedDescription' field.

    Original Description: {{{description}}}`,
});
export async function rephraseDescription(input: z.infer<typeof RephraseDescriptionInputSchema>): Promise<z.infer<typeof RephraseDescriptionOutputSchema>> {
    const {output} = await rephraseDescriptionPrompt(input);
    return output!;
}


// Suggest Mitigation Strategies
const SuggestMitigationStrategiesInputSchema = z.object({
  riskOrIssueDescription: z
    .string()
    .describe('The description of the risk or issue.'),
});
const SuggestMitigationStrategiesOutputSchema = z.object({
  suggestedMitigationStrategies: z
    .array(z.string())
    .describe('Suggested mitigation strategies based on the input description.'),
});
const suggestMitigationStrategiesPrompt = ai.definePrompt({
  name: 'suggestMitigationStrategiesPrompt',
  input: {schema: SuggestMitigationStrategiesInputSchema},
  output: {schema: SuggestMitigationStrategiesOutputSchema},
  prompt: `You are an AI assistant specializing in suggesting mitigation strategies for risks and issues.
  Based on the description of the risk or issue, suggest 3 to 5 potential mitigation strategies.
  Description: {{{riskOrIssueDescription}}}
  Suggest mitigation strategies that are relevant and effective in addressing the described risk or issue.`,
  model: 'googleai/gemini-1.5-flash',
});
export async function suggestMitigationStrategies(input: z.infer<typeof SuggestMitigationStrategiesInputSchema>): Promise<z.infer<typeof SuggestMitigationStrategiesOutputSchema>> {
    const {output} = await suggestMitigationStrategiesPrompt(input);
    return output!;
}

// Suggest Similar Risks
const SuggestSimilarRisksInputSchema = z.object({
  description: z.string().describe('The description of the risk or issue being entered.'),
  existingRisks: z.string().describe('A JSON string of existing risks to compare against.'),
});
const MatchedRiskSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    mitigationPlan: z.string().optional(),
    contingencyPlan: z.string().optional(),
    probability: z.number().optional(),
    impactRating: z.number().optional(),
});
const DetailedSummarySchema = z.object({
    analysis: z.string().describe("A summary of why the new risk is a match to the existing one, including historical context."),
    keyMetrics: z.array(z.object({
        name: z.string().describe("The name of the metric (e.g., 'Probability')"),
        value: z.string().describe("The value of the metric (e.g., '0.9 (High)')"),
    })).describe("A list of key metrics from the matched risk."),
    recommendation: z.string().describe("An AI-powered recommendation based on the historical data."),
});
const SuggestSimilarRisksOutputSchema = z.object({
  matchedRisk: MatchedRiskSchema.optional().describe('The existing risk that matches the description.'),
  rephrasedDescription: z.string().optional().describe('A rephrased version of the description for clarity if no match is found.'),
  detailedSummary: DetailedSummarySchema.optional().describe('A detailed, structured summary and analysis of the matched risk.'),
});
const suggestOrRephraseRiskPrompt = ai.definePrompt({
  name: 'suggestOrRephraseRiskPrompt',
  input: {schema: SuggestSimilarRisksInputSchema},
  output: {schema: SuggestSimilarRisksOutputSchema},
  prompt: `You are an expert risk management analyst. A user is entering a new risk and you need to help them avoid duplicates by providing insightful analysis of past data.
  
  Current risk description:
  "{{{description}}}"

  Here are the existing risks in the database:
  {{{existingRisks}}}
  
  Your primary task is to determine if the new risk is a potential duplicate of an existing one.
  
  - If you find a strong match (semantic similarity > 0.8), your goal is to provide maximum context to the user.
    1. Return the 'matchedRisk' object with the data from the existing risk.
    2. In the 'detailedSummary' field, provide a rich, structured, and analytical summary of the matched risk.
        - In 'analysis', explain WHY it's a match. Include details about the project it occurred on and the historical context.
        - In 'keyMetrics', extract the most important metrics from the matched risk, like 'Probability' and 'Impact Rating'. Format them clearly.
        - In 'recommendation', provide a clear, actionable recommendation for the user. For example, if a contingency plan was missing before, suggest adding one now.
  - If you do not find a strong match, your secondary task is to help the user improve their entry. Rephrase the user's original description to be clearer, more concise, and professionally worded. Return this improved text in the 'rephrasedDescription' field and leave 'matchedRisk' and 'detailedSummary' empty.`,
  model: 'googleai/gemini-1.5-flash',
});
export async function suggestSimilarRisks(input: z.infer<typeof SuggestSimilarRisksInputSchema>): Promise<z.infer<typeof SuggestSimilarRisksOutputSchema>> {
    const {output} = await suggestOrRephraseRiskPrompt(input);
    return output!;
}


// Suggest Similar Issues
const SuggestSimilarIssuesInputSchema = z.object({
  description: z.string().describe('The description of the issue being entered.'),
  existingIssues: z.string().describe('A JSON string of existing issues to compare against.'),
});
const MatchedIssueSchema = z.object({
    id: z.string(),
    title: z.string(),
    discussion: z.string(),
    resolution: z.string().optional(),
});
const SuggestSimilarIssuesOutputSchema = z.object({
  matchedIssue: MatchedIssueSchema.optional().describe('The existing issue that matches the description.'),
  rephrasedDescription: z.string().optional().describe('A rephrased version of the description for clarity if no match is found.'),
  detailedSummary: DetailedSummarySchema.optional().describe('A detailed, structured summary and analysis of the matched issue.'),
});
const suggestOrRephraseIssuePrompt = ai.definePrompt({
  name: 'suggestOrRephraseIssuePrompt',
  input: {schema: SuggestSimilarIssuesInputSchema},
  output: {schema: SuggestSimilarIssuesOutputSchema},
  prompt: `You are an expert project manager. A user is entering a new issue and you need to help them avoid duplicates by providing insightful analysis of past data.

  Current issue description:
  "{{{description}}}"
  
  Here are the existing issues in the database:
  {{{existingIssues}}}

  Your primary task is to determine if the new issue is a potential duplicate of an existing one.
  
  - If you find a strong match (semantic similarity > 0.8), your goal is to provide maximum context to the user.
    1. Return the 'matchedIssue' object with the data from the existing issue.
    2. In the 'detailedSummary' field, provide a rich, structured, and analytical summary of the matched issue.
        - In 'analysis', explain WHY it's a match. Include details about the project it occurred on and the historical context.
        - In 'keyMetrics', extract the most important metrics from the matched issue, like 'Priority' and 'Impact'. Format them clearly.
        - In 'recommendation', provide a clear, actionable recommendation for the user. For example, if a resolution was particularly effective, highlight it.
  - If you do not find a strong match, your secondary task is to help the user improve their entry. Rephrase the user's original discussion to be clearer, more concise, and professionally worded. Return this improved text in the 'rephrasedDescription' field and leave 'matchedIssue' and 'detailedSummary' empty.`,
  model: 'googleai/gemini-1.5-flash',
});
export async function suggestSimilarIssues(input: z.infer<typeof SuggestSimilarIssuesInputSchema>): Promise<z.infer<typeof SuggestSimilarIssuesOutputSchema>> {
    const {output} = await suggestOrRephraseIssuePrompt(input);
    return output!;
}
