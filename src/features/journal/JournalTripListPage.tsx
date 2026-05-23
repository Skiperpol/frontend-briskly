import { Link } from "react-router-dom"
import { BookOpen, ChevronRight } from "lucide-react"

import type { UserTrip } from "@/domain/models"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { TopBar } from "@/shared/components/layout/TopBar"
import { useTripData } from "@/shared/hooks/useTripData"
import { cn } from "@/shared/lib/utils"

function formatTripDate(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function JournalTripListPage() {
  const { journalTrips } = useTripData()

  return (
    <>
      <TopBar
        title="Dziennik"
        subtitle="Wybierz podróż, aby zobaczyć i edytować wspomnienia"
      />
      <ScrollArea className="flex-1">
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
          {journalTrips.map((trip) => (
            <JournalTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </ScrollArea>
    </>
  )
}

function JournalTripCard({ trip }: { trip: UserTrip }) {
  const entryCount = trip.journalEntries.length
  const entryLabel =
    entryCount === 1
      ? "1 wpis"
      : entryCount < 5
        ? `${entryCount} wpisy`
        : `${entryCount} wpisów`

  return (
    <Link to={`/journal/${trip.id}`} className="block h-full">
      <Card className="flex h-full flex-col overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div
          className="h-36 shrink-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${trip.heroImageUrl})` }}
        />
        <CardContent className="flex flex-1 flex-col p-4">
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-muted-foreground">{trip.location}</p>
                <h3 className="font-semibold leading-tight">{trip.name}</h3>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{trip.description}</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-start gap-2">
            <TripStatusBadge finalized={trip.isFinalized} />
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <BookOpen className="size-3" />
              {entryLabel}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {formatTripDate(trip.startDate)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function TripStatusBadge({ finalized }: { finalized: boolean }) {
  return (
    <Badge
      className={cn(
        "border-transparent text-[10px]",
        finalized
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
      )}
    >
      {finalized ? "Zakończona" : "W trakcie"}
    </Badge>
  )
}
