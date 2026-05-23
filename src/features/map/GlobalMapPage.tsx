import { Minus, Plus } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { PageLayout } from "@/shared/components/layout/PageLayout"
import { useTripData } from "@/shared/hooks/useTripData"

export function GlobalMapPage() {
  const { activeTrip, stats } = useTripData()

  return (
    <PageLayout title="Mapa globalna">
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1e3a5f_0%,_#0f172a_70%)]" />
        <div className="absolute top-6 left-6">
          <Badge variant="secondary" className="bg-white/10 text-white">
            Globalny ślad podróży
          </Badge>
          <p className="mt-2 text-sm text-white/80">
            {stats.totalKilometers} · {activeTrip.name}
          </p>
        </div>
        <div className="absolute top-6 right-6 flex flex-col gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="bg-white/90"
            aria-label="Powiększ"
          >
            <Plus />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white/90"
            aria-label="Pomniejsz"
          >
            <Minus />
          </Button>
        </div>
        <Card className="absolute bottom-6 left-6 max-w-xs bg-background/95 backdrop-blur">
          <CardContent className="py-3 text-sm">
            <p className="font-semibold">Siatka połączeń</p>
            <p className="text-xs text-muted-foreground">
              Historyczne trasy na wspólnym modelu geograficznym — mapa wspomnień
              Briskly.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
