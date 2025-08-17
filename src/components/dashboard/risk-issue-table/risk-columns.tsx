
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { RiskIssue, Status } from "@/lib/types";
import { statuses, products } from "@/lib/data";
import { DataTableRowActions } from "./row-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


async function updateField(id: string, field: string, value: any) {
  console.log(`Updating ${field} for item ${id} to ${value}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
}

export const riskColumns: ColumnDef<RiskIssue>[] = [
  {
    accessorKey: "Description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="w-[250px] truncate font-medium">{row.getValue("Description")}</div>
    ),
  },
    {
    accessorKey: "Risk Status",
    header: "Status",
    id: "Status",
    cell: ({ row }) => {
      const { toast } = useToast();
      const status = statuses.find((s) => s.value === row.original["Risk Status"]);

      if (!status) return null;
      
      const handleStatusChange = async (newStatus: Status) => {
        const result = await updateField(row.original.id, 'Risk Status', newStatus);
        if(result.success){
          toast({ title: "Status Updated", description: `Status for "${row.original.Title}" updated to ${newStatus}.`});
        } else {
          toast({ variant: 'destructive', title: "Update Failed", description: "Could not update status."});
        }
      };

      const riskStatuses = statuses.filter(s => ["Open", "Closed", "Mitigated", "Transferred"].includes(s.value));

      return (
        <Select defaultValue={status.value} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {riskStatuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                <div className="flex items-center">
                   {s.icon && <s.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                   <span>{s.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original["Risk Status"]);
    },
  },
  {
    accessorKey: "Project Code",
    id: "product",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { toast } = useToast();
      const currentProduct = products.find(p => p.code === row.original["Project Code"]);

      const handleProductChange = async (newProductCode: string) => {
        const result = await updateField(row.original.id, 'Project Code', newProductCode);
        if (result.success) {
          toast({ title: "Product Updated" });
        } else {
          toast({ variant: 'destructive', title: "Update Failed"});
        }
      };
      
      if (!currentProduct) return  row.original["Project Code"];

      return (
        <Select defaultValue={currentProduct.code} onValueChange={handleProductChange}>
           <SelectTrigger className="w-[180px] h-8 text-xs truncate">
            <SelectValue placeholder="Select Product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.code}>
                {p.name} ({p.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    filterFn: (row, id, value) => {
      const product = products.find(p => p.code === row.original["Project Code"])
      return value.includes(product?.name);
    },
  },
  {
    accessorKey: "Owner",
    header: "Owner",
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("Owner") || 'N/A'}</div>,
  },
  {
    accessorKey: "DueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("DueDate");
       if (!date) return 'N/A';
      try {
        const d = (date as any)?.toDate ? (date as any).toDate() : new Date(date as string);
        return format(d, "dd/MM/yyyy");
      } catch (error) {
        return 'Invalid Date';
      }
    },
  },
  {
    accessorKey: "Probability",
    header: "Probability",
    cell: ({ row }) => {
      const prob = row.getValue("Probability") as number;
      return prob ? `${(prob * 100).toFixed(0)}%` : 'N/A';
    },
  },
  {
    accessorKey: "Imapct Rating (0.05-0.8)",
    header: "Impact",
    cell: ({ row }) => {
       const impact = row.getValue("Imapct Rating (0.05-0.8)") as number;
       return impact?.toFixed(2) ?? 'N/A';
    },
  },
   {
    accessorKey: "MitigationPlan",
    header: "Mitigation Plan",
    cell: ({ row }) => <div className="w-[150px] truncate">{row.getValue("MitigationPlan") || 'N/A'}</div>,
  },
  {
    accessorKey: "ContingencyPlan",
    header: "Contingency Plan",
    cell: ({ row }) => <div className="w-[150px] truncate">{row.getValue("ContingencyPlan") || 'N/A'}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
