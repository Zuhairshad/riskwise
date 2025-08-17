"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { RiskIssue, Status, Priority } from "@/lib/types";
import { statuses, priorities, products } from "@/lib/data";
import { DataTableRowActions } from "./row-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


// This is a mock update function. In a real app, this would be an API call.
async function updateField(id: string, field: string, value: any) {
  console.log(`Updating ${field} for item ${id} to ${value}`);
  // Here you would connect to your backend to update the database
  // Example: await fetch(`/api/risks/${id}`, { method: 'PATCH', body: JSON.stringify({ [field]: value }) });
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real app, you might want to return the updated item
  return { success: true };
}

export const riskColumns: ColumnDef<RiskIssue>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="w-[250px] truncate font-medium">{row.getValue("title")}</div>
    ),
  },
    {
    accessorKey: "riskStatus",
    header: "Status",
    cell: ({ row }) => {
      const { toast } = useToast();
      const status = statuses.find((s) => s.value === row.getValue("riskStatus"));

      if (!status) return null;
      
      const handleStatusChange = async (newStatus: Status) => {
        const result = await updateField(row.original.id, 'riskStatus', newStatus);
        if(result.success){
          toast({ title: "Status Updated", description: `Status for "${row.original.title}" updated to ${newStatus}.`});
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
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "projectCode",
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
      const currentProduct = products.find(p => p.code === row.original.projectCode);

      const handleProductChange = async (newProductCode: string) => {
        const result = await updateField(row.original.id, 'projectCode', newProductCode);
        if (result.success) {
          toast({ title: "Product Updated" });
        } else {
          toast({ variant: 'destructive', title: "Update Failed"});
        }
      };
      
      if (!currentProduct) return  row.original.projectCode;

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
      const product = products.find(p => p.code === row.original.projectCode)
      return value.includes(product?.name);
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("owner") || 'N/A'}</div>,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("dueDate");
      try {
        const d = (date as any)?.toDate ? (date as any).toDate() : new Date(date as string);
        return date ? format(d, "dd/MM/yyyy") : 'N/A';
      } catch (error) {
        if (date && typeof (date as any).toDate === 'function') {
          return format((date as any).toDate(), "dd/MM/yyyy");
        }
        return 'Invalid Date';
      }
    },
  },
  {
    accessorKey: "probability",
    header: "Probability",
    cell: ({ row }) => {
      const prob = row.getValue("probability") as number;
      return `${(prob * 100).toFixed(0)}%`;
    },
  },
  {
    accessorKey: "impactRating",
    header: "Impact",
    cell: ({ row }) => {
       return row.original.impactRating?.toFixed(2) ?? 'N/A';
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
