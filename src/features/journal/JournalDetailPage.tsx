import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft, Camera, Image, MapPin, Mic, Plus } from "lucide-react"

import type { JournalEntry } from "@/domain/models"
import type { TripStopPhoto } from "@/domain/models"
import { TripService } from "@/domain/services"
import { EditableBlock } from "@/features/journal/components/EditableBlock"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { TopBar } from "@/shared/components/layout/TopBar"
import { useTripData } from "@/shared/hooks/useTripData"
import { cn } from "@/shared/lib/utils"

type EditableEntry = {
  id: string
  title: string
  time: string
  body: string
  photos: TripStopPhoto[]
}

type JournalStats = {
  photos: string
  dailyPace: string
  temperature: string
  altitude: string
}

function formatTripDate(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function toEditableEntry(entry: JournalEntry): EditableEntry {
  return {
    id: entry.id,
    title: entry.title,
    time: entry.time,
    body: entry.body,
    photos: entry.photos,
  }
}

function fieldInputClassName() {
  return "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
}

export function JournalDetailPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { stats: defaultStats } = useTripData()
  const trip = TripService.getInstance().getTripById(tripId ?? "")

  const [tripName, setTripName] = useState("")
  const [description, setDescription] = useState("")
  const [sidebarLocation, setSidebarLocation] = useState("")
  const [entries, setEntries] = useState<EditableEntry[]>([])
  const [journalStats, setJournalStats] = useState<JournalStats>({
    photos: String(defaultStats.photosTaken),
    dailyPace: defaultStats.dailyPace,
    temperature: defaultStats.temperature,
    altitude: defaultStats.altitude,
  })

  useEffect(() => {
    if (!trip) return
    setTripName(trip.name)
    setDescription(trip.description)
    setSidebarLocation(trip.location)
    setEntries(trip.journalEntries.map(toEditableEntry))
  }, [trip])

  if (!trip) {
    return <Navigate to="/journal" replace />
  }

  const subtitle = formatTripDate(trip.startDate)

  const updateEntry = (id: string, next: EditableEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? next : e)))
  }

  const addEntry = (entry: Omit<EditableEntry, "id">) => {
    setEntries((prev) => [
      ...prev,
      { ...entry, id: `j-new-${Date.now()}` },
    ])
  }

  return (
    <>
      <TopBar
        title={`Dziennik: ${sidebarLocation || trip.location}`}
        subtitle={subtitle}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/journal">
              <ArrowLeft className="size-4" />
              Wszystkie podróże
            </Link>
          </Button>
        }
      />
      <ScrollArea className="flex-1">
        <EditableBlock
          className="border-b border-border px-6 py-5"
          editContent={
            <TripHeaderEdit
              name={tripName}
              description={description}
              onNameChange={setTripName}
              onDescriptionChange={setDescription}
            />
          }
          onSave={() => undefined}
          onCancel={() => {
            setTripName(trip.name)
            setDescription(trip.description)
          }}
        >
          <div className="pr-24">
            <h2 className="text-2xl font-bold">{tripName}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
        </EditableBlock>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <JournalTimeline entries={entries} onUpdateEntry={updateEntry} />
            <NewMemoryCard onAdd={addEntry} />
          </div>
          <JournalSidebar
            heroImage={trip.heroImageUrl}
            location={sidebarLocation}
            onLocationChange={setSidebarLocation}
          />
        </div>

        <JournalStatsBar
          stats={journalStats}
          onChange={setJournalStats}
          onCancel={() =>
            setJournalStats({
              photos: String(defaultStats.photosTaken),
              dailyPace: defaultStats.dailyPace,
              temperature: defaultStats.temperature,
              altitude: defaultStats.altitude,
            })
          }
        />
      </ScrollArea>
    </>
  )
}

function TripHeaderEdit({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: {
  name: string
  description: string
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="trip-name">Nazwa podróży</Label>
        <Input
          id="trip-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="trip-desc">Opis</Label>
        <textarea
          id="trip-desc"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={cn(fieldInputClassName(), "min-h-[80px] resize-none")}
        />
      </div>
    </div>
  )
}

function JournalTimeline({
  entries,
  onUpdateEntry,
}: {
  entries: EditableEntry[]
  onUpdateEntry: (id: string, entry: EditableEntry) => void
}) {
  return (
    <div className="relative space-y-0">
      <div className="absolute top-2 bottom-2 left-3 w-px bg-border" />
      {entries.map((entry) => (
        <JournalEntryCard
          key={entry.id}
          entry={entry}
          onSave={(next) => onUpdateEntry(entry.id, next)}
        />
      ))}
      {entries.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Brak wpisów — dodaj pierwsze wspomnienie poniżej.
        </p>
      )}
    </div>
  )
}

function JournalEntryCard({
  entry,
  onSave,
}: {
  entry: EditableEntry
  onSave: (entry: EditableEntry) => void
}) {
  const [draft, setDraft] = useState(entry)

  useEffect(() => {
    setDraft(entry)
  }, [entry])

  return (
    <article className="relative pb-8 pl-10">
      <div className="absolute left-0 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-primary">
        <Camera className="size-3.5" />
      </div>
      <Card className="py-4">
        <CardContent className="px-4 py-0">
          <EditableBlock
            editContent={
              <EntryEditForm draft={draft} onChange={setDraft} />
            }
            onSave={() => onSave(draft)}
            onCancel={() => setDraft(entry)}
          >
            <div className="space-y-3 pr-24">
              <div>
                <p className="text-[10px] text-muted-foreground">{entry.time}</p>
                <h3 className="font-semibold">{entry.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{entry.body}</p>
              {entry.photos.length > 0 && (
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
            </div>
          </EditableBlock>
        </CardContent>
      </Card>
    </article>
  )
}

function EntryEditForm({
  draft,
  onChange,
}: {
  draft: EditableEntry
  onChange: (entry: EditableEntry) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`time-${draft.id}`}>Godzina</Label>
          <Input
            id={`time-${draft.id}`}
            value={draft.time}
            onChange={(e) => onChange({ ...draft, time: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`title-${draft.id}`}>Tytuł</Label>
          <Input
            id={`title-${draft.id}`}
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`body-${draft.id}`}>Treść</Label>
        <textarea
          id={`body-${draft.id}`}
          value={draft.body}
          onChange={(e) => onChange({ ...draft, body: e.target.value })}
          className={cn(fieldInputClassName(), "min-h-[100px] resize-none")}
        />
      </div>
    </div>
  )
}

function NewMemoryCard({ onAdd }: { onAdd: (entry: Omit<EditableEntry, "id">) => void }) {
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("")
  const [body, setBody] = useState("")
  const [adding, setAdding] = useState(false)

  const reset = () => {
    setTitle("")
    setTime("")
    setBody("")
    setAdding(false)
  }

  const handlePublish = () => {
    if (!body.trim()) return
    onAdd({
      title: title.trim() || "Nowe wspomnienie",
      time: time.trim() || new Date().toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      body: body.trim(),
      photos: [],
    })
    reset()
  }

  if (!adding) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed py-8"
        onClick={() => setAdding(true)}
      >
        <Plus className="size-4" />
        Dodaj nowe wspomnienie
      </Button>
    )
  }

  return (
    <Card className="border-dashed">
      <CardContent className="space-y-3 py-4">
        <p className="text-sm font-medium">Nowe wspomnienie</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="new-time">Godzina</Label>
            <Input
              id="new-time"
              placeholder="np. 14:30"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-title">Tytuł</Label>
            <Input
              id="new-title"
              placeholder="np. Spacer po plaży"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        <textarea
          className={cn(fieldInputClassName(), "min-h-[80px] resize-none")}
          placeholder="Co odkryłeś dziś?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2 text-muted-foreground">
            <Image className="size-4" aria-hidden />
            <Mic className="size-4" aria-hidden />
            <MapPin className="size-4" aria-hidden />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={reset}>
              Anuluj
            </Button>
            <Button type="button" size="sm" onClick={handlePublish}>
              Opublikuj wpis
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function JournalSidebar({
  heroImage,
  location,
  onLocationChange,
}: {
  heroImage: string
  location: string
  onLocationChange: (v: string) => void
}) {
  const [draftLocation, setDraftLocation] = useState(location)

  useEffect(() => {
    setDraftLocation(location)
  }, [location])

  return (
    <div className="space-y-4">
      <EditableBlock
        editContent={
          <div className="space-y-1">
            <Label htmlFor="sidebar-location">Aktualna lokalizacja</Label>
            <Input
              id="sidebar-location"
              value={draftLocation}
              onChange={(e) => setDraftLocation(e.target.value)}
            />
          </div>
        }
        onSave={() => onLocationChange(draftLocation)}
        onCancel={() => setDraftLocation(location)}
      >
        <Card className="overflow-hidden py-0">
          <div className="relative">
            <img src={heroImage} alt="" className="h-48 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 pr-24 text-white">
              <p className="text-[10px] uppercase tracking-wider opacity-80">
                Śledzenie lokalizacji
              </p>
              <p className="font-semibold">{location}</p>
              <Badge className="mt-1 bg-primary/90">Aktualny przystanek</Badge>
            </div>
          </div>
        </Card>
      </EditableBlock>
      <EditableBlock
        editContent={
          <p className="text-sm text-muted-foreground">
            Galeria zdjęć — w pełnej wersji aplikacji możesz tu dodawać miniatury.
          </p>
        }
        onSave={() => undefined}
        onCancel={() => undefined}
      >
        <div className="grid grid-cols-3 gap-2 pr-24">
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
      </EditableBlock>
    </div>
  )
}

function JournalStatsBar({
  stats,
  onChange,
  onCancel,
}: {
  stats: JournalStats
  onChange: (stats: JournalStats) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(stats)

  useEffect(() => {
    setDraft(stats)
  }, [stats])

  const items = [
    { key: "photos" as const, label: "Zdjęcia" },
    { key: "dailyPace" as const, label: "Tempo dzienne" },
    { key: "temperature" as const, label: "Temperatura" },
    { key: "altitude" as const, label: "Wysokość" },
  ]

  return (
    <EditableBlock
      className="border-t border-border bg-background px-6 py-4"
      editContent={
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.key} className="space-y-1">
              <Label htmlFor={`stat-${item.key}`}>{item.label}</Label>
              <Input
                id={`stat-${item.key}`}
                value={draft[item.key]}
                onChange={(e) => setDraft({ ...draft, [item.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      }
      onSave={() => onChange(draft)}
      onCancel={() => {
        setDraft(stats)
        onCancel()
      }}
    >
      <div className="flex flex-wrap gap-8 pr-24">
        {items.map((item) => (
          <div key={item.key}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p className="text-lg font-bold">{stats[item.key]}</p>
          </div>
        ))}
      </div>
    </EditableBlock>
  )
}
