import * as React from "react"

import { cn } from "@/shared/lib/utils"

type SliderProps = Omit<React.ComponentProps<"input">, "type"> & {
  label?: string
  valueLabel?: string
}

function Slider({ className, label, valueLabel, ...props }: SliderProps) {
  return (
    <div className="space-y-2">
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-muted-foreground">{label}</span>}
          {valueLabel && <span className="font-semibold text-foreground">{valueLabel}</span>}
        </div>
      )}
      <input
        type="range"
        className={cn(
          "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary",
          className,
        )}
        {...props}
      />
    </div>
  )
}

export { Slider }
