
"use client"

import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { updateRiskIssueField } from '@/app/(main)/actions';

interface EditableDateCellProps {
  initialValue: any;
  rowId: string;
  columnId: string;
}

// Helper to parse date string as UTC
const parseDateAsUTC = (dateString: string) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    // getTimezoneOffset returns the difference in minutes between UTC and local time.
    // We add this offset to the date to get the UTC date.
    return new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
};

export function EditableDateCell({ initialValue, rowId, columnId }: EditableDateCellProps) {
  const [date, setDate] = useState<Date | undefined>(() => parseDateAsUTC(initialValue));
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDate(parseDateAsUTC(initialValue));
  }, [initialValue]);

  const handleSave = async (newDate: Date | undefined) => {
    // Check against the original ISO string to see if the date actually changed
    const originalDate = initialValue ? new Date(initialValue) : undefined;
    if (newDate?.getTime() === originalDate?.getTime()) {
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
      setDate(parseDateAsUTC(initialValue)); // Revert on failure
    }
  };

  if (isSaving) {
    return <div className="flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Saving...</span></div>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className={cn(
            "w-full justify-start text-left font-normal h-8 text-xs p-2 -m-2",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
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
