
"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./view-options";
import { DataTableFacetedFilter } from "./faceted-filter";
import { statuses, priorities, riskTypes, products, issueCategories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Download, FileDown, Upload, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { importData } from "@/app/(main)/actions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { toast } = useToast();
  const [isImporting, setIsImporting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        // Simple transformation to flatten the data, but include the ID
        const flatData: {[key: string]: any} = { id: original.id };
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportExcel(file);
    }
    // Reset file input to allow re-uploading the same file
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleImportExcel = (file: File) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            if(json.length === 0) {
                toast({ variant: "destructive", title: "Import Error", description: "The selected file is empty." });
                return;
            }
            
            const result = await importData(json);

            if (result.success) {
                toast({ title: "Import Successful", description: result.message });
            } else {
                toast({ variant: "destructive", title: "Import Failed", description: result.message });
            }

        } catch (error) {
            toast({ variant: "destructive", title: "Import Error", description: "Failed to read or process the Excel file." });
            console.error(error);
        } finally {
            setIsImporting(false);
        }
    };
    reader.onerror = () => {
        toast({ variant: "destructive", title: "File Error", description: "Failed to read the file." });
        setIsImporting(false);
    };
    reader.readAsBinaryString(file);
  };

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
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect} 
            accept=".xlsx, .xls, .csv"
        />
        <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
        >
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import
        </Button>
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
