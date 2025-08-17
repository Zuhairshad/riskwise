
"use client";

import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./view-options";
import { DataTableFacetedFilter } from "./faceted-filter";
import { statuses, priorities, riskTypes, products, issueCategories } from "@/lib/data";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const productOptions = products.map((product) => ({
    label: product.name,
    value: product.name,
  }));

  let statusOptions = statuses;
  // This logic is a bit of a hack to determine which statuses to show
  // based on the available columns. A better approach might be to pass the
  // tableId and filter the statuses based on that.
  if (table.getColumn("riskStatus")) {
    statusOptions = statuses.filter(s => ["Open", "Closed", "Mitigated", "Transferred"].includes(s.value));
  } else if (table.getColumn("issueStatus")) {
    statusOptions = statuses.filter(s => ["Open", "Resolved", "Escalated", "Closed"].includes(s.value));
  }


  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("type") && (
          <DataTableFacetedFilter
            column={table.getColumn("type")}
            title="Type"
            options={riskTypes}
          />
        )}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statusOptions}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )}
        {table.getColumn("product") && (
          <DataTableFacetedFilter
            column={table.getColumn("product")}
            title="Product"
            options={productOptions}
          />
        )}
        {table.getColumn("category") && (
          <DataTableFacetedFilter
            column={table.getColumn("category")}
            title="Category"
            options={issueCategories}
          />
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
