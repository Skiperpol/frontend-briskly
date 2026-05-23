import { useEffect, useState } from "react"
import { Camera, GripVertical } from "lucide-react"

import { EditableBlock } from "@/features/journal/components/EditableBlock"
import { NotePhotoFields } from "@/features/journal/components/NotePhotoFields"
import { TimeInputField } from "@/features/journal/components/TimeInputField"
import { formatNoteDay } from "@/features/journal/journalUtils"
import type { EditableNote } from "@/features/journal/types"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

function fieldInputClassName() {
  return "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
}

type DraggableNoteTimelineProps = {
  notes: EditableNote[]
  onReorder: (notes: EditableNote[]) => void
  onUpdate: (id: string, note: EditableNote) => void
}

export function DraggableNoteTimeline({
  notes,
  onReorder,
  onUpdate,
}: DraggableNoteTimelineProps) {
  const [dragId, setDragId] = useState<string | null>(null)

  const handleDragStart = (id: string) => setDragId(id)

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null)
      return
    }
    const fromIndex = notes.findIndex((n) => n.id === dragId)
    const toIndex = notes.findIndex((n) => n.id === targetId)
    if (fromIndex < 0 || toIndex < 0) {
      setDragId(null)
      return
    }
    const next = [...notes]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onReorder(next.map((note, index) => ({ ...note, sortOrder: index })))
    setDragId(null)
  }

  if (notes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Brak notatek na tym przystanku — dodaj pierwszą poniżej.
      </p>
    )
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute top-2 bottom-2 left-3 w-px bg-border" />
      {notes.map((note) => (
        <article
          key={note.id}
          draggable
          onDragStart={() => handleDragStart(note.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(note.id)}
          onDragEnd={() => setDragId(null)}
          className={cn(
            "relative pb-8 pl-10 transition-opacity",
            dragId === note.id && "opacity-40",
          )}
        >
          <div className="absolute left-0 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-primary">
            <Camera className="size-3.5" />
          </div>
          <button
            type="button"
            aria-label="Przeciągnij, aby zmienić kolejność"
            className="absolute top-3 left-10 z-10 cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-4" />
          </button>
          <NoteCard note={note} onSave={(next) => onUpdate(note.id, next)} />
        </article>
      ))}
    </div>
  )
}

function NoteCard({
  note,
  onSave,
}: {
  note: EditableNote
  onSave: (note: EditableNote) => void
}) {
  const [draft, setDraft] = useState(note)

  useEffect(() => {
    setDraft(note)
  }, [note])

  return (
    <Card className="py-4">
      <CardContent className="px-4 py-0">
        <EditableBlock
          editContent={<NoteEditForm draft={draft} onChange={setDraft} />}
          onSave={() => onSave(draft)}
          onCancel={() => setDraft(note)}
        >
          <div className="space-y-3 pl-6 pr-24">
            <div>
              <p className="text-[10px] text-muted-foreground">
                {formatNoteDay(note.day)}
                {note.time ? ` · ${note.time}` : ""}
              </p>
              <h3 className="font-semibold">{note.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{note.body}</p>
            {note.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {note.photos.map((photo) => (
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
  )
}

function NoteEditForm({
  draft,
  onChange,
}: {
  draft: EditableNote
  onChange: (note: EditableNote) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`day-${draft.id}`}>Dzień</Label>
          <Input
            id={`day-${draft.id}`}
            type="date"
            value={draft.day}
            onChange={(e) => onChange({ ...draft, day: e.target.value })}
          />
        </div>
        <TimeInputField
          id={`time-${draft.id}`}
          value={draft.time}
          onChange={(time) => onChange({ ...draft, time })}
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
      <div className="space-y-1">
        <Label htmlFor={`body-${draft.id}`}>Opis</Label>
        <textarea
          id={`body-${draft.id}`}
          value={draft.body}
          onChange={(e) => onChange({ ...draft, body: e.target.value })}
          className={cn(fieldInputClassName(), "min-h-[100px] resize-none")}
        />
      </div>
      <NotePhotoFields
        photos={draft.photos}
        onChange={(photos) => onChange({ ...draft, photos })}
      />
    </div>
  )
}
