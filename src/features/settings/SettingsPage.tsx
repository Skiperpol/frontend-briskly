import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { BookOpen, Camera, Compass, Flag, Pencil, Rocket } from "lucide-react"

import { AuthError } from "@/domain/services/AuthService"
import { UserAvatar } from "@/shared/components/UserAvatar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { displayNameSchema, type DisplayNameFormValues } from "@/shared/schemas/authSchemas"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { useAuth } from "@/shared/context/AuthContext"
import { useTripData } from "@/shared/hooks/useTripData"
import { cn } from "@/shared/lib/utils"

export function SettingsPage() {
  const { session, updateDisplayName } = useAuth()
  const { stats, journalTrips } = useTripData()

  if (!session) {
    return null
  }

  const { user } = session
  const completedTrips = journalTrips.filter((trip) => trip.isCompleted).length

  return (
    <PageLayout title="Ustawienia">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dane użytkownika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <UserAvatar
                  initials={user.initials}
                  className="size-16"
                  fallbackClassName="text-lg"
                />
                <div className="min-w-0 flex-1">
                  <EditableDisplayName
                    value={user.displayName}
                    onSave={(displayName) => updateDisplayName(displayName)}
                  />
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Podsumowanie osiągnięć</CardTitle>
              <p className="text-sm text-muted-foreground">
                Twoje statystyki podróżnicze w Briskly
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <AchievementCard
                  label="Odwiedzone kraje"
                  value={String(stats.countriesVisited)}
                  badge={stats.countriesDelta}
                  icon={<Flag className="size-5 text-primary" />}
                />
                <AchievementCard
                  label="Łącznie kilometrów"
                  value={stats.totalKilometers}
                  badge={stats.kilometersDelta}
                  icon={<Rocket className="size-5 text-primary" />}
                />
                <AchievementCard
                  label="Wyprawy"
                  value={String(stats.expeditions)}
                  badge={stats.expeditionsDelta}
                  icon={<Compass className="size-5 text-primary" />}
                />
                <AchievementCard
                  label="Zdjęcia w dzienniku"
                  value={String(stats.photosTaken)}
                  badge={`${journalTrips.length} podróży`}
                  icon={<Camera className="size-5 text-primary" />}
                />
                <AchievementCard
                  label="Dzienniki podróży"
                  value={String(journalTrips.length)}
                  badge={`${completedTrips} zakończonych`}
                  icon={<BookOpen className="size-5 text-primary" />}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </PageLayout>
  )
}

function EditableDisplayName({
  value,
  onSave,
}: {
  value: string
  onSave: (displayName: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const form = useForm<DisplayNameFormValues>({
    resolver: zodResolver(displayNameSchema),
    defaultValues: { displayName: value },
  })

  const handleSave = form.handleSubmit(async (values) => {
    setError(null)
    setSaved(false)
    if (values.displayName === value) {
      setEditing(false)
      return
    }
    try {
      await onSave(values.displayName)
      setSaved(true)
      setEditing(false)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Nie udało się zapisać zmian.")
    }
  })

  const handleCancel = () => {
    form.reset({ displayName: value })
    setError(null)
    setEditing(false)
  }

  if (editing) {
    return (
      <Form {...form}>
        <form onSubmit={handleSave} className="space-y-2">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-background text-lg font-semibold"
                    autoFocus
                    aria-label="Imię i nazwisko"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") handleCancel()
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              Zapisz
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
              Anuluj
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <div className="space-y-1">
      <div className="group flex min-w-0 items-center gap-1">
        <p className="truncate text-lg font-semibold">{value}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 shrink-0 text-muted-foreground",
            "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
          )}
          onClick={() => {
            setSaved(false)
            form.reset({ displayName: value })
            setEditing(true)
          }}
          aria-label="Edytuj imię i nazwisko"
        >
          <Pencil className="size-4" />
        </Button>
      </div>
      {saved && <p className="text-sm text-muted-foreground">Zapisano zmiany.</p>}
    </div>
  )
}

function AchievementCard({
  label,
  value,
  badge,
  icon,
}: {
  label: string
  value: string
  badge?: string
  icon: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {badge && (
          <Badge variant="secondary" className="mt-2 text-[10px]">
            {badge}
          </Badge>
        )}
      </div>
      <div className="rounded-lg bg-primary/10 p-2">{icon}</div>
    </div>
  )
}
