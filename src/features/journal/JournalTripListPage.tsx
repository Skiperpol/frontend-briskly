import { Link } from "react-router-dom"
import { BookOpen, ChevronRight, Download } from "lucide-react"

import type { UserTrip } from "@/domain/models"
import { exportJournalTrip } from "@/features/journal/journalUtils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { PageLayout } from "@/shared/components/layout/PageLayout"
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
    <PageLayout
      title="Dziennik"
      subtitle="Wybierz podróż, aby zobaczyć i edytować wspomnienia"
    >
      <ScrollArea className="flex-1">
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
          {journalTrips.map((trip) => (
            <JournalTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </ScrollArea>
    </PageLayout>
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
    <Card className="relative flex h-full flex-col overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="absolute top-3 right-3 z-10 gap-1.5 bg-background/95 shadow-sm backdrop-blur-sm hover:bg-background"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          exportJournalTrip(trip)
        }}
      >
        <Download className="size-3.5" />
        Eksportuj
      </Button>
      <Link to={`/journal/${trip.id}`} className="flex min-h-0 flex-1 flex-col">
        <div
          className="h-36 shrink-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${trip.heroImageUrl})` }}
        />
        <CardContent className="flex flex-1 flex-col p-4">
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2 pr-20">
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
      </Link>
    </Card>
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
