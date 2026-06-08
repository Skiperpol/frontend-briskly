import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { NotePhotoFields } from "@/features/journal/components/NotePhotoFields"
import { TimeInputField } from "@/features/journal/components/TimeInputField"
import { getCurrentTimeValue } from "@/features/journal/journalUtils"
import type { EditableNote, EditablePhoto } from "@/features/journal/types"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
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
import { newNoteSchema, type NewNoteFormValues } from "@/shared/schemas/journalSchemas"
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
  const [photos, setPhotos] = useState<EditablePhoto[]>([])

  const form = useForm<NewNoteFormValues>({
    resolver: zodResolver(newNoteSchema),
    defaultValues: {
      day: defaultDay,
      time: "",
      title: "",
      body: "",
    },
  })

  const reset = () => {
    form.reset({
      day: defaultDay,
      time: "",
      title: "",
      body: "",
    })
    setPhotos([])
    setOpen(false)
  }

  const onSubmit = (values: NewNoteFormValues) => {
    onAdd({
      day: values.day || defaultDay,
      time: values.time?.trim() || getCurrentTimeValue(),
      title: values.title?.trim() || "Nowa notatka",
      body: values.body.trim(),
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="day"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dzień</FormLabel>
                            <FormControl>
                              <Input type="date" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Godzina</FormLabel>
                            <FormControl>
                              <TimeInputField
                                id="new-note-time"
                                hideLabel
                                value={field.value ?? ""}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tytuł</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="np. Widok z tarasu"
                              className="bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opis</FormLabel>
                          <FormControl>
                            <textarea
                              className={cn(fieldInputClassName(), "min-h-[120px] resize-none")}
                              placeholder="Co zapisać z tego przystanku?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <NotePhotoFields photos={photos} onChange={setPhotos} />

                    <div className="flex justify-end gap-2 border-t border-border pt-3">
                      <Button type="button" variant="outline" onClick={reset}>
                        Anuluj
                      </Button>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        Zapisz notatkę
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
      )}

      <div className="shrink-0 border-t border-border bg-background p-4">
        <Button
          type="button"
          className="w-full gap-2"
          disabled={disabled || open}
          onClick={() => {
            form.reset({
              day: defaultDay,
              time: "",
              title: "",
              body: "",
            })
            setPhotos([])
            setOpen(true)
          }}
        >
          <Plus className="size-4" />
          Dodaj notatkę
        </Button>
      </div>
    </>
  )
}
