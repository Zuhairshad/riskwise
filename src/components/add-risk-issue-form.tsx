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
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { suggestSimilarRisksIssues } from "@/ai/flows/suggest-similar-risks-issues";
import { suggestMitigationStrategies } from "@/ai/flows/suggest-mitigation-strategies";
import type { Product, RiskType, Status, Priority } from "@/lib/types";
import { riskTypes, statuses, priorities } from "@/lib/data";
import { createRiskIssue } from "./add/actions";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  productId: z.string({ required_error: "Please select a product." }),
  type: z.enum(["Risk", "Issue"], {
    required_error: "You need to select a type.",
  }),
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"], {
    required_error: "You need to select a status.",
  }),
  priority: z.enum(["Low", "Medium", "High", "Critical"], {
    required_error: "You need to select a priority.",
  }),
  probability: z.number().min(0).max(100),
  impact: z.number().min(0).max(100),
  description: z.string().min(10, "Description must be at least 10 characters."),
  mitigationStrategy: z.string().optional(),
});

type AddRiskIssueFormProps = {
  products: Product[];
};

export function AddRiskIssueForm({ products }: AddRiskIssueFormProps) {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [similarSuggestions, setSimilarSuggestions] = React.useState<string[]>([]);
  const [mitigationSuggestions, setMitigationSuggestions] = React.useState<string[]>([]);
  const [isFetchingSimilar, setIsFetchingSimilar] = React.useState(false);
  const [isFetchingMitigation, setIsFetchingMitigation] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      mitigationStrategy: "",
      probability: 50,
      impact: 50,
      type: "Risk",
      status: "Open",
      priority: "Medium",
    },
  });

  const descriptionValue = form.watch("description");
  const debouncedDescription = useDebounce(descriptionValue, 500);

  React.useEffect(() => {
    if (debouncedDescription.length > 10) {
      setIsFetchingSimilar(true);
      suggestSimilarRisksIssues({ description: debouncedDescription })
        .then((res) => setSimilarSuggestions(res.suggestions))
        .catch(() => toast({ variant: 'destructive', title: 'Could not fetch suggestions.' }))
        .finally(() => setIsFetchingSimilar(false));
    } else {
      setSimilarSuggestions([]);
    }
  }, [debouncedDescription, toast]);

  const handleSuggestMitigations = async () => {
    setIsFetchingMitigation(true);
    try {
      const res = await suggestMitigationStrategies({
        riskOrIssueDescription: descriptionValue,
      });
      setMitigationSuggestions(res.suggestedMitigationStrategies);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to suggest mitigations." });
    } finally {
      setIsFetchingMitigation(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await createRiskIssue(values);
    if (result.success) {
      toast({ title: "Success", description: "New entry created." });
      form.reset();
      setSelectedProduct(null);
      setSimilarSuggestions([]);
      setMitigationSuggestions([]);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Define Risk or Issue</CardTitle>
                    <CardDescription>Start by describing the entry and linking it to a product.</CardDescription>
                </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Potential server overload during peak hours" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the risk or issue in detail..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {isFetchingSimilar && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking for similar entries...
                  </div>
                )}
                {similarSuggestions.length > 0 && (
                  <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertTitle>AI Suggestion: Similar Entries Found</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {similarSuggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mitigation</CardTitle>
                    <CardDescription>Outline the strategy to mitigate this risk or resolve this issue.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="mitigationStrategy"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Mitigation Strategy</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Describe the plan to address this..."
                                className="min-h-[100px]"
                                {...field}
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
                            <AlertTitle>AI Suggested Strategies</AlertTitle>
                            <AlertDescription>
                                Click to use a suggestion.
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {mitigationSuggestions.map((s, i) => (
                                    <li key={i} className="cursor-pointer hover:underline" onClick={() => form.setValue("mitigationStrategy", s)}>
                                        {s}
                                    </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                        )}
                 </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                  <CardTitle>Properties</CardTitle>
                  <CardDescription>Classify and prioritize this entry.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Product</FormLabel>
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
                              {field.value
                                ? products.find(
                                    (p) => p.id === field.value
                                  )?.name
                                : "Select product"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search product..." />
                            <CommandList>
                                <CommandEmpty>No product found.</CommandEmpty>
                                <CommandGroup>
                                {products.map((product) => (
                                    <CommandItem
                                    value={product.name}
                                    key={product.id}
                                    onSelect={() => {
                                        form.setValue("productId", product.id);
                                        setSelectedProduct(product);
                                    }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        product.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                    />
                                    {product.name} ({product.code})
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

                {selectedProduct && (
                  <Alert variant="default" className="text-sm">
                    <Info className="h-4 w-4" />
                    <AlertTitle>{selectedProduct.name}</AlertTitle>
                    <AlertDescription>
                      PA Number: {selectedProduct.paNumber}<br />
                      Value: ${selectedProduct.value.toLocaleString()}<br />
                      Status: {selectedProduct.currentStatus}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Separator />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                            <div className="grid grid-cols-2 gap-2">
                                {riskTypes.map(option => (
                                    <Button key={option.value} type="button" variant={field.value === option.value ? "default" : "outline"} onClick={() => field.onChange(option.value)}>
                                        {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                                        {option.label}
                                    </Button>
                                ))}
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2">
                            {statuses.map(option => (
                              <Button key={option.value} type="button" variant={field.value === option.value ? "secondary" : "outline"} className="justify-start" onClick={() => field.onChange(option.value)}>
                                  {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                                  {option.label}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2">
                            {priorities.map(option => (
                              <Button key={option.value} type="button" variant={field.value === option.value ? "secondary" : "outline"} className="justify-start" onClick={() => field.onChange(option.value)}>
                                  {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                                  {option.label}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Scoring</CardTitle>
                  <CardDescription>Quantify the probability and impact.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                 <FormField
                    control={form.control}
                    name="probability"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Probability: {field.value}%</FormLabel>
                        <FormControl>
                            <Slider
                                defaultValue={[50]}
                                max={100}
                                step={1}
                                onValueChange={(value) => field.onChange(value[0])}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="impact"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Impact: {field.value}%</FormLabel>
                        <FormControl>
                             <Slider
                                defaultValue={[50]}
                                max={100}
                                step={1}
                                onValueChange={(value) => field.onChange(value[0])}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
              </CardContent>
            </Card>

             <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Entry
             </Button>

          </div>
        </div>
      </form>
    </Form>
  );
}
