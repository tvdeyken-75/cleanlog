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
import { licensePlateAutocomplete } from "@/ai/flows/license-plate-autocomplete"
import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "../ui/input"

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  existingPlates: string[];
  placeholder?: string;
}

export function AutocompleteInput({ value, onChange, existingPlates, placeholder }: AutocompleteInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);
  
  React.useEffect(() => {
    if (debouncedInputValue) {
      setIsLoading(true);
      licensePlateAutocomplete({
        partialLicensePlate: debouncedInputValue,
        existingLicensePlates: existingPlates,
      }).then((result) => {
        setSuggestions(result.suggestions);
        setIsLoading(false);
      });
    } else {
      setSuggestions([]);
    }
  }, [debouncedInputValue, existingPlates]);

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    onChange(newValue);
    setInputValue(newValue);
    setOpen(false);
  };
  
  const allOptions = React.useMemo(() => {
    const combined = [...suggestions, ...existingPlates.filter(p => !suggestions.includes(p))];
    return [...new Set(combined)].sort();
  }, [suggestions, existingPlates]);


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(e.target.value);
              if(!open) setOpen(true);
            }}
            placeholder={placeholder}
            className="pr-10"
            role="combobox"
            aria-expanded={open}
          />
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="absolute inset-y-0 right-0 px-3"
            onClick={() => setOpen(!open)}
          >
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandList>
            {isLoading && <CommandEmpty>Wird geladen...</CommandEmpty>}
            {!isLoading && allOptions.length === 0 && <CommandEmpty>Keine Kennzeichen gefunden.</CommandEmpty>}
            <CommandGroup>
              {allOptions.filter(p => p.toLowerCase().includes(inputValue.toLowerCase())).map((plate) => (
                <CommandItem
                  key={plate}
                  value={plate}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === plate ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {plate}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
