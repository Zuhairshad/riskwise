
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pen, Trash2 } from "lucide-react";
import type { RiskIssue, Status, Priority, RiskType } from "@/lib/types";
import { statuses, priorities, riskTypes, products } from "@/lib/data";
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
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real app, you might want to return the updated item
  return { success: true };
}

export const columns: ColumnDef<RiskIssue>[] = [
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const { toast } = useToast();
      const type = riskTypes.find((t) => t.value === row.getValue("type"));
      if (!type) return null;

      const handleTypeChange = async (newType: RiskType) => {
        const result = await updateField(row.original.id, 'type', newType);
        if (result.success) {
          toast({ title: "Type Updated", description: `Type for "${row.original.title}" updated to ${newType}.`});
        } else {
          toast({ variant: 'destructive', title: "Update Failed", description: "Could not update type."});
        }
      };

      return (
        <Select defaultValue={type.value} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {riskTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <div className="flex items-center">
                   {t.icon && <t.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                   <span>{t.label}</span>
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { toast } = useToast();
      const status = statuses.find((s) => s.value === row.getValue("status"));

      if (!status) return null;
      
      const handleStatusChange = async (newStatus: Status) => {
        const result = await updateField(row.original.id, 'status', newStatus);
        if(result.success){
          toast({ title: "Status Updated", description: `Status for "${row.original.title}" updated to ${newStatus}.`});
        } else {
          toast({ variant: 'destructive', title: "Update Failed", description: "Could not update status."});
        }
      };

      return (
        <Select defaultValue={status.value} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
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
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
       const { toast } = useToast();
      const priority = priorities.find((p) => p.value === row.getValue("priority"));
      if (!priority) return null;

      const handlePriorityChange = async (newPriority: Priority) => {
        const result = await updateField(row.original.id, 'priority', newPriority);
        if (result.success) {
          toast({ title: "Priority Updated", description: `Priority for "${row.original.title}" updated to ${newPriority}.`});
        } else {
          toast({ variant: 'destructive', title: "Update Failed", description: "Could not update priority."});
        }
      };

      return (
        <Select defaultValue={priority.value} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                <div className="flex items-center">
                   {p.icon && <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                   <span>{p.label}</span>
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
    accessorKey: "product.name",
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
      const currentProduct = row.original.product;

      const handleProductChange = async (newProductId: string) => {
        const result = await updateField(row.original.id, 'product', newProductId);
        if (result.success) {
          toast({ title: "Product Updated" });
        } else {
          toast({ variant: 'destructive', title: "Update Failed"});
        }
      };
      
      return (
        <Select defaultValue={currentProduct.id} onValueChange={handleProductChange}>
           <SelectTrigger className="w-[180px] h-8 text-xs truncate">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("owner")}</div>,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("dueDate");
      return date ? new Date(date as string).toLocaleDateString() : 'N/A';
    },
  },
  {
    accessorKey: "probability",
    header: "Probability",
    cell: ({ row }) => {
      const prob = row.getValue("probability") as number;
      return row.original.type === 'Risk' ? `${(prob * 100).toFixed(0)}%` : 'N/A';
    },
  },
  {
    accessorKey: "impactRating",
    header: "Impact",
    cell: ({ row }) => {
       if (row.original.type === 'Risk') {
         return row.original.impactRating?.toFixed(2) ?? 'N/A';
       }
       return row.original.impact ?? 'N/A';
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
