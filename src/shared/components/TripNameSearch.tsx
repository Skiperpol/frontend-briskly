import { Search } from "lucide-react"

import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

type TripNameSearchProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  id?: string
}

export function TripNameSearch({ value, onChange, className, id = "trip-search" }: TripNameSearchProps) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        type="search"
        placeholder="Szukaj wycieczki…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
        aria-label="Szukaj wycieczki po nazwie"
      />
    </div>
  )
}
