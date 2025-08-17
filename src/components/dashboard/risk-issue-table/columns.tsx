
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
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
  // Here you would connect to your backend to update the database
  // Example: await fetch(`/api/risks/${id}`, { method: 'PATCH', body: JSON.stringify({ [field]: value }) });
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real app, you might want to return the updated item
  return { success: true };
}

export const columns: ColumnDef<RiskIssue>[] = [
  {
    accessorKey: "Title",
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
      <div className="w-[250px] truncate font-medium">{row.getValue("Title")}</div>
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
          toast({ title: "Type Updated", description: `Type for "${row.original.Title}" updated to ${newType}.`});
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
    accessorKey: "Status",
    header: "Status",
    cell: ({ row }) => {
      const { toast } = useToast();
      const statusValue = row.original.Status || row.original["Risk Status"];
      const status = statuses.find((s) => s.value === statusValue);

      if (!status) return null;
      
      const handleStatusChange = async (newStatus: Status) => {
        const fieldToUpdate = row.original.type === 'Risk' ? 'Risk Status' : 'Status';
        const result = await updateField(row.original.id, fieldToUpdate, newStatus);
        if(result.success){
          toast({ title: "Status Updated", description: `Status for "${row.original.Title}" updated to ${newStatus}.`});
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
      const statusValue = row.original.Status || row.original["Risk Status"];
      return value.includes(statusValue);
    },
  },
  {
    accessorKey: "Priority",
    header: "Priority",
    cell: ({ row }) => {
       const { toast } = useToast();
      const priority = priorities.find((p) => p.value === row.getValue("Priority"));
      if (!priority) return null;

      const handlePriorityChange = async (newPriority: Priority) => {
        const result = await updateField(row.original.id, 'Priority', newPriority);
        if (result.success) {
          toast({ title: "Priority Updated", description: `Priority for "${row.original.Title}" updated to ${newPriority}.`});
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
        const fieldToUpdate = row.original.type === 'Risk' ? 'Project Code' : 'ProjectName';
        const newValue = products.find(p => p.id === newProductId)?.[row.original.type === 'Risk' ? 'code' : 'name'];
        const result = await updateField(row.original.id, fieldToUpdate, newValue);
        if (result.success) {
          toast({ title: "Product Updated" });
        } else {
          toast({ variant: 'destructive', title: "Update Failed"});
        }
      };
      
      return (
        <Select defaultValue={currentProduct?.id} onValueChange={handleProductChange}>
           <SelectTrigger className="w-[180px] h-8 text-xs truncate">
            <SelectValue placeholder="Select Product" />
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
      return value.includes(row.original.product?.name);
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
      const date = row.getValue("DueDate") || row.original["Due Date"];
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
      return row.original.type === 'Risk' && prob ? `${(prob * 100).toFixed(0)}%` : 'N/A';
    },
  },
  {
    accessorKey: "Impact",
    header: "Impact",
    cell: ({ row }) => {
       if (row.original.type === 'Risk') {
         const impactRating = row.original["Imapct Rating (0.05-0.8)"];
         return impactRating?.toFixed(2) ?? 'N/A';
       }
       return row.original.Impact ?? 'N/A';
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
