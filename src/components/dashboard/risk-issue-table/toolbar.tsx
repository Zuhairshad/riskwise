
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

  const tableId = (table.options.meta as any)?.tableId;
  let statusOptions = statuses;
  
  if (tableId === 'risks') {
    statusOptions = statuses.filter(s => ["Open", "Closed", "Mitigated", "Transferred"].includes(s.value));
  } else if (tableId === 'issues') {
    statusOptions = statuses.filter(s => ["Open", "Resolved", "Escalated", "Closed"].includes(s.value));
  }
  
  const filterColumn = table.getColumn("Title") ? "Title" : "Description";
  const statusColumn = table.getColumn("Risk Status") || table.getColumn("Status");
  const priorityColumn = table.getColumn("Priority");


  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Filter by ${filterColumn.toLowerCase()}...`}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {tableId === 'all' && table.getColumn("type") && (
          <DataTableFacetedFilter
            column={table.getColumn("type")}
            title="Type"
            options={riskTypes}
          />
        )}
        {statusColumn && (
          <DataTableFacetedFilter
            column={statusColumn}
            title="Status"
            options={statusOptions}
          />
        )}
        {priorityColumn && (
          <DataTableFacetedFilter
            column={priorityColumn}
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
        {tableId === 'issues' && table.getColumn("Category New") && (
          <DataTableFacetedFilter
            column={table.getColumn("Category New")}
            title="Category"
            options={issueCategories}
          />
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
