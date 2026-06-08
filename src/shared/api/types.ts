export type ApiUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
}

export type ApiLoginResponse = {
  access: string
  refresh: string
  user: ApiUser
}

export type ApiTrip = {
  slug: string
  name: string
  description?: string
  start_date: string | null
  end_date: string | null
  thumbnail_url: string | null
  created_at: string
  journal_entry_count?: number
}

export type ApiDashboardStats = {
  countries_visited: number
  countries_delta: string
  total_kilometers: string
  kilometers_delta: string
  expeditions: number
  expeditions_delta: string
  photos_taken: number
  daily_pace: string
  temperature: string
  altitude: string
  trips_total: number
}

export type ApiStopRef = {
  stop_id: string
  stop_name: string
  city_id: string
  city_name: string
  region?: string
  country_code?: string
  country_name?: string
  longitude: number
  latitude: number
  thumbnail_url?: string | null
}

export type ApiConnection = {
  id: number
  user_trip: string
  gtfs_trip: string | null
  starting_stop: ApiStopRef
  destination_stop: ApiStopRef
  timezone: string
  departure_date: string
  departure_time: string
  arrival_date: string
  arrival_time: string
  duration_in_travel: number
  duration_waiting: number
  duration_total: number
}

export type ApiCity = {
  city_id: string
  city_name: string
  city_region_name: string
  city_country_name: string
  city_country_code: string
  city_lat?: number
  city_long?: number
}

export type ApiCityStopsGroup = {
  city_id: string
  city_name: string
  region: string
  country_code: string
  country_name: string
  stops: {
    stop_id: string
    stop_name: string
    stop_lat: number
    stop_lon: number
    suburb: string
  }[]
}

export type ApiStopDestinationConnection = {
  id: string
  trip_id: string
  departure_date: string
  departure_time: string
  departure_at: string
  arrival_date: string
  arrival_time: string
  arrival_at: string
  duration_in_travel: number
  duration_waiting: number
  duration_total: number
  destination_stop_id: string
  destination_city_id: string
}

export type ApiDestinationStopRef = {
  stop_id: string
  stop_name: string
  lat: number
  lon: number
  city_id?: string | null
  suburb?: string | null
}

export type ApiStopDestinationsResponse = {
  count: number
  search: {
    from_stop_id: string
    date: string
    time: string
    waiting_time_seconds: number
    timezone: string
  }
  origin: {
    stop_id: string
    stop_name: string
    city_id: string
  }
  connections: ApiStopDestinationConnection[]
  stops: Record<string, ApiDestinationStopRef>
  cities: Record<string, { city_id: string; city_name: string; region: string }>
}

export type ApiNote = {
  id: number
  sequence_id: number
  user_trip_connection: number
  html_source: string
  image_url: string
  created_at: string
  updated_at: string
}
