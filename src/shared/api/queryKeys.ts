export const queryKeys = {
  trips: {
    all: ["trips"] as const,
    list: () => [...queryKeys.trips.all, "list"] as const,
    detail: (slug: string) => [...queryKeys.trips.all, "detail", slug] as const,
  },
  stats: {
    all: ["stats"] as const,
    dashboard: () => [...queryKeys.stats.all, "dashboard"] as const,
  },
  cities: {
    all: ["cities"] as const,
    popular: () => [...queryKeys.cities.all, "popular"] as const,
  },
}
