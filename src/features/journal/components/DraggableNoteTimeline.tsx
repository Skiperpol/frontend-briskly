import { Fragment, useState } from "react"
import { GripVertical } from "lucide-react"

import { EditableBlock } from "@/features/journal/components/EditableBlock"
import { NotePhotoFields } from "@/features/journal/components/NotePhotoFields"
import { TimeInputField } from "@/features/journal/components/TimeInputField"
import { formatNoteDay, sortNotes } from "@/features/journal/journalUtils"
import type { EditableNote } from "@/features/journal/types"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

function fieldInputClassName() {
  return "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
}

type DraggableNoteTimelineProps = {
  notes: EditableNote[]
  onReorder: (notes: EditableNote[]) => void
  onUpdate: (id: string, note: EditableNote) => void
  onDelete: (id: string) => void
}

function isNoOpInsert(fromIndex: number, insertIndex: number): boolean {
  return insertIndex === fromIndex || insertIndex === fromIndex + 1
}

function DropPlaceholder() {
  return (
    <div className="relative pb-4 pl-10">
      <div className="flex h-14 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/35 bg-muted/60 text-xs text-muted-foreground">
        Notatka pojawi się tutaj
      </div>
    </div>
  )
}

export function DraggableNoteTimeline({
  notes,
  onReorder,
  onUpdate,
  onDelete,
}: DraggableNoteTimelineProps) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [insertIndex, setInsertIndex] = useState<number | null>(null)

  const sortedNotes = sortNotes(notes)

  const clearDragState = () => {
    setDragId(null)
    setInsertIndex(null)
  }

  const handleDragStart = (id: string) => setDragId(id)

  const updateInsertIndex = (nextIndex: number) => {
    if (!dragId) return
    const fromIndex = sortedNotes.findIndex((n) => n.id === dragId)
    if (fromIndex < 0) return
    if (isNoOpInsert(fromIndex, nextIndex)) {
      setInsertIndex(null)
      return
    }
    setInsertIndex(nextIndex)
  }

  const handleNoteDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault()
    if (!dragId) return
    const rect = event.currentTarget.getBoundingClientRect()
    const insertBefore = event.clientY < rect.top + rect.height / 2
    updateInsertIndex(insertBefore ? index : index + 1)
  }

  const handleListDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (!dragId) return
    updateInsertIndex(sortedNotes.length)
  }

  const handleDrop = () => {
    if (!dragId || insertIndex === null) {
      clearDragState()
      return
    }
    const ordered = sortNotes(notes)
    const fromIndex = ordered.findIndex((n) => n.id === dragId)
    if (fromIndex < 0) {
      clearDragState()
      return
    }

    let targetIndex = insertIndex
    if (fromIndex < targetIndex) targetIndex -= 1
    if (targetIndex === fromIndex) {
      clearDragState()
      return
    }

    const [moved] = ordered.splice(fromIndex, 1)
    ordered.splice(targetIndex, 0, moved)
    onReorder(ordered.map((note, index) => ({ ...note, sortOrder: index })))
    clearDragState()
  }

  const showPlaceholderAt = (index: number) => {
    if (!dragId || insertIndex !== index) return false
    const fromIndex = sortedNotes.findIndex((n) => n.id === dragId)
    return fromIndex >= 0 && !isNoOpInsert(fromIndex, index)
  }

  if (notes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Brak notatek na tym przystanku, dodaj pierwszą poniżej.
      </p>
    )
  }

  return (
    <div
      className="relative space-y-0"
      onDragOver={handleListDragOver}
      onDrop={(e) => {
        e.preventDefault()
        handleDrop()
      }}
    >
      <div className="absolute top-2 bottom-2 left-3 w-px bg-border" />
      {sortedNotes.map((note, index) => (
        <Fragment key={note.id}>
          {showPlaceholderAt(index) && <DropPlaceholder />}
          <article
            draggable
            onDragStart={() => handleDragStart(note.id)}
            onDragOver={(e) => {
              e.stopPropagation()
              handleNoteDragOver(e, index)
            }}
            onDragEnd={clearDragState}
            className={cn(
              "relative pb-8 pl-10 transition-opacity",
              dragId === note.id && "opacity-40",
            )}
          >
            <span
              className="absolute top-3 left-3 z-10 block size-2.5 -translate-x-1/2 rounded-full bg-primary ring-4 ring-background"
              aria-hidden
            />
            <button
              type="button"
              aria-label="Przeciągnij, aby zmienić kolejność"
              className="absolute top-3 left-10 z-10 cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="size-4" />
            </button>
            <NoteCard
              key={`${note.id}-${note.sortOrder}-${note.title}-${note.body}`}
              note={note}
              onSave={(next) => onUpdate(note.id, next)}
              onDelete={() => onDelete(note.id)}
            />
          </article>
        </Fragment>
      ))}
      {showPlaceholderAt(sortedNotes.length) && <DropPlaceholder />}
    </div>
  )
}

function NoteCard({
  note,
  onSave,
  onDelete,
}: {
  note: EditableNote
  onSave: (note: EditableNote) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState(note)

  return (
    <Card className="py-4">
      <CardContent className="px-4 py-0">
        <EditableBlock
          editContent={<NoteEditForm draft={draft} onChange={setDraft} />}
          onSave={() => onSave(draft)}
          onCancel={() => setDraft(note)}
          onDelete={onDelete}
        >
          <div className="space-y-3 py-4 pl-6 sm:pr-44">
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
            className="bg-background"
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
          className="bg-background"
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
        showAddButton
      />
    </div>
  )
}
