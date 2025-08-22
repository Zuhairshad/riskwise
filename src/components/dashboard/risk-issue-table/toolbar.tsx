
"use client";

import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./view-options";
import { DataTableFacetedFilter } from "./faceted-filter";
import { statuses, priorities, riskTypes, products, issueCategories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import * as XLSX from 'xlsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

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
  const statusColumn = table.getColumn("Status");
  const priorityColumn = table.getColumn("Priority");
  const productColumn = table.getColumn("ProjectName") || table.getColumn("Project Code");

  const handleExportExcel = () => {
    const dataToExport = table.getFilteredRowModel().rows.map(row => {
        const original = row.original as any;
        // Simple transformation to flatten the data
        const flatData: {[key: string]: any} = {};
        for (const key in original) {
            if (typeof original[key] !== 'object' || original[key] === null) {
                flatData[key] = original[key];
            } else if (key === 'product') {
                flatData['productName'] = original[key].name;
                flatData['productCode'] = original[key].code;
            }
        }
        return flatData;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `RiskWise_Export_${tableId}.xlsx`);
  }

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
        {productColumn && (
          <DataTableFacetedFilter
            column={productColumn}
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
      <div className="flex items-center gap-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>
                    Export to Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    Export to PDF (coming soon)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
