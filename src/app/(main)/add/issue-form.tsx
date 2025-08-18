
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Bot, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { createIssue } from "./actions";
import { useDebounce } from "@/hooks/use-debounce";
import { suggestSimilarIssues } from "@/ai/flows/suggest-similar-issues";
import { suggestMitigationStrategies } from "@/ai/flows/suggest-mitigation-strategies";
import { rephraseDescription } from "@/ai/flows/rephrase-description";
import { suggestTitle } from "@/ai/flows/suggest-title";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Combobox } from "@/components/ui/combobox";


const issueFormSchema = z.object({
    Month: z.string().min(1, "Month is required"),
    "Category New": z.enum(["(15) Budget", "Technical", "Contractual", "Resource", "Schedule", "(13) Supply"], { required_error: "Category is required." }),
    Portfolio: z.string().optional(),
    Title: z.string().min(5, "Title must be at least 5 characters."),
    Discussion: z.string().min(10, "Discussion must be at least 10 characters."),
    Resolution: z.string().optional(),
    "Due Date": z.date().optional(),
    Owner: z.string().min(1, "Owner is required."),
    Response: z.enum(["Under Review", "In Progress", "Closed"]).nullable(),
    Impact: z.enum(["Low", "Medium", "High"]).nullable(),
    "Impact ($)": z.coerce.number().optional().nullable(),
    Priority: z.enum(["Low", "Medium", "High", "Critical", "(1) High"], { required_error: "Priority is required." }),
    ProjectName: z.string().min(1, "Project Name is required."),
    Status: z.enum(["Open", "Resolved", "Escalated", "Closed"], { required_error: "Status is required." }),
});

type Suggestion = {
    matchedIssue?: {
        id: string;
        title: string;
        discussion: string;
        resolution?: string | undefined;
    };
    rephrasedDescription?: string;
}

export function IssueForm() {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [suggestion, setSuggestion] = React.useState<Suggestion | null>(null);
  const [isFetchingSuggestion, setIsFetchingSuggestion] = React.useState(false);
  const [resolutionSuggestions, setResolutionSuggestions] = React.useState<string[]>([]);
  const [isFetchingResolution, setIsFetchingResolution] = React.useState(false);
  const [rephrasedDiscussion, setRephrasedDiscussion] = React.useState<string | null>(null);
  const [isRephrasing, setIsRephrasing] = React.useState(false);
  const [titleSuggestion, setTitleSuggestion] = React.useState<string | null>(null);
  const [isFetchingTitle, setIsFetchingTitle] = React.useState(false);
  
  const form = useForm<z.infer<typeof issueFormSchema>>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      Month: "",
      Title: "",
      Discussion: "",
      Owner: "",
      ProjectName: "",
      Portfolio: "",
      Resolution: "",
      "Impact ($)": 0,
      Response: "Under Review",
      Impact: "Medium",
      Priority: "Medium",
      Status: "Open",
    },
  });

  React.useEffect(() => {
    async function getPageData() {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);
      }
      getPageData();
  }, [])

  const discussionValue = form.watch("Discussion");
  const debouncedDiscussion = useDebounce(discussionValue, 500);

  React.useEffect(() => {
    if (debouncedDiscussion.length > 10) {
      setIsFetchingSuggestion(true);
      setRephrasedDiscussion(null);
      setSuggestion(null);
      suggestSimilarIssues({ description: debouncedDiscussion })
        .then((res) => setSuggestion(res))
        .catch(() => toast({ variant: 'destructive', title: 'Could not fetch suggestions.' }))
        .finally(() => setIsFetchingSuggestion(false));
    } else {
        setSuggestion(null);
    }
  }, [debouncedDiscussion, toast]);

  const handleSuggestResolution = async () => {
    setIsFetchingResolution(true);
    setResolutionSuggestions([]);
    try {
      const res = await suggestMitigationStrategies({ riskOrIssueDescription: discussionValue });
      setResolutionSuggestions(res.suggestedMitigationStrategies);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to suggest resolutions." });
    } finally {
      setIsFetchingResolution(false);
    }
  };

  const handleSuggestTitle = async () => {
    setIsFetchingTitle(true);
    setTitleSuggestion(null);
    try {
      const res = await suggestTitle({ description: discussionValue });
      setTitleSuggestion(res.title);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to suggest a title." });
    } finally {
      setIsFetchingTitle(false);
    }
  };


  const handleRephraseDiscussion = async () => {
    setIsRephrasing(true);
    setSuggestion(null); // Clear other suggestions
    setRephrasedDiscussion(null);
    try {
        const res = await rephraseDescription({ description: discussionValue });
        setRephrasedDiscussion(res.rephrasedDescription);
    } catch(error) {
        toast({ variant: 'destructive', title: 'Failed to rephrase description.'})
    } finally {
        setIsRephrasing(false);
    }
  }

  const handleUseMatchedIssue = (matchedIssue: NonNullable<Suggestion['matchedIssue']>) => {
    form.setValue("Discussion", matchedIssue.discussion);
    form.setValue("Title", matchedIssue.title);
    if (matchedIssue.resolution) form.setValue("Resolution", matchedIssue.resolution);
    setSuggestion(null);
    setRephrasedDiscussion(null);
    toast({ title: "Form Filled", description: "Form has been pre-filled with the matched issue data." });
  }

  const onSubmit = async (values: z.infer<typeof issueFormSchema>) => {
    const result = await createIssue(values as any);
    if (result.success) {
      toast({ title: "Success", description: "New issue created." });
      form.reset();
      setSuggestion(null);
      setRephrasedDiscussion(null);
      setResolutionSuggestions([]);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Issue Details</CardTitle>
                        <CardDescription>Provide the details for the new issue.</CardDescription>
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
                            name="Category New"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="(15) Budget">(15) Budget</SelectItem>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                        <SelectItem value="Contractual">Contractual</SelectItem>
                                        <SelectItem value="Resource">Resource</SelectItem>
                                        <SelectItem value="Schedule">Schedule</SelectItem>
                                        <SelectItem value="(13) Supply">(13) Supply</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ProjectName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project</FormLabel>
                                    <FormControl>
                                    <Combobox
                                        options={products.map(p => ({ value: p.name, label: `${p.name} (${p.code})` }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select project..."
                                        searchPlaceholder="Search project..."
                                        notFoundText="No project found."
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name="Portfolio"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Portfolio</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter portfolio" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="col-span-full space-y-2">
                            <FormField
                                control={form.control}
                                name="Title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="A short, clear issue headline" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Button type="button" variant="outline" size="sm" onClick={handleSuggestTitle} disabled={isFetchingTitle || !discussionValue || discussionValue.length < 10}>
                                {isFetchingTitle ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                Suggest Title with AI
                            </Button>
                             {titleSuggestion && (
                                <Alert>
                                <Bot className="h-4 w-4" />
                                <AlertTitle>AI Suggested Title</AlertTitle>
                                <AlertDescription>
                                    <p className="italic my-2 p-2 bg-muted rounded">&quot;{titleSuggestion}&quot;</p>
                                    <Button type="button" size="sm" onClick={() => {
                                        form.setValue("Title", titleSuggestion);
                                        setTitleSuggestion(null);
                                    }}>Use Suggestion</Button>
                                </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <div className="col-span-full space-y-2">
                            <FormField
                                control={form.control}
                                name="Discussion"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Discussion</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Background, details, and explanation of issue" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={handleRephraseDiscussion} disabled={isRephrasing || !discussionValue || discussionValue.length < 10}>
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
                                Checking for similar issues...
                                </div>
                            )}
                            {suggestion?.matchedIssue && (
                                <Alert>
                                <Bot className="h-4 w-4" />
                                <AlertTitle>Potential Duplicate Found</AlertTitle>
                                <AlertDescription>
                                    <p>An existing issue with a similar description was found: <strong>{suggestion.matchedIssue.title}</strong>.</p>
                                    <p className="text-xs text-muted-foreground mt-1 mb-2">"{suggestion.matchedIssue.discussion}"</p>
                                    <Button type="button" size="sm" onClick={() => handleUseMatchedIssue(suggestion.matchedIssue!)}>Use This Data</Button>
                                </AlertDescription>
                                </Alert>
                            )}
                            {(suggestion?.rephrasedDescription || rephrasedDiscussion) && (
                                <Alert>
                                    <Bot className="h-4 w-4" />
                                    <AlertTitle>AI Suggestion</AlertTitle>
                                    <AlertDescription>
                                        <p>Consider rephrasing for clarity:</p>
                                        <p className="italic my-2 p-2 bg-muted rounded">"{rephrasedDiscussion || suggestion.rephrasedDescription}"</p>
                                        <Button type="button" size="sm" onClick={() => {
                                            form.setValue("Discussion", rephrasedDiscussion || suggestion.rephrasedDescription || '');
                                            setRephrasedDiscussion(null);
                                            setSuggestion(null);
                                        }}>Use Suggestion</Button>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <div className="col-span-full space-y-2">
                            <FormField
                                control={form.control}
                                name="Resolution"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Resolution</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Proposed corrective action / solution" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={handleSuggestResolution} disabled={isFetchingResolution || !discussionValue}>
                                {isFetchingResolution ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                )}
                                Suggest with AI
                            </Button>
                            {resolutionSuggestions.length > 0 && (
                            <Alert>
                                <Bot className="h-4 w-4" />
                                <AlertTitle>AI Suggested Resolutions</AlertTitle>
                                <AlertDescription>
                                    Click to use a suggestion.
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        {resolutionSuggestions.map((s, i) => (
                                        <li key={i} className="cursor-pointer hover:underline" onClick={() => form.setValue("Resolution", s)}>
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
                            name="Owner"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Owner</FormLabel>
                                <FormControl>
                                    <Input placeholder="Person responsible for resolution" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Due Date"
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
                        <FormField
                            control={form.control}
                            name="Status"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                        <SelectItem value="Escalated">Escalated</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Response"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Response</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? undefined} defaultValue={field.value ?? undefined}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a response" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Under Review">Under Review</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Impact & Priority</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="Impact"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Impact</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? undefined} defaultValue={field.value ?? undefined}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select impact level" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Impact ($)"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Impact Value ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Estimated financial impact" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Priority"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority level" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="(1) High">(1) High</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Issue"}
                </Button>
            </div>
        </div>
      </form>
    </Form>
  );
}
