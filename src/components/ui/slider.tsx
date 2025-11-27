"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ min, max, step = 1, value, onValueChange, className }, ref) => {
    const [localValue, setLocalValue] = React.useState(value[0]);

    React.useEffect(() => {
      setLocalValue(value[0]);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setLocalValue(newValue);
      onValueChange([newValue]);
    };

    const percentage = ((localValue - min) / (max - min)) * 100;

    return (
      <div ref={ref} className={cn("relative w-full", className)}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
          style={{
            background: `linear-gradient(to right, rgb(5 150 105) 0%, rgb(5 150 105) ${percentage}%, rgb(226 232 240) ${percentage}%, rgb(226 232 240) 100%)`,
          }}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };

