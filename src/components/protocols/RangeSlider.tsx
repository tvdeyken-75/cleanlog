
"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type RangeSliderProps = {
  className?: string;
  value?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function RangeSlider({
  className,
  value = [0, 10],
  onValueChange,
  ...props
}: RangeSliderProps) {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    const rangeValue: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(rangeValue);
    if (onValueChange) {
      onValueChange(rangeValue);
    }
  };
  
  return (
    <div className={cn("grid gap-2", className)}>
        <div className="flex justify-between text-sm text-muted-foreground">
            <span>{localValue[0]}°C</span>
            <span>{localValue[1]}°C</span>
        </div>
        <Slider
            value={localValue}
            onValueChange={handleValueChange}
            {...props}
        />
    </div>
  );
}
