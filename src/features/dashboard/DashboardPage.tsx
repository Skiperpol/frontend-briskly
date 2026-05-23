import type { ReactNode } from "react"
import {
  Camera,
  Compass,
  Flag,
  Heart,
  Plane,
  Plus,
  Rocket,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { TopBar } from "@/shared/components/layout/TopBar"
import { useTripData } from "@/shared/hooks/useTripData"
import { cn } from "@/shared/lib/utils"

export function DashboardPage() {
  const { activeTrip, activities, travelLogs, stats } = useTripData()

  return (
    <>
      <TopBar />
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          <Card className="relative overflow-hidden border-0 py-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${activeTrip.heroImageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <CardContent className="relative flex min-h-[200px] items-end justify-between gap-6 p-6">
              <div className="space-y-2 text-white">
                <Badge className="bg-primary/90 text-primary-foreground">
                  AKTUALNA WYCIECZKA
                </Badge>
                <p className="text-xs uppercase tracking-wider opacity-90">
                  {activeTrip.location}
                </p>
                <h2 className="text-2xl font-bold">{activeTrip.name}</h2>
                <p className="max-w-md text-sm opacity-90">{activeTrip.description}</p>
              </div>
              <div className="rounded-xl bg-black/50 px-5 py-4 text-center text-white backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wider opacity-80">
                  Start za
                </p>
                <div className="mt-2 flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-[10px] opacity-70">dni</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">04</p>
                    <p className="text-[10px] opacity-70">godz.</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">32</p>
                    <p className="text-[10px] opacity-70">min</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Odwiedzone kraje"
                  value={String(stats.countriesVisited)}
                  badge={stats.countriesDelta}
                  icon={<Flag className="size-5 text-primary" />}
                />
                <StatCard
                  label="Łącznie kilometrów"
                  value={stats.totalKilometers}
                  badge={stats.kilometersDelta}
                  icon={<Rocket className="size-5 text-primary" />}
                />
                <StatCard
                  label="Wyprawy"
                  value={String(stats.expeditions)}
                  badge={stats.expeditionsDelta}
                  icon={<Compass className="size-5 text-primary" />}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Button className="h-auto flex-col gap-2 py-8" size="lg">
                  <Plane className="size-8" />
                  <span className="font-semibold">Zaplanuj wycieczkę</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-8" size="lg">
                  <Camera className="size-8" />
                  <span className="font-semibold">Dodaj wspomnienie</span>
                </Button>
              </div>

              <Card className="overflow-hidden bg-slate-900 py-0 text-white">
                <CardContent className="relative min-h-[220px] p-0">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1e3a5f_0%,_#0f172a_70%)]" />
                  <div className="relative flex h-full flex-col justify-between p-5">
                    <Badge variant="secondary" className="w-fit">
                      Globalny ślad podróży
                    </Badge>
                    <p className="text-xs text-white/60">
                      Wizualizacja mapy — nakładka historycznych tras
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold">Ostatnia aktywność</h3>
                {activities.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{item.title}</p>
                      {item.badge && (
                        <Badge variant="outline" className="text-[10px]">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                    {item.meta && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>
                    )}
                    {item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Dzienniki podróży</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {travelLogs.map((log) => (
                <Card
                  key={log.id}
                  className="w-52 shrink-0 overflow-hidden py-0"
                >
                  <div
                    className="h-28 bg-cover bg-center"
                    style={{ backgroundImage: `url(${log.imageUrl})` }}
                  />
                  <CardContent className="space-y-1 py-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {log.monthLabel}
                    </Badge>
                    <p className="font-semibold">{log.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {log.description}
                    </p>
                    <button type="button" className="text-muted-foreground" aria-label="Polub">
                      <Heart
                        className={cn(
                          "size-4",
                          log.liked && "fill-destructive text-destructive",
                        )}
                      />
                    </button>
                  </CardContent>
                </Card>
              ))}
              <Card className="flex w-40 shrink-0 items-center justify-center border-dashed py-12">
                <Plus className="size-8 text-muted-foreground" />
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}

function StatCard({
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
    <Card>
      <CardContent className="flex items-start justify-between pt-2">
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
      </CardContent>
    </Card>
  )
}
