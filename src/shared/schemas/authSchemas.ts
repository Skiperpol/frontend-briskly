import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Podaj adres e-mail.").email("Podaj poprawny adres e-mail."),
  password: z.string().min(1, "Podaj hasło."),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    displayName: z.string().trim().min(1, "Podaj imię i nazwisko."),
    email: z.string().trim().min(1, "Podaj adres e-mail.").email("Podaj poprawny adres e-mail."),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków."),
    confirmPassword: z.string().min(1, "Powtórz hasło."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne.",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export const displayNameSchema = z.object({
  displayName: z.string().trim().min(1, "Podaj imię i nazwisko."),
})

export type DisplayNameFormValues = z.infer<typeof displayNameSchema>
