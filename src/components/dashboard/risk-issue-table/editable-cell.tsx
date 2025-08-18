
"use client"

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateRiskIssueField } from '@/app/(main)/actions';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface EditableCellProps {
  initialValue: any;
  rowId: string;
  columnId: string;
  isTextarea?: boolean;
}

export function EditableCell({ initialValue, rowId, columnId, isTextarea = false }: EditableCellProps) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    const result = await updateRiskIssueField(rowId, columnId, value);
    setIsSaving(false);

    if (result.success) {
      toast({ title: "Update Successful", description: `${columnId} has been updated.` });
    } else {
      toast({ variant: 'destructive', title: "Update Failed", description: result.message });
      setValue(initialValue); // Revert on failure
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTextarea) {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isSaving) {
    return <div className="flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Saving...</span></div>;
  }
  
  if (isEditing) {
    if (isTextarea) {
        return (
            <Textarea
              value={value || ''}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="min-h-[100px]"
            />
          );
    }
    return (
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className="h-8"
      />
    );
  }

  return (
    <div 
        className="w-full h-full min-h-[2rem] p-2 -m-2 cursor-pointer truncate" 
        onClick={() => setIsEditing(true)}
        title={value}
    >
      {value || <span className="text-muted-foreground">N/A</span>}
    </div>
  );
}
