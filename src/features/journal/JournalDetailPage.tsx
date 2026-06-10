import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft, Download } from "lucide-react"
import { useForm } from "react-hook-form"

import { DraggableNoteTimeline } from "@/features/journal/components/DraggableNoteTimeline"
import { EditableBlock } from "@/features/journal/components/EditableBlock"
import { NewNoteForm } from "@/features/journal/components/NewNoteForm"
import { StopSelector } from "@/features/journal/components/StopSelector"
import { exportJournalTripPdf, notesForStop } from "@/features/journal/journalUtils"
import { TripDetailViewNav } from "@/features/routes/components/TripDetailViewNav"
import type { EditableNote } from "@/features/journal/types"
import { Button } from "@/shared/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import {
  useAddJournalNoteMutation,
  useDeleteJournalNoteMutation,
  useReorderJournalNotesMutation,
  useUpdateJournalNoteMutation,
  useUpdateTripMetadataMutation,
} from "@/shared/hooks/queries/useTripMutations"
import { useTrip } from "@/shared/hooks/useTrip"
import { tripHeaderSchema, type TripHeaderFormValues } from "@/shared/schemas/journalSchemas"
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
  const { trip, editableNotes, loading } = useTrip(tripId)
  const [selectedStopId, setSelectedStopId] = useState("")
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  const updateMetadataMutation = useUpdateTripMetadataMutation(tripId ?? "")
  const addNoteMutation = useAddJournalNoteMutation(tripId ?? "")
  const updateNoteMutation = useUpdateJournalNoteMutation(tripId ?? "")
  const deleteNoteMutation = useDeleteJournalNoteMutation(tripId ?? "")
  const reorderNotesMutation = useReorderJournalNotesMutation(tripId ?? "")

  const headerForm = useForm<TripHeaderFormValues>({
    resolver: zodResolver(tripHeaderSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (!trip) return
    headerForm.reset({
      name: trip.name,
      description: trip.description,
    })
  }, [headerForm, trip])

  const notes = editableNotes
  const defaultStopId = trip?.scheduleStops[0]?.id ?? ""
  const activeStopId = selectedStopId || defaultStopId

  const noteCountByStop = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const note of notes) {
      counts[note.scheduleStopId] = (counts[note.scheduleStopId] ?? 0) + 1
    }
    return counts
  }, [notes])

  const stopNotes = useMemo(
    () => (activeStopId ? notesForStop(notes, activeStopId) : []),
    [activeStopId, notes],
  )

  const selectedStop = trip?.scheduleStops.find((stop) => stop.id === activeStopId)

  const saving =
    updateMetadataMutation.isPending ||
    addNoteMutation.isPending ||
    updateNoteMutation.isPending ||
    deleteNoteMutation.isPending ||
    reorderNotesMutation.isPending

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

  const updateNote = (_id: string, next: EditableNote) => {
    setMutationError(null)
    updateNoteMutation.mutate(next, {
      onError: (error) => {
        setMutationError(error instanceof Error ? error.message : "Nie udało się zapisać notatki.")
      },
    })
  }

  const deleteNote = (id: string) => {
    const note = notes.find((item) => item.id === id)
    if (!note) return

    note.photos.forEach((photo) => {
      if (photo.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photo.imageUrl)
      }
    })

    setMutationError(null)
    deleteNoteMutation.mutate(note, {
      onError: (error) => {
        setMutationError(error instanceof Error ? error.message : "Nie udało się usunąć notatki.")
      },
    })
  }

  const reorderStopNotes = (reordered: EditableNote[]) => {
    setMutationError(null)
    reorderNotesMutation.mutate(
      { scheduleStopId: activeStopId, reordered },
      {
        onError: (error) => {
          setMutationError(
            error instanceof Error ? error.message : "Nie udało się zmienić kolejności notatek.",
          )
        },
      },
    )
  }

  const addNote = (
    partial: Omit<EditableNote, "id" | "sortOrder" | "scheduleStopId" | "connectionId">,
  ) => {
    setMutationError(null)
    addNoteMutation.mutate(
      { scheduleStopId: activeStopId, partial },
      {
        onError: (error) => {
          setMutationError(error instanceof Error ? error.message : "Nie udało się dodać notatki.")
        },
      },
    )
  }

  const saveHeader = headerForm.handleSubmit((values) => {
    setMutationError(null)
    updateMetadataMutation.mutate(values, {
      onError: (error) => {
        setMutationError(
          error instanceof Error ? error.message : "Nie udało się zapisać nagłówka podróży.",
        )
      },
    })
  })

  const handleExportPdf = () => {
    setMutationError(null)
    setExportingPdf(true)
    void exportJournalTripPdf(trip)
      .catch((error) => {
        setMutationError(
          error instanceof Error ? error.message : "Nie udało się wygenerować PDF dziennika.",
        )
      })
      .finally(() => setExportingPdf(false))
  }

  return (
    <PageLayout
      action={
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2" asChild>
            <Link to="/trasy">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Wszystkie trasy</span>
            </Link>
          </Button>
          <TripDetailViewNav tripId={tripId} activeView="journal" />
        </div>
      }
      trailing={
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={exportingPdf}
          aria-label={exportingPdf ? "Generowanie PDF…" : "Eksportuj PDF"}
          onClick={handleExportPdf}
        >
          <Download className="size-4" aria-hidden />
          <span className="hidden sm:inline">
            {exportingPdf ? "Generowanie PDF…" : "Eksportuj PDF"}
          </span>
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {mutationError && (
          <p className="shrink-0 border-b border-destructive/20 bg-destructive/10 px-6 py-2 text-sm text-destructive">
            {mutationError}
          </p>
        )}

        <EditableBlock
          className="shrink-0 border-b border-border px-6 py-5"
          editContent={
            <Form {...headerForm}>
              <form className="space-y-3" onSubmit={saveHeader}>
                <FormField
                  control={headerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa podróży</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={headerForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opis</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className={cn(fieldInputClassName(), "min-h-[80px] resize-none")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          }
          onSave={saveHeader}
          onCancel={() => {
            headerForm.reset({
              name: trip.name,
              description: trip.description,
            })
          }}
        >
          <div className="pr-28">
            <h2 className="text-2xl font-bold">{trip.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{trip.description}</p>
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
                  selectedStopId={activeStopId}
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

            {activeStopId && (
              <NewNoteForm
                key={activeStopId}
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
