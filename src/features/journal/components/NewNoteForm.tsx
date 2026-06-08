import { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"

import { NotePhotoFields } from "@/features/journal/components/NotePhotoFields"
import { TimeInputField } from "@/features/journal/components/TimeInputField"
import { getCurrentTimeValue } from "@/features/journal/journalUtils"
import type { EditableNote, EditablePhoto } from "@/features/journal/types"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"

function fieldInputClassName() {
  return "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
}

type NewNoteFormProps = {
  defaultDay: string
  onAdd: (
    note: Omit<EditableNote, "id" | "sortOrder" | "scheduleStopId" | "connectionId">,
  ) => void
  disabled?: boolean
}

export function NewNoteForm({ defaultDay, onAdd, disabled }: NewNoteFormProps) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(defaultDay)
  const [time, setTime] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [photos, setPhotos] = useState<EditablePhoto[]>([])

  useEffect(() => {
    if (!open) setDay(defaultDay)
  }, [defaultDay, open])

  const reset = () => {
    setDay(defaultDay)
    setTime("")
    setTitle("")
    setBody("")
    setPhotos([])
    setOpen(false)
  }

  const handlePublish = () => {
    if (!body.trim()) return
    onAdd({
      day: day || defaultDay,
      time: time.trim() || getCurrentTimeValue(),
      title: title.trim() || "Nowa notatka",
      body: body.trim(),
      photos,
    })
    reset()
  }

  return (
    <>
      {open && (
        <div className="absolute inset-0 z-20 flex flex-col bg-background">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Nowa notatka</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Zamknij"
              onClick={reset}
            >
              <X className="size-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <Card className="m-4 border-0 shadow-none">
              <CardContent className="space-y-4 px-0 py-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="new-note-day">Dzień</Label>
                    <Input
                      id="new-note-day"
                      type="date"
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <TimeInputField
                    id="new-note-time"
                    value={time}
                    onChange={setTime}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-note-title">Tytuł</Label>
                  <Input
                    id="new-note-title"
                    placeholder="np. Widok z tarasu"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-note-body">Opis</Label>
                  <textarea
                    id="new-note-body"
                    className={cn(fieldInputClassName(), "min-h-[120px] resize-none")}
                    placeholder="Co zapisać z tego przystanku?"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
                <NotePhotoFields photos={photos} onChange={setPhotos} />
              </CardContent>
            </Card>
          </ScrollArea>
          <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-background px-4 py-3">
            <Button type="button" variant="outline" onClick={reset}>
              Anuluj
            </Button>
            <Button type="button" onClick={handlePublish}>
              Zapisz notatkę
            </Button>
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-border bg-background p-4">
        <Button
          type="button"
          className="w-full gap-2"
          disabled={disabled || open}
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4" />
          Dodaj notatkę
        </Button>
      </div>
    </>
  )
}
