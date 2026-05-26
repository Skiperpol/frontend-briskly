export function MapboxMissingToken() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/40 p-8 text-center">
      <p className="text-sm font-medium">Brak tokenu Mapbox</p>
      <p className="max-w-md text-sm text-muted-foreground">
        Trasy autobusowe wymagają Mapbox Directions. Ustaw{" "}
        <code className="rounded bg-muted px-1.5 py-0.5">VITE_MAPBOX_ACCESS_TOKEN</code> w
        pliku <code className="rounded bg-muted px-1.5 py-0.5">.env</code> (patrz{" "}
        <code className="rounded bg-muted px-1.5 py-0.5">.env.example</code>).
      </p>
    </div>
  )
}
