import { Camera, Image, MapPin, Mic } from "lucide-react"

import type { JournalEntry } from "@/domain/models"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { TopBar } from "@/shared/components/layout/TopBar"
import { useTripData } from "@/shared/hooks/useTripData"
import { cn } from "@/shared/lib/utils"

export function JournalPage() {
  const { journalTrip, stats } = useTripData()

  return (
    <>
      <TopBar
        title={`Dziennik: ${journalTrip.location}`}
        subtitle="14 maj 2024"
      />
      <ScrollArea className="flex-1">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-2xl font-bold">{journalTrip.name}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {journalTrip.description}
          </p>
          <div className="mt-3 flex gap-2">
            {journalTrip.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <JournalTimeline entries={journalTrip.journalEntries} />
            <NewMemoryCard />
          </div>
          <JournalSidebar heroImage={journalTrip.heroImageUrl} />
        </div>

        <JournalStatsBar stats={stats} />
      </ScrollArea>
      <Button
        size="icon-lg"
        className="fixed right-8 bottom-20 z-10 rounded-full shadow-lg"
        aria-label="Dodaj zdjęcie"
      >
        <Camera />
      </Button>
    </>
  )
}

function JournalTimeline({ entries }: { entries: JournalEntry[] }) {
  return (
    <div className="relative space-y-0">
      <div className="absolute top-2 bottom-2 left-3 w-px bg-border" />
      {entries.map((entry) => (
        <JournalEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <article className="relative pb-8 pl-10">
      <div
        className={cn(
          "absolute left-0 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-primary",
        )}
      >
        <Camera className="size-3.5" />
      </div>
      <Card className="py-4">
        <CardContent className="space-y-3 px-4 py-0">
          <div>
            <p className="text-[10px] text-muted-foreground">{entry.time}</p>
            <h3 className="font-semibold">{entry.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{entry.body}</p>
          {entry.hasPhotos && (
            <div className="grid grid-cols-2 gap-2">
              {entry.photos.map((photo) => (
                <figure key={photo.id} className="space-y-1">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  {photo.userDescription && (
                    <figcaption className="text-xs text-muted-foreground">
                      {photo.userDescription}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </article>
  )
}

function NewMemoryCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="space-y-3 py-4">
        <p className="text-sm font-medium">Dodaj nowe wspomnienie</p>
        <textarea
          className="min-h-[80px] w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Co odkryłeś dziś?"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2 text-muted-foreground">
            <Image className="size-4" aria-hidden />
            <Mic className="size-4" aria-hidden />
            <MapPin className="size-4" aria-hidden />
          </div>
          <Button size="sm" className="bg-foreground text-background">
            Opublikuj wpis
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function JournalSidebar({ heroImage }: { heroImage: string }) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden py-0">
        <div className="relative">
          <img src={heroImage} alt="" className="h-48 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-[10px] uppercase tracking-wider opacity-80">
              Śledzenie lokalizacji
            </p>
            <p className="font-semibold">Positano, Włochy</p>
            <Badge className="mt-1 bg-primary/90">Aktualny przystanek</Badge>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-muted bg-cover bg-center"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-${1511739001486 + i}-6bfe10ce785f?w=200&q=80)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function JournalStatsBar({
  stats,
}: {
  stats: ReturnType<typeof useTripData>["stats"]
}) {
  const items = [
    { label: "Zdjęcia", value: String(stats.photosTaken) },
    { label: "Tempo dzienne", value: stats.dailyPace },
    { label: "Temperatura", value: stats.temperature },
    { label: "Wysokość", value: stats.altitude },
  ]

  return (
    <div className="flex flex-wrap gap-8 border-t border-border bg-background px-6 py-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {item.label}
          </p>
          <p className="text-lg font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
