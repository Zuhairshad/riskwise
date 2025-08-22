
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "./input"

interface ComboboxProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search option...",
  notFoundText = "No option found.",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "")
  const [filteredOptions, setFilteredOptions] = React.useState(options);

  React.useEffect(() => {
    // When the form value changes externally, update the input
    const displayLabel = options.find(option => option.value === value)?.label || value;
    setInputValue(displayLabel)
  }, [value, options])

  React.useEffect(() => {
    setFilteredOptions(options);
  }, [options])


  const handleSelect = (currentValue: string) => {
    const selectedOption = options.find(option => option.value.toLowerCase() === currentValue.toLowerCase());
    const newValue = selectedOption ? selectedOption.value : currentValue;
    onChange(newValue)
    const displayLabel = selectedOption ? selectedOption.label : newValue;
    setInputValue(displayLabel);
    setOpen(false)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const manualInput = event.target.value
    setInputValue(manualInput) // Display what user types
    
    const matchedOption = options.find(option => option.label.toLowerCase() === manualInput.toLowerCase());
    if (matchedOption) {
        onChange(matchedOption.value);
    } else {
        onChange(manualInput); // Allow free text entry
    }
  }

  const getDisplayLabel = () => {
    const option = options.find(option => option.value === value);
    return option ? option.label : value;
  }
  
  const onCommandFilter = (val: string, search: string) => {
    const option = options.find(o => o.value === val);
    if (option) {
        if (option.label.toLowerCase().includes(search.toLowerCase())) return 1;
        if (option.value.toLowerCase().includes(search.toLowerCase())) return 1;
    }
    return 0;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
            >
              <span className="truncate">{value ? getDisplayLabel() : placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command filter={onCommandFilter}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{notFoundText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
