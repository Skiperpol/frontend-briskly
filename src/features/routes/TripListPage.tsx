import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { BookOpen, CalendarDays, Download } from "lucide-react"

import type { UserTrip } from "@/domain/models"
import { exportJournalTripPdf } from "@/features/journal/journalUtils"
import { TripViewToggle } from "@/features/routes/components/TripViewToggle"
import { tripJournalPath, tripSchedulePath } from "@/features/routes/tripPaths"
import type { TripViewMode } from "@/features/routes/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { TripNameSearch } from "@/shared/components/TripNameSearch"
import { useTripData } from "@/shared/hooks/useTripData"
import { filterTripsByName, normalizeTripSearchQuery } from "@/shared/lib/tripSearch"
import { cn } from "@/shared/lib/utils"

function formatTripDate(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatEntryCount(count: number): string {
  if (count === 1) return "1 wpis"
  if (count < 5) return `${count} wpisy`
  return `${count} wpisów`
}

function formatTripDescriptionPreview(description: string): string {
  const text = description.trim()
  if (!text) return ""

  const sentences =
    text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ??
    []

  if (sentences.length === 0) return text
  if (sentences.length <= 2) return sentences.join(" ")

  const second = sentences[1]!.replace(/[.!?]+\s*$/, "")
  return `${sentences[0]} ${second}...`
}

export function TripListPage() {
  const { journalTrips, loading, error } = useTripData()
  const [view, setView] = useState<TripViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [exportingTripId, setExportingTripId] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const filteredTrips = useMemo(
    () => filterTripsByName(journalTrips, searchQuery),
    [journalTrips, searchQuery],
  )

  const { inProgressTrips, completedTrips } = useMemo(() => {
    const inProgress: UserTrip[] = []
    const completed: UserTrip[] = []

    for (const trip of filteredTrips) {
      if (trip.isFinalized) {
        completed.push(trip)
      } else {
        inProgress.push(trip)
      }
    }

    return { inProgressTrips: inProgress, completedTrips: completed }
  }, [filteredTrips])

  const hasSearch = normalizeTripSearchQuery(searchQuery).length > 0
  const hasResults = inProgressTrips.length > 0 || completedTrips.length > 0

  const handleExportTrip = (trip: UserTrip) => {
    setExportError(null)
    setExportingTripId(trip.id)
    void exportJournalTripPdf(trip)
      .catch((err) => {
        setExportError(err instanceof Error ? err.message : "Nie udało się wygenerować PDF.")
      })
      .finally(() => setExportingTripId(null))
  }

  return (
    <PageLayout
      title="Trasy"
      subtitle="Twoje podróże — przejdź do dziennika lub harmonogramu"
      trailing={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <TripNameSearch
            id="routes-trip-search"
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:w-56"
          />
          <TripViewToggle view={view} onViewChange={setView} />
        </div>
      }
    >
      <ScrollArea className="flex-1">
        <div className="space-y-10 p-6">
          {loading && (
            <p className="text-center text-sm text-muted-foreground">Ładowanie podróży…</p>
          )}
          {(error || exportError) && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {exportError ?? error}
            </p>
          )}
          {!loading && !hasResults && (
            <p className="text-center text-sm text-muted-foreground">
              {hasSearch
                ? "Brak wycieczek pasujących do wyszukiwania."
                : "Brak wycieczek do wyświetlenia."}
            </p>
          )}
          {inProgressTrips.length > 0 && (
            <TripSection
              title="W trakcie"
              trips={inProgressTrips}
              view={view}
              exportingTripId={exportingTripId}
              onExport={handleExportTrip}
            />
          )}
          {completedTrips.length > 0 && (
            <TripSection
              title="Zakończone"
              trips={completedTrips}
              view={view}
              exportingTripId={exportingTripId}
              onExport={handleExportTrip}
            />
          )}
        </div>
      </ScrollArea>
    </PageLayout>
  )
}

function TripSection({
  title,
  trips,
  view,
  exportingTripId,
  onExport,
}: {
  title: string
  trips: UserTrip[]
  view: TripViewMode
  exportingTripId: string | null
  onExport: (trip: UserTrip) => void
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <TripGridCard
              key={trip.id}
              trip={trip}
              exporting={exportingTripId === trip.id}
              onExport={() => onExport(trip)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {trips.map((trip) => (
            <TripListRow
              key={trip.id}
              trip={trip}
              exporting={exportingTripId === trip.id}
              onExport={() => onExport(trip)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function TripBadges({ trip }: { trip: UserTrip }) {
  const entryCount = trip.journalEntryCount

  return (
    <>
      <TripStatusBadge finalized={trip.isFinalized} />
      <Badge variant="secondary" className="gap-1 text-[10px]">
        <BookOpen className="size-3" />
        {formatEntryCount(entryCount)}
      </Badge>
      <Badge variant="outline" className="border-background/20 bg-background/90 text-[10px] backdrop-blur-sm">
        {formatTripDate(trip.startDate)}
      </Badge>
    </>
  )
}

function TripGridCard({
  trip,
  exporting,
  onExport,
}: {
  trip: UserTrip
  exporting: boolean
  onExport: () => void
}) {
  return (
    <Card className="relative flex h-64 w-full flex-col gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <div className="absolute top-2.5 right-2.5 z-10 flex max-w-[calc(100%-1.25rem)] flex-wrap justify-end gap-1">
        <TripBadges trip={trip} />
      </div>
      <div
        className="h-32 shrink-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${trip.heroImageUrl})` }}
        role="img"
        aria-label={trip.name}
      />
      <CardContent className="flex min-h-0 flex-1 flex-col p-2.5">
        <div className="space-y-0.5">
          <p className="truncate text-xs text-muted-foreground">{trip.location}</p>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{trip.name}</h3>
          <p className="text-xs leading-snug text-muted-foreground">
            {formatTripDescriptionPreview(trip.description)}
          </p>
        </div>
        <div className="mt-auto grid w-full shrink-0 grid-cols-3 gap-1.5 pt-1.5">
          <Button
            type="button"
            size="sm"
            className="h-8 w-full justify-center gap-1 px-1.5"
            asChild
          >
            <Link to={tripSchedulePath(trip.id)}>
              <CalendarDays className="size-3.5 shrink-0" />
              <span className="truncate">Harmonogram</span>
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 w-full justify-center gap-1 border-transparent bg-sky-400 px-1.5 text-white hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
            asChild
          >
            <Link to={tripJournalPath(trip.id)}>
              <BookOpen className="size-3.5 shrink-0" />
              <span className="truncate">Dziennik</span>
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 w-full justify-center gap-1 px-1.5"
            disabled={exporting}
            onClick={onExport}
          >
            <Download className="size-3.5 shrink-0" />
            <span className="truncate">{exporting ? "PDF…" : "Eksportuj"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TripListRow({
  trip,
  exporting,
  onExport,
}: {
  trip: UserTrip
  exporting: boolean
  onExport: () => void
}) {
  const entryCount = trip.journalEntryCount

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40">
      <div
        className="size-14 shrink-0 rounded-md bg-cover bg-center"
        style={{ backgroundImage: `url(${trip.heroImageUrl})` }}
        role="img"
        aria-label={trip.name}
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{trip.name}</h3>
        <p className="truncate text-sm text-muted-foreground">{trip.location}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <TripStatusBadge finalized={trip.isFinalized} />
          <Badge variant="secondary" className="text-[10px]">
            {formatEntryCount(entryCount)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatTripDate(trip.startDate)}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" className="h-10 gap-1.5 px-3" asChild>
          <Link to={tripSchedulePath(trip.id)}>
            <CalendarDays className="size-4" />
            Harmonogram
          </Link>
        </Button>
        <Button
          type="button"
          className="h-10 gap-1.5 border-transparent bg-sky-400 px-3 text-white hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
          asChild
        >
          <Link to={tripJournalPath(trip.id)}>
            <BookOpen className="size-4" />
            Dziennik
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-1.5 px-3"
          disabled={exporting}
          onClick={onExport}
        >
          <Download className="size-4" />
          {exporting ? "PDF…" : "Eksportuj"}
        </Button>
      </div>
    </div>
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
