
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { RiskIssue, Status, Priority } from "@/lib/types";
import { statuses, priorities, issueCategories } from "@/lib/data";
import { DataTableRowActions } from "./row-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateRiskIssueField } from "@/app/(main)/actions";


export const issueColumns: ColumnDef<RiskIssue>[] = [
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
      <div className="w-[200px] truncate font-medium">{row.getValue("Title")}</div>
    ),
  },
  {
    accessorKey: "Discussion",
    header: "Discussion",
    cell: ({ row }) => (
      <div className="w-[250px] truncate">{row.getValue("Discussion")}</div>
    )
  },
  {
    accessorKey: "Resolution",
    header: "Resolution",
    cell: ({ row }) => (
      <div className="w-[250px] truncate">{row.getValue("Resolution")}</div>
    )
  },
  {
    accessorKey: "Status",
    header: "Status",
    cell: ({ row }) => {
      const { toast } = useToast();
      const status = statuses.find((s) => s.value === row.getValue("Status"));

      if (!status) return null;
      
      const handleStatusChange = async (newStatus: Status) => {
        const result = await updateRiskIssueField(row.original.id, 'Status', newStatus);
        if(result.success){
          toast({ title: "Status Updated", description: `Status for "${row.original.Title}" updated to ${newStatus}.`});
        } else {
          toast({ variant: 'destructive', title: "Update Failed", description: result.message});
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
    accessorKey: "Priority",
    header: "Priority",
    cell: ({ row }) => {
       const { toast } = useToast();
      const priority = priorities.find((p) => p.value === row.getValue("Priority"));
      if (!priority) return null;

      const handlePriorityChange = async (newPriority: Priority) => {
        const result = await updateRiskIssueField(row.original.id, 'Priority', newPriority);
        if (result.success) {
          toast({ title: "Priority Updated", description: `Priority for "${row.original.Title}" updated to ${newPriority}.`});
        } else {
          toast({ variant: 'destructive', title: "Update Failed", description: result.message});
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
    accessorKey: "ProjectName",
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
        return <div className="w-[180px] truncate">{row.original.ProjectName}</div>;
      },
    filterFn: (row, id, value) => {
      return value.includes(row.original.ProjectName);
    },
  },
  {
    accessorKey: "Owner",
    header: "Owner",
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("Owner") || 'N/A'}</div>,
  },
  {
    accessorKey: "Due Date",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("Due Date");
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
    accessorKey: "Impact",
    header: "Impact",
    cell: ({ row }) => {
       return row.original.Impact ?? 'N/A';
    },
  },
  {
    accessorKey: "Category New",
    header: "Category",
    cell: ({ row }) => {
        const { toast } = useToast();
       const category = issueCategories.find((c) => c.value === row.original["Category New"]);
       if (!category) return null;
 
       const handleCategoryChange = async (newCategory: string) => {
         const result = await updateRiskIssueField(row.original.id, 'Category New', newCategory);
         if (result.success) {
           toast({ title: "Category Updated" });
         } else {
           toast({ variant: 'destructive', title: "Update Failed", description: result.message});
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
        return value.includes(row.original["Category New"]);
      },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
