
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { RiskIssue, Status, Priority } from "@/lib/types";
import { statuses, priorities, products, issueCategories } from "@/lib/data";
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

export const issueColumns: ColumnDef<RiskIssue>[] = [
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
    accessorKey: "status",
    id: "issueStatus",
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

      const issueStatuses = statuses.filter(s => ["Open", "Resolved", "Escalated", "Closed"].includes(s.value));


      return (
        <Select defaultValue={status.value} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {issueStatuses.map((s) => (
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
    accessorKey: "projectName",
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
        const currentProduct = products.find(p => p.name === row.original.projectName);
  
        const handleProductChange = async (newProductName: string) => {
          const result = await updateField(row.original.id, 'projectName', newProductName);
          if (result.success) {
            toast({ title: "Product Updated" });
          } else {
            toast({ variant: 'destructive', title: "Update Failed"});
          }
        };
        
        if (!currentProduct) return  row.original.projectName;
  
        return (
          <Select defaultValue={currentProduct.name} onValueChange={handleProductChange}>
             <SelectTrigger className="w-[180px] h-8 text-xs truncate">
              <SelectValue placeholder="Select Product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name} ({p.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    filterFn: (row, id, value) => {
      return value.includes(row.original.projectName);
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
    accessorKey: "impact",
    header: "Impact",
    cell: ({ row }) => {
       return row.original.impact ?? 'N/A';
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
        const { toast } = useToast();
       const category = issueCategories.find((c) => c.value === row.getValue("category"));
       if (!category) return null;
 
       const handleCategoryChange = async (newCategory: string) => {
         const result = await updateField(row.original.id, 'category', newCategory);
         if (result.success) {
           toast({ title: "Category Updated" });
         } else {
           toast({ variant: 'destructive', title: "Update Failed"});
         }
       };
 
       return (
         <Select defaultValue={category.value} onValueChange={handleCategoryChange}>
           <SelectTrigger className="w-[120px] h-8 text-xs">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             {issueCategories.map((c) => (
               <SelectItem key={c.value} value={c.value}>
                 <div className="flex items-center">
                    {c.icon && <c.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{c.label}</span>
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
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
