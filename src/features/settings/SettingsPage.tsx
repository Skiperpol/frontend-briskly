import type { ReactNode } from "react"
import { BookOpen, Camera, Compass, Flag, Mail, Rocket, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { useAuth } from "@/shared/context/AuthContext"
import { useTripData } from "@/shared/hooks/useTripData"

export function SettingsPage() {
  const { session } = useAuth()
  const { stats, journalTrips } = useTripData()

  if (!session) {
    return null
  }

  const { user } = session
  const completedTrips = journalTrips.filter((trip) => trip.isFinalized).length

  return (
    <PageLayout title="Ustawienia">
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-6 p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dane użytkownika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarFallback className="text-lg">{user.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-lg font-semibold">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <ProfileField
                  icon={<User className="size-4" />}
                  label="Imię i nazwisko"
                  value={user.displayName}
                />
                <ProfileField
                  icon={<Mail className="size-4" />}
                  label="Adres e-mail"
                  value={user.email}
                />
              </dl>
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

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium">{value}</dd>
      </div>
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
