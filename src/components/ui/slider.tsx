import * as React from "react";
import { cn } from "../../lib/utils";

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value = [50],
      onValueChange,
      max = 100,
      min = 0,
      step = 1,
      className,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = React.useState(value);

    const currentValue = value || localValue;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [parseInt(e.target.value)];
      setLocalValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    const percentage = ((currentValue[0] - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute h-full bg-primary transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue[0]}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
