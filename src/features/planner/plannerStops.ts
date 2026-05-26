import type { PlannerCity, PlannerDepartureStop } from "@/features/planner/types"

export const PLANNER_CITIES: PlannerCity[] = [
  {
    id: "warszawa",
    label: "Warszawa",
    mapCenter: { lat: 52.2297, lng: 21.0122 },
    mapZoom: 11,
  },
  {
    id: "krakow",
    label: "Kraków",
    mapCenter: { lat: 50.0647, lng: 19.945 },
    mapZoom: 12,
  },
  {
    id: "wroclaw",
    label: "Wrocław",
    mapCenter: { lat: 51.1079, lng: 17.0385 },
    mapZoom: 12,
  },
  {
    id: "poznan",
    label: "Poznań",
    mapCenter: { lat: 52.4064, lng: 16.9252 },
    mapZoom: 12,
  },
  {
    id: "gdansk",
    label: "Gdańsk",
    mapCenter: { lat: 54.352, lng: 18.6466 },
    mapZoom: 12,
  },
]

export const DEPARTURE_STOPS: PlannerDepartureStop[] = [
  {
    id: "wa-zachodnia",
    cityId: "warszawa",
    name: "Warszawa Zachodnia PKS",
    address: "Al. Jerozolimskie 144",
    position: { lat: 52.218, lng: 20.9652 },
  },
  {
    id: "wa-wilanowska",
    cityId: "warszawa",
    name: "Metro Wilanowska",
    address: "Puławska 427",
    position: { lat: 52.1639, lng: 21.0233 },
  },
  {
    id: "wa-centrum",
    cityId: "warszawa",
    name: "Warszawa Centrum",
    address: "Emilii Plater 20",
    position: { lat: 52.229, lng: 21.001 },
  },
  {
    id: "kr-mda",
    cityId: "krakow",
    name: "Kraków MDA",
    address: "ul. Bosacka 1",
    position: { lat: 50.0677, lng: 19.945 },
  },
  {
    id: "kr-blonia",
    cityId: "krakow",
    name: "Kraków Błonia",
    address: "al. 3 Maja",
    position: { lat: 50.066, lng: 19.916 },
  },
  {
    id: "wr-dworzec",
    cityId: "wroclaw",
    name: "Wrocław, Dworzec Autobusowy",
    address: "ul. Joannitów 13",
    position: { lat: 51.0988, lng: 17.0385 },
  },
  {
    id: "wr-grunwaldzka",
    cityId: "wroclaw",
    name: "Wrocław Grunwaldzka",
    address: "ul. Grunwaldzka 54",
    position: { lat: 51.112, lng: 17.03 },
  },
  {
    id: "po-dworzec",
    cityId: "poznan",
    name: "Poznań, Dworzec Autobusowy",
    address: "ul. Towarowa 42",
    position: { lat: 52.4025, lng: 16.9125 },
  },
  {
    id: "po-glogowska",
    cityId: "poznan",
    name: "Poznań Głogowska",
    address: "ul. Głogowska 143",
    position: { lat: 52.38, lng: 16.88 },
  },
  {
    id: "gd-pks",
    cityId: "gdansk",
    name: "Gdańsk PKS",
    address: "ul. 3 Maja 12",
    position: { lat: 54.3569, lng: 18.6466 },
  },
  {
    id: "gd-oliwa",
    cityId: "gdansk",
    name: "Gdańsk Oliwa",
    address: "al. Grunwaldzka 238",
    position: { lat: 54.411, lng: 18.571 },
  },
]

export function getPlannerCity(cityId: string): PlannerCity | undefined {
  return PLANNER_CITIES.find((city) => city.id === cityId)
}

export function getDepartureStopsForCity(cityId: string): PlannerDepartureStop[] {
  return DEPARTURE_STOPS.filter((stop) => stop.cityId === cityId)
}

export function getDepartureStopById(stopId: string): PlannerDepartureStop | undefined {
  return DEPARTURE_STOPS.find((stop) => stop.id === stopId)
}
