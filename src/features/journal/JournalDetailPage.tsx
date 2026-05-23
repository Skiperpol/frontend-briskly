import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { TripService } from "@/domain/services"
import { DraggableNoteTimeline } from "@/features/journal/components/DraggableNoteTimeline"
import { EditableBlock } from "@/features/journal/components/EditableBlock"
import { NewNoteForm } from "@/features/journal/components/NewNoteForm"
import { StopSelector } from "@/features/journal/components/StopSelector"
import { notesForStop, toEditableNote } from "@/features/journal/journalUtils"
import type { EditableNote } from "@/features/journal/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { TopBar } from "@/shared/components/layout/TopBar"
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
  const trip = TripService.getInstance().getTripById(tripId ?? "")

  const [tripName, setTripName] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState<EditableNote[]>([])
  const [selectedStopId, setSelectedStopId] = useState("")

  useEffect(() => {
    if (!trip) return
    setTripName(trip.name)
    setDescription(trip.description)
    setNotes(trip.journalEntries.map(toEditableNote))
    setSelectedStopId(trip.scheduleStops[0]?.id ?? "")
  }, [trip])

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

  const selectedStop = trip?.scheduleStops.find((s) => s.id === selectedStopId)

  if (!trip) {
    return <Navigate to="/journal" replace />
  }

  const defaultNoteDay = toIsoDay(trip.startDate)

  const updateNote = (id: string, next: EditableNote) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? next : n)))
  }

  const reorderStopNotes = (reordered: EditableNote[]) => {
    setNotes((prev) => {
      const other = prev.filter((n) => n.scheduleStopId !== selectedStopId)
      return [...other, ...reordered]
    })
  }

  const addNote = (partial: Omit<EditableNote, "id" | "sortOrder" | "scheduleStopId">) => {
    const current = notesForStop(notes, selectedStopId)
    const nextOrder =
      current.length > 0 ? Math.max(...current.map((n) => n.sortOrder)) + 1 : 0
    setNotes((prev) => [
      ...prev,
      {
        ...partial,
        id: `j-new-${Date.now()}`,
        scheduleStopId: selectedStopId,
        sortOrder: nextOrder,
      },
    ])
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        action={
          <Button size="sm" className="gap-2" asChild>
            <Link to="/journal">
              <ArrowLeft className="size-4" />
              Wszystkie podróże
            </Link>
          </Button>
        }
      />

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
        onSave={() => undefined}
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
                <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
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
              />
            </div>
          </ScrollArea>

          {selectedStopId && (
            <NewNoteForm
              key={selectedStopId}
              defaultDay={defaultNoteDay}
              onAdd={addNote}
            />
          )}
        </div>
      </div>
    </div>
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
