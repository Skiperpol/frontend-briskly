import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { TripService } from "@/domain/services"
import { DraggableNoteTimeline } from "@/features/journal/components/DraggableNoteTimeline"
import { EditableBlock } from "@/features/journal/components/EditableBlock"
import { NewNoteForm } from "@/features/journal/components/NewNoteForm"
import { StopSelector } from "@/features/journal/components/StopSelector"
import { notesForStop } from "@/features/journal/journalUtils"
import type { EditableNote } from "@/features/journal/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { useTrip } from "@/shared/hooks/useTrip"
import { cn } from "@/shared/lib/utils"

function formatTripDate(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function fieldInputClassName() {
  return "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
}

export function JournalDetailPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { trip, loading, reload } = useTrip(tripId)
  const service = TripService.getInstance()

  const [tripName, setTripName] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState<EditableNote[]>([])
  const [selectedStopId, setSelectedStopId] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!trip || !tripId) return
    setTripName(trip.name)
    setDescription(trip.description)
    setNotes(service.getEditableJournalNotes(tripId))
    setSelectedStopId(trip.scheduleStops[0]?.id ?? "")
  }, [service, trip, tripId])

  const noteCountByStop = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const note of notes) {
      counts[note.scheduleStopId] = (counts[note.scheduleStopId] ?? 0) + 1
    }
    return counts
  }, [notes])

  const stopNotes = useMemo(
    () => (selectedStopId ? notesForStop(notes, selectedStopId) : []),
    [notes, selectedStopId],
  )

  const selectedStop = trip?.scheduleStops.find((stop) => stop.id === selectedStopId)

  const runMutation = async (action: () => Promise<void>) => {
    setSaving(true)
    setSaveError(null)
    try {
      await action()
      reload()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Operacja nie powiodła się.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Ładowanie dziennika…
        </div>
      </PageLayout>
    )
  }

  if (!trip || !tripId) {
    return <Navigate to="/trasy" replace />
  }

  const defaultNoteDay = toIsoDay(trip.startDate)

  const updateNote = (id: string, next: EditableNote) => {
    void runMutation(async () => {
      await service.updateJournalNote(tripId, next)
    })
    setNotes((prev) => prev.map((note) => (note.id === id ? next : note)))
  }

  const deleteNote = (id: string) => {
    const note = notes.find((item) => item.id === id)
    if (!note) return

    note.photos.forEach((photo) => {
      if (photo.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photo.imageUrl)
      }
    })

    void runMutation(async () => {
      await service.deleteJournalNote(tripId, note)
    })
    setNotes((prev) => prev.filter((item) => item.id !== id))
  }

  const reorderStopNotes = (reordered: EditableNote[]) => {
    setNotes((prev) => {
      const other = prev.filter((note) => note.scheduleStopId !== selectedStopId)
      return [...other, ...reordered]
    })
    void runMutation(async () => {
      await service.reorderJournalNotes(tripId, selectedStopId, reordered)
    })
  }

  const addNote = (
    partial: Omit<EditableNote, "id" | "sortOrder" | "scheduleStopId" | "connectionId">,
  ) => {
    void runMutation(async () => {
      await service.addJournalNote(tripId, selectedStopId, partial)
    })
  }

  return (
    <PageLayout
      action={
        <Button size="sm" className="gap-2" asChild>
          <Link to="/trasy">
            <ArrowLeft className="size-4" />
            Wszystkie trasy
          </Link>
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {saveError && (
          <p className="shrink-0 border-b border-destructive/20 bg-destructive/10 px-6 py-2 text-sm text-destructive">
            {saveError}
          </p>
        )}

        <EditableBlock
          className="shrink-0 border-b border-border px-6 py-5"
          editContent={
            <TripHeaderEdit
              name={tripName}
              description={description}
              onNameChange={setTripName}
              onDescriptionChange={setDescription}
            />
          }
          onSave={() => {
            void runMutation(async () => {
              const updated = await service.updateTripMetadata(tripId, {
                name: tripName.trim(),
                description: description.trim(),
              })
              setTripName(updated.name)
              setDescription(updated.description)
            })
          }}
          onCancel={() => {
            setTripName(trip.name)
            setDescription(trip.description)
          }}
        >
          <div className="pr-28">
            <h2 className="text-2xl font-bold">{tripName}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatTripDate(trip.startDate)}
            </p>
          </div>
        </EditableBlock>

        <div className="grid min-h-0 flex-1 gap-6 p-6 lg:grid-cols-3">
          <aside className="min-h-0 lg:col-span-1">
            <ScrollArea className="h-full max-h-full">
              {trip.scheduleStops.length > 0 ? (
                <StopSelector
                  stops={trip.scheduleStops}
                  selectedStopId={selectedStopId}
                  noteCountByStop={noteCountByStop}
                  onSelect={setSelectedStopId}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Brak przystanków w harmonogramie tej podróży.
                </p>
              )}
            </ScrollArea>
          </aside>

          <div className="relative flex min-h-0 flex-col overflow-hidden rounded-lg border border-border lg:col-span-2">
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-6 p-4 pb-2">
                {selectedStop && (
                  <div className="rounded-lg border border-border bg-background px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Wybrany przystanek
                    </p>
                    <p className="font-semibold">{selectedStop.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedStop.subtitle}</p>
                  </div>
                )}

                <DraggableNoteTimeline
                  notes={stopNotes}
                  onReorder={reorderStopNotes}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                />
              </div>
            </ScrollArea>

            {selectedStopId && (
              <NewNoteForm
                key={selectedStopId}
                defaultDay={defaultNoteDay}
                disabled={saving}
                onAdd={addNote}
              />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
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
