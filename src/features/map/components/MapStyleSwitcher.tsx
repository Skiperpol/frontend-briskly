import { Layers } from "lucide-react"

import {
  DEFAULT_MAP_STYLE_ID,
  getMapStyle,
  MAP_STYLES,
  type MapStyleId,
} from "@/features/map/mapStyles"
import { Button } from "@/shared/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { cn } from "@/shared/lib/utils"

type MapStyleSwitcherProps = {
  value?: MapStyleId
  onChange: (styleId: MapStyleId) => void
}

export function MapStyleSwitcher({
  value = DEFAULT_MAP_STYLE_ID,
  onChange,
}: MapStyleSwitcherProps) {
  const active = getMapStyle(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2 bg-background/95 shadow-md backdrop-blur"
          aria-label="Zmień styl mapy"
        >
          <Layers className="size-4" />
          {active.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-44 p-1.5">
        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Styl mapy
        </p>
        {MAP_STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={cn(
              "flex w-full rounded-md px-2 py-2 text-left text-sm transition-colors",
              "hover:bg-muted",
              value === style.id && "bg-muted font-medium",
            )}
          >
            {style.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
