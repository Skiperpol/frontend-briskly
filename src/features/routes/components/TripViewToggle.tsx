import { LayoutGrid, List } from "lucide-react"

import type { TripViewMode } from "@/features/routes/types"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type TripViewToggleProps = {
  view: TripViewMode
  onViewChange: (view: TripViewMode) => void
  className?: string
}

export function TripViewToggle({ view, onViewChange, className }: TripViewToggleProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-0.5 rounded-lg border border-border bg-background p-0.5 sm:w-auto",
        className,
      )}
      role="group"
      aria-label="Tryb wyświetlania tras"
    >
      <Button
        type="button"
        size="sm"
        variant={view === "grid" ? "default" : "ghost"}
        className="h-8 flex-1 gap-1.5 px-2.5 sm:flex-none"
        onClick={() => onViewChange("grid")}
        aria-pressed={view === "grid"}
      >
        <LayoutGrid className="size-4" />
        <span className="hidden sm:inline">Siatka</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant={view === "list" ? "default" : "ghost"}
        className="h-8 flex-1 gap-1.5 px-2.5 sm:flex-none"
        onClick={() => onViewChange("list")}
        aria-pressed={view === "list"}
      >
        <List className="size-4" />
        <span className="hidden sm:inline">Lista</span>
      </Button>
    </div>
  )
}
