import { BookOpen, CalendarDays } from "lucide-react"
import { Link } from "react-router-dom"

import { tripJournalPath, tripSchedulePath } from "@/features/routes/tripPaths"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

export type TripDetailView = "schedule" | "journal"

type TripDetailViewNavProps = {
  tripId: string
  /** Brak wartości — żaden widok nie jest podświetlony (np. mapa globalna). */
  activeView?: TripDetailView
  className?: string
}

export function TripDetailViewNav({ tripId, activeView, className }: TripDetailViewNavProps) {
  const isSchedule = activeView === "schedule"
  const isJournal = activeView === "journal"

  return (
    <div
      className={cn(
        "flex gap-0.5 rounded-lg border border-border bg-background p-0.5",
        className,
      )}
      role="group"
      aria-label="Przełącz widok podróży"
    >
      <Button
        type="button"
        size="sm"
        variant={isSchedule ? "default" : "ghost"}
        className="h-8 gap-1.5 px-2.5"
        asChild
      >
        <Link
          to={tripSchedulePath(tripId)}
          aria-current={isSchedule ? "page" : undefined}
          aria-label="Harmonogram"
        >
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Harmonogram</span>
        </Link>
      </Button>
      <Button
        type="button"
        size="sm"
        variant={isJournal ? "default" : "ghost"}
        className={cn(
          "h-8 gap-1.5 px-2.5",
          isJournal &&
            "border-transparent bg-sky-400 text-white hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400",
          !isJournal &&
            "hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950 dark:hover:text-sky-300",
        )}
        asChild
      >
        <Link
          to={tripJournalPath(tripId)}
          aria-current={isJournal ? "page" : undefined}
          aria-label="Dziennik"
        >
          <BookOpen className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Dziennik</span>
        </Link>
      </Button>
    </div>
  )
}
