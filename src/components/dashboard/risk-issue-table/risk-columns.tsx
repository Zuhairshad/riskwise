
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { RiskIssue, Status, Priority } from "@/lib/types";
import { statuses, priorities } from "@/lib/data";
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
import { EditableCell } from "./editable-cell";
import { EditableDateCell } from "./editable-date-cell";


export const riskColumns: ColumnDef<RiskIssue>[] = [
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
      <EditableCell
        initialValue={row.getValue("Title")}
        rowId={row.original.id}
        columnId="Title"
      />
    ),
  },
  {
    accessorKey: "Description",
    header: "Description",
    cell: ({ row }) => (
        <EditableCell
            initialValue={row.getValue("Description")}
            rowId={row.original.id}
            columnId="Description"
            isTextarea={true}
        />
    ),
  },
  {
    accessorKey: "Risk Status",
    header: "Status",
    cell: ({ row }) => {
      const { toast } = useToast();
      const statusValue: Status = row.getValue("Risk Status");
      const status = statuses.find((s) => s.value === statusValue);

      if (!status) return null;
      
      const handleStatusChange = async (newStatus: Status) => {
        const result = await updateRiskIssueField(row.original.id, 'Risk Status', newStatus);
        if(result.success){
          toast({ title: "Status Updated", description: `Status for "${row.original.Title}" updated to ${newStatus}.`});
        } else {
          toast({ variant: 'destructive', title: "Update Failed", description: result.message});
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
    accessorKey: "ProjectName",
    header: "Project",
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
    cell: ({ row }) => (
        <EditableCell
            initialValue={row.getValue("Owner")}
            rowId={row.original.id}
            columnId="Owner"
        />
    ),
  },
  {
    accessorKey: "DueDate",
    header: "Due Date",
    cell: ({ row }) => (
        <EditableDateCell
            initialValue={row.getValue("DueDate")}
            rowId={row.original.id}
            columnId="DueDate"
        />
    )
  },
  {
    accessorKey: "Probability",
    header: "P",
    cell: ({ row }) => {
      const prob = row.getValue("Probability") as number;
      return prob ? `${(prob).toFixed(1)}` : 'N/A';
    },
  },
  {
    accessorKey: "Imapct Rating (0.05-0.8)",
    header: "I",
    cell: ({ row }) => {
       const impact = row.getValue("Imapct Rating (0.05-0.8)") as number;
       return impact?.toFixed(2) ?? 'N/A';
    },
  },
   {
    accessorKey: "MitigationPlan",
    header: "Mitigation Plan",
    cell: ({ row }) => (
        <EditableCell
            initialValue={row.getValue("MitigationPlan")}
            rowId={row.original.id}
            columnId="MitigationPlan"
            isTextarea={true}
        />
    ),
  },
  {
    accessorKey: "ContingencyPlan",
    header: "Contingency Plan",
    cell: ({ row }) => (
        <EditableCell
            initialValue={row.getValue("ContingencyPlan")}
            rowId={row.original.id}
            columnId="ContingencyPlan"
            isTextarea={true}
        />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
