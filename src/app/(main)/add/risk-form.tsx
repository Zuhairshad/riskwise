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
  month: z.string().min(1, "Month is required"),
  projectCode: z.string().min(1, "Project Code is required"),
  riskStatus: z.enum(["Open", "Closed", "Mitigated", "Transferred"]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  probability: z.coerce.number().min(0).max(1),
  impactRating: z.coerce.number().min(0.05).max(0.8),
  mitigationPlan: z.string().optional(),
  contingencyPlan: z.string().optional(),
  impactValue: z.coerce.number().min(0),
  budgetContingency: z.coerce.number().min(0),
  owner: z.string().optional(),
  dueDate: z.date().optional(),
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

export function RiskForm({ products }: RiskFormProps) {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = React.useState<Product | null>(
    null
  );
  const [autoFillData, setAutoFillData] =
    React.useState<AutoFillData | null>(null);

  const form = useForm<z.infer<typeof riskFormSchema>>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      month: "",
      projectCode: "",
      riskStatus: "Open",
      description: "",
      probability: 0.2,
      impactRating: 0.05,
      mitigationPlan: "",
      contingencyPlan: "",
      impactValue: 0,
      budgetContingency: 0,
      owner: "",
    },
  });

  const projectCode = form.watch("projectCode");
  const probability = form.watch("probability");
  const impactRating = form.watch("impactRating");
  const impactValue = form.watch("impactValue");
  const budgetContingency = form.watch("budgetContingency");

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
      form.setValue("projectCode", project.code);
    } else {
      setAutoFillData(null);
    }
  }, [projectCode, products, form]);

  const onSubmit = async (values: z.infer<typeof riskFormSchema>) => {
    const result = await createRisk(values);
    if (result.success) {
      toast({ title: "Success", description: "New risk created." });
      form.reset();
      setSelectedProject(null);
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
                <CardTitle>Project & Risk Identification</CardTitle>
                <CardDescription>
                  Start by identifying the project and the risk.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="month"
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
                  name="projectCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Code</FormLabel>
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
                              {field.value || "Select project code"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search project code..." />
                            <CommandList>
                              <CommandEmpty>No project found.</CommandEmpty>
                              <CommandGroup>
                                {products.map((product) => (
                                  <CommandItem
                                    value={product.code}
                                    key={product.id}
                                    onSelect={() => {
                                      form.setValue("projectCode", product.code);
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
                                    {product.code}
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

                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="description"
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plans</CardTitle>
                <CardDescription>
                  Outline mitigation and contingency plans.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="mitigationPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mitigation Plan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the plan to reduce probability..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contingencyPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contingency Plan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the plan if the risk materializes..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="riskStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter owner name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
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
                  name="probability"
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
                  name="impactRating"
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
                  name="impactValue"
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
                  name="budgetContingency"
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
