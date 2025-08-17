
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Bot,
  ChevronsUpDown,
  Check,
  Loader2,
  Sparkles,
  Info,
  CalendarIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { suggestSimilarRisks } from "@/ai/flows/suggest-similar-risks";
import { suggestMitigationStrategies } from "@/ai/flows/suggest-mitigation-strategies";
import { rephraseDescription } from "@/ai/flows/rephrase-description";
import { autofillRiskForm } from "@/ai/flows/autofill-risk-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { Product } from "@/lib/types";
import { createRisk } from "./actions";

const riskFormSchema = z.object({
  Month: z.string().min(1, "Month is required"),
  "Project Code": z.string().min(1, "Project Code is required"),
  "Risk Status": z.enum(["Open", "Closed", "Mitigated", "Transferred"]),
  Description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
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

type RiskFormProps = {
  products: Product[];
};

type AutoFillData = {
  projectName: string;
  projectCategorization: string;
  projectStatus: string;
  projectTeam: string[];
  projectVA: number;
  poValue: number;
  bidCost: number;
  bidVA: number;
  endUser: string;
};

type Suggestion = {
    matchedRisk?: {
        id: string;
        title: string;
        description: string;
        mitigationPlan?: string | undefined;
        contingencyPlan?: string | undefined;
        probability?: number | undefined;
        impactRating?: number | undefined;
    };
    rephrasedDescription?: string;
}

export function RiskForm({ products }: RiskFormProps) {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = React.useState<Product | null>(
    null
  );
  const [autoFillData, setAutoFillData] =
    React.useState<AutoFillData | null>(null);

  const [suggestion, setSuggestion] = React.useState<Suggestion | null>(null);
  const [isFetchingSuggestion, setIsFetchingSuggestion] = React.useState(false);

  const [mitigationSuggestions, setMitigationSuggestions] = React.useState<string[]>([]);
  const [isFetchingMitigation, setIsFetchingMitigation] = React.useState(false);
  
  const [contingencySuggestions, setContingencySuggestions] = React.useState<string[]>([]);
  const [isFetchingContingency, setIsFetchingContingency] = React.useState(false);
  
  const [rephrasedDescription, setRephrasedDescription] = React.useState<string | null>(null);
  const [isRephrasing, setIsRephrasing] = React.useState(false);
  const [isAutofilling, setIsAutofilling] = React.useState(false);

  const form = useForm<z.infer<typeof riskFormSchema>>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      Month: "",
      "Project Code": "",
      "Risk Status": "Open",
      Description: "",
      Probability: 0.2,
      "Imapct Rating (0.05-0.8)": 0.05,
      MitigationPlan: "",
      ContingencyPlan: "",
      "Impact Value ($)": 0,
      "Budget Contingency": 0,
      Owner: "",
      Title: "",
    },
  });

  const titleValue = form.watch("Title");
  const debouncedTitle = useDebounce(titleValue, 500);
  const projectCode = form.watch("Project Code");
  
  const probability = form.watch("Probability");
  const impactRating = form.watch("Imapct Rating (0.05-0.8)");
  const impactValue = form.watch("Impact Value ($)");
  const budgetContingency = form.watch("Budget Contingency");
  const descriptionValue = form.watch("Description");

  const debouncedDescription = useDebounce(descriptionValue, 500);

  React.useEffect(() => {
    if (debouncedTitle.length > 5 || projectCode) {
        setIsAutofilling(true);
        autofillRiskForm({ title: debouncedTitle, projectCode: projectCode })
        .then((res) => {
            if (res.matchedRisk) {
            const date = res.matchedRisk.DueDate?.toDate ? res.matchedRisk.DueDate.toDate() : undefined;
            const matchedData = {
                ...res.matchedRisk,
                DueDate: date,
                MitigationPlan: res.matchedRisk.MitigationPlan ?? '',
                ContingencyPlan: res.matchedRisk.ContingencyPlan ?? '',
                Owner: res.matchedRisk.Owner ?? '',
            }
            form.reset(matchedData);
            toast({ title: "Form Auto-filled", description: "Loaded data from an existing risk." });
            }
        })
        .finally(() => setIsAutofilling(false));
    }
  }, [debouncedTitle, projectCode, form, toast]);


  React.useEffect(() => {
    if (debouncedDescription.length > 10) {
      setIsFetchingSuggestion(true);
      setRephrasedDescription(null);
      setSuggestion(null);
      suggestSimilarRisks({ description: debouncedDescription })
        .then((res) => setSuggestion(res))
        .catch(() => toast({ variant: 'destructive', title: 'Could not fetch suggestions.' }))
        .finally(() => setIsFetchingSuggestion(false));
    } else {
        setSuggestion(null);
    }
  }, [debouncedDescription, toast]);

  const handleSuggestMitigations = async () => {
    setIsFetchingMitigation(true);
    setMitigationSuggestions([]);
    try {
      const res = await suggestMitigationStrategies({ riskOrIssueDescription: descriptionValue });
      setMitigationSuggestions(res.suggestedMitigationStrategies);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to suggest mitigations." });
    } finally {
      setIsFetchingMitigation(false);
    }
  };

  const handleSuggestContingency = async () => {
    setIsFetchingContingency(true);
    setContingencySuggestions([]);
    try {
      const res = await suggestMitigationStrategies({ riskOrIssueDescription: descriptionValue });
      setContingencySuggestions(res.suggestedMitigationStrategies);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to suggest contingency plans." });
    } finally {
      setIsFetchingContingency(false);
    }
  };

  const handleRephraseDescription = async () => {
    setIsRephrasing(true);
    setSuggestion(null); // Clear other suggestions
    setRephrasedDescription(null);
    try {
        const res = await rephraseDescription({ description: descriptionValue });
        setRephrasedDescription(res.rephrasedDescription);
    } catch(error) {
        toast({ variant: 'destructive', title: 'Failed to rephrase description.'})
    } finally {
        setIsRephrasing(false);
    }
  }


  const riskScore = React.useMemo(
    () => probability * impactRating,
    [probability, impactRating]
  );
  const emv = React.useMemo(
    () => probability * impactValue,
    [probability, impactValue]
  );
  const deficitSurplus = React.useMemo(
    () => budgetContingency - emv,
    [budgetContingency, emv]
  );
  const riskNature = React.useMemo(
    () => (impactValue > 0 ? "Financial" : "Non-Financial"),
    [impactValue]
  );

  const riskLevel = React.useMemo(() => {
    if (riskScore < 0.1) return "Low";
    if (riskScore < 0.3) return "Medium";
    if (riskScore < 0.6) return "High";
    return "Critical";
  }, [riskScore]);

  React.useEffect(() => {
    const project = products.find((p) => p.code === projectCode);
    setSelectedProject(project || null);
    if (project) {
      // In a real app, this data would be fetched from a database
      setAutoFillData({
        projectName: project.name,
        projectCategorization: "EPC", // mock data
        projectStatus: project.currentStatus,
        projectTeam: ["Alice", "Bob"], // mock data
        projectVA: project.value * 0.1, // mock data
        poValue: project.value * 0.8, // mock data
        bidCost: project.value * 0.9, // mock data
        bidVA: project.value * 0.11, // mock data
        endUser: "Client Inc.", // mock data
      });
      form.setValue("Project Code", project.code);
    } else {
      setAutoFillData(null);
    }
  }, [projectCode, products, form]);

  const onSubmit = async (values: z.infer<typeof riskFormSchema>) => {
    const result = await createRisk(values as any); // Cast to any to avoid type issues with spaced keys
    if (result.success) {
      toast({ title: "Success", description: "New risk created." });
      form.reset();
      setSelectedProject(null);
      setSuggestion(null);
      setRephrasedDescription(null);
      setMitigationSuggestions([]);
      setContingencySuggestions([]);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  const handleUseMatchedRisk = (matchedRisk: NonNullable<Suggestion['matchedRisk']>) => {
    form.setValue("Title", matchedRisk.title);
    form.setValue("Description", matchedRisk.description);
    if (matchedRisk.mitigationPlan) form.setValue("MitigationPlan", matchedRisk.mitigationPlan);
    if (matchedRisk.contingencyPlan) form.setValue("ContingencyPlan", matchedRisk.contingencyPlan);
    if (matchedRisk.probability) form.setValue("Probability", matchedRisk.probability);
    if (matchedRisk.impactRating) form.setValue("Imapct Rating (0.05-0.8)", matchedRisk.impactRating);
    setSuggestion(null);
    setRephrasedDescription(null);
    toast({ title: "Form Filled", description: "Form has been pre-filled with the matched risk data." });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project & Risk Identification</CardTitle>
                <CardDescription>
                  Start by identifying the project and the risk. {isAutofilling && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="Month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <FormControl>
                        <Input type="month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Project Code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span className="truncate">
                                {field.value
                                  ? products.find((p) => p.code === field.value)
                                      ?.name
                                  : "Select project"}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search project..." />
                            <CommandList>
                              <CommandEmpty>No project found.</CommandEmpty>
                              <CommandGroup>
                                {products.map((product) => (
                                  <CommandItem
                                    value={product.name}
                                    key={product.id}
                                    onSelect={() => {
                                      form.setValue("Project Code", product.code);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        product.code === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="truncate">{product.name} ({product.code})</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                    control={form.control}
                    name="Title"
                    render={({ field }) => (
                        <FormItem className="col-span-full">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input placeholder="A short, clear risk headline" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="col-span-full space-y-2">
                  <FormField
                    control={form.control}
                    name="Description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the risk in detail..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <Button type="button" variant="outline" size="sm" onClick={handleRephraseDescription} disabled={isRephrasing || !descriptionValue || descriptionValue.length < 10}>
                        {isRephrasing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Rephrase with AI
                    </Button>
                  {isFetchingSuggestion && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking for similar risks...
                    </div>
                  )}
                  {suggestion?.matchedRisk && (
                    <Alert>
                      <Bot className="h-4 w-4" />
                      <AlertTitle>Potential Duplicate Found</AlertTitle>
                      <AlertDescription>
                          <p>An existing risk with a similar description was found: <strong>{suggestion.matchedRisk.title}</strong>.</p>
                          <p className="text-xs text-muted-foreground mt-1 mb-2">"{suggestion.matchedRisk.description}"</p>
                          <Button type="button" size="sm" onClick={() => handleUseMatchedRisk(suggestion.matchedRisk!)}>Use This Data</Button>
                      </AlertDescription>
                    </Alert>
                  )}
                   {(suggestion?.rephrasedDescription || rephrasedDescription) && (
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>AI Suggestion</AlertTitle>
                        <AlertDescription>
                            <p>Consider rephrasing for clarity:</p>
                            <p className="italic my-2 p-2 bg-muted rounded">"{rephrasedDescription || suggestion.rephrasedDescription}"</p>
                            <Button type="button" size="sm" onClick={() => {
                                form.setValue("Description", rephrasedDescription || suggestion.rephrasedDescription || '');
                                setRephrasedDescription(null);
                                setSuggestion(null);
                            }}>Use Suggestion</Button>
                        </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plans</CardTitle>
                <CardDescription>
                  Outline mitigation and contingency plans. Use AI to get suggestions based on the description.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <FormField
                    control={form.control}
                    name="MitigationPlan"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mitigation Plan</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describe the plan to reduce probability..."
                            {...field}
                            value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <Button type="button" variant="outline" size="sm" onClick={handleSuggestMitigations} disabled={isFetchingMitigation || !descriptionValue}>
                        {isFetchingMitigation ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Suggest with AI
                    </Button>
                    {mitigationSuggestions.length > 0 && (
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>AI Suggested Mitigation Strategies</AlertTitle>
                        <AlertDescription>
                            Click to use a suggestion.
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {mitigationSuggestions.map((s, i) => (
                                <li key={i} className="cursor-pointer hover:underline" onClick={() => form.setValue("MitigationPlan", s)}>
                                    {s}
                                </li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                    )}
                </div>
                <div className="space-y-2">
                    <FormField
                    control={form.control}
                    name="ContingencyPlan"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contingency Plan</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describe the plan if the risk materializes..."
                            {...field}
                             value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleSuggestContingency} disabled={isFetchingContingency || !descriptionValue}>
                        {isFetchingContingency ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Suggest with AI
                    </Button>
                     {contingencySuggestions.length > 0 && (
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>AI Suggested Contingency Plans</AlertTitle>
                        <AlertDescription>
                            Click to use a suggestion.
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {contingencySuggestions.map((s, i) => (
                                <li key={i} className="cursor-pointer hover:underline" onClick={() => form.setValue("ContingencyPlan", s)}>
                                    {s}
                                </li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="Risk Status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="Mitigated">Mitigated</SelectItem>
                          <SelectItem value="Transferred">Transferred</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter owner name" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="DueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {autoFillData && (
              <Card>
                <CardHeader>
                  <CardTitle>Auto-filled Project Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project Name</span>
                    <span>{autoFillData.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span>{autoFillData.projectStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End User</span>
                    <span>{autoFillData.endUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PO Value</span>
                    <span>${autoFillData.poValue.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Scoring & Financials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="Probability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Probability (0-1)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Imapct Rating (0.05-0.8)"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact Rating (0.05-0.8)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.05" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Impact Value ($)"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Budget Contingency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Contingency ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <div className="text-sm space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>Risk Score</span>
                    <span>{riskScore.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span>{riskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EMV ($)</span>
                    <span>{emv.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Deficit/Surplus ($)
                    </span>
                    <span
                      className={cn(
                        deficitSurplus < 0
                          ? "text-destructive"
                          : "text-green-600"
                      )}
                    >
                      {deficitSurplus.toLocaleString()}
                    </span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Nature</span>
                    <span>{riskNature}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Risk
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
