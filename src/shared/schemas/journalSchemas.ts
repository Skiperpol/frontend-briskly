import { z } from "zod"

export const newNoteSchema = z.object({
  day: z.string().min(1, "Podaj dzień."),
  time: z.string().optional(),
  title: z.string().optional(),
  body: z.string().trim().min(1, "Opis notatki jest wymagany."),
})

export type NewNoteFormValues = z.infer<typeof newNoteSchema>

export const tripHeaderSchema = z.object({
  name: z.string().trim().min(1, "Podaj nazwę podróży."),
  description: z.string(),
})

export type TripHeaderFormValues = z.infer<typeof tripHeaderSchema>
