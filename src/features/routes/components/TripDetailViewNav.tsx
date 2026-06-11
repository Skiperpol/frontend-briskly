import { BookOpen, CalendarDays } from "lucide-react"
import { Link } from "react-router-dom"

import { tripJournalPath, tripSchedulePath } from "@/features/routes/tripPaths"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

export type TripDetailView = "schedule" | "journal"

type TripDetailViewNavProps = {
  tripId: string
  activeView?: TripDetailView
  className?: string
}

export function TripDetailViewNav({ tripId, activeView, className }: TripDetailViewNavProps) {
  const isSchedule = activeView === "schedule"
  const isJournal = activeView === "journal"

  const navButtonClassName =
    "h-auto min-h-9 flex-1 flex-col gap-0.5 px-1 py-1.5 text-[10px] leading-tight sm:h-8 sm:flex-none sm:flex-row sm:gap-1.5 sm:px-2.5 sm:text-sm"

  return (
    <div
      className={cn(
        "flex w-full gap-0.5 rounded-lg border border-border bg-background p-0.5 sm:w-auto",
        className,
      )}
      role="group"
      aria-label="Przełącz widok podróży"
    >
      <Button
        type="button"
        size="sm"
        variant={isSchedule ? "default" : "ghost"}
        className={navButtonClassName}
        asChild
      >
        <Link
          to={tripSchedulePath(tripId)}
          aria-current={isSchedule ? "page" : undefined}
          aria-label="Harmonogram"
        >
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          <span className="sm:hidden">Harmon.</span>
          <span className="hidden sm:inline">Harmonogram</span>
        </Link>
      </Button>
      <Button
        type="button"
        size="sm"
        variant={isJournal ? "default" : "ghost"}
        className={navButtonClassName}
        asChild
      >
        <Link
          to={tripJournalPath(tripId)}
          aria-current={isJournal ? "page" : undefined}
          aria-label="Dziennik"
        >
          <BookOpen className="size-4 shrink-0" aria-hidden />
          Dziennik
        </Link>
      </Button>
    </div>
  )
}
