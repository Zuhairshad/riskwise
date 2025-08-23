
"use client"

import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { updateRiskIssueField } from '@/app/(main)/actions';

interface EditableDateCellProps {
  initialValue: any;
  rowId: string;
  columnId: string;
}

const parseDate = (dateString: string | Date | undefined): Date | undefined => {
    if (!dateString) return undefined;
    if (dateString instanceof Date && isValid(dateString)) return dateString;
    if (typeof dateString === 'string') {
        const date = parseISO(dateString);
        if (isValid(date)) return date;
    }
    return undefined;
}


export function EditableDateCell({ initialValue, rowId, columnId }: EditableDateCellProps) {
  const [date, setDate] = useState<Date | undefined>(() => parseDate(initialValue));
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDate(parseDate(initialValue));
  }, [initialValue]);

  const handleSave = async (newDate: Date | undefined) => {
    // This check is important to prevent re-saving the same date
    if (date?.getTime() === newDate?.getTime()) {
      return;
    }
    
    setDate(newDate);
    setIsSaving(true);
    const result = await updateRiskIssueField(rowId, columnId, newDate);
    setIsSaving(false);

    if (result.success) {
      toast({ title: "Update Successful", description: `${columnId} has been updated.` });
    } else {
      toast({ variant: 'destructive', title: "Update Failed", description: result.message });
      setDate(parseDate(initialValue)); // Revert on failure
    }
  };

  if (isSaving) {
    return <div className="flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Saving...</span></div>;
  }
  
  const isDateValid = date && isValid(date);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className={cn(
            "w-full justify-start text-left font-normal h-8 text-xs p-2 -m-2",
            !isDateValid && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isDateValid ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSave}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
