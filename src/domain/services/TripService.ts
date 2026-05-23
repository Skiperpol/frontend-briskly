import {
  ActivityItem,
  DashboardStats,
  Destination,
  JournalEntry,
  RouteLeg,
  ScheduleStop,
  TravelLog,
  TripStopPhoto,
  UserTrip,
} from "@/domain/models"

const IMG = {
  mountains:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
  amsterdam:
    "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
  copenhagen:
    "https://images.unsplash.com/photo-1513628254376-128610065bd51?w=800&q=80",
  coast:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
  tropical:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  street:
    "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  sunset:
    "https://images.unsplash.com/photo-1495959335449-1f43c9619785?w=400&q=80",
}

export class TripService {
  private static instance: TripService | null = null

  private readonly activeTrip: UserTrip
  private readonly destinations: Destination[]
  private readonly activities: ActivityItem[]
  private readonly travelLogs: TravelLog[]
  private readonly stats: DashboardStats

  private constructor() {
    const photos = [
      new TripStopPhoto("p1", IMG.coast, "Pierwszy widok na zatokę Salerno.", "Port"),
      new TripStopPhoto("p2", IMG.street, "Wąskie uliczki starego miasta.", "Uliczki"),
    ]

    this.activeTrip = new UserTrip(
      "trip-1",
      "european-grand-tour-2024",
      "Wielka trasa po Europie 2024",
      IMG.mountains,
      "Zermatt, Szwajcaria",
      "Wyprawa w Alpy 2024 — śnieżne szczyty i górskie szlaki.",
      ["#ALPY", "#SZWAJCARIA"],
      new Date("2024-06-15"),
      [
        new RouteLeg(
          "leg-1",
          "flight",
          "Warszawa (WAW)",
          "Berlin (BER)",
          "LH2833",
          "1h 25m",
          "Bezpośrednio",
        ),
        new RouteLeg(
          "leg-2",
          "train",
          "Berlin Hbf",
          "Amsterdam Centraal",
          "ICE77",
          "6h 12m",
          "Oczekiwanie: 2h 15m",
          "2h 15m",
        ),
        new RouteLeg(
          "leg-3",
          "bus",
          "Amsterdam",
          "Rotterdam",
          "FLIX88",
          "1h 05m",
          "Ekonomiczna",
        ),
      ],
      [
        new ScheduleStop(
          "s1",
          "flight",
          "08:45",
          "Wylot",
          "Londyn Heathrow (LHR)",
          {
            Lot: "BA 8386",
            Terminal: "T5",
            Brama: "B22",
            Miejsce: "14A",
          },
        ),
        new ScheduleStop(
          "s2",
          "flight",
          "11:00",
          "Przylot",
          "Paryż Charles de Gaulle (CDG)",
          { Czas: "2h 15m (szac.)" },
        ),
        new ScheduleStop(
          "s3",
          "hotel",
          "14:30",
          "Zameldowanie w hotelu",
          "Le Meurice, Paryż",
          { Adres: "228 Rue de Rivoli, 75001 Paryż" },
          IMG.hotel,
        ),
        new ScheduleStop(
          "s4",
          "journal",
          "16:15",
          "Wpis z dziennika",
          "Lunch w Café de Flore",
          {},
          undefined,
          "Croissanty tutaj smakują jak nigdzie indziej. Czyste masło i chrupiące ciasto.",
          ["JEDZENIE", "KRAJOBRAZ"],
        ),
        new ScheduleStop(
          "s5",
          "dining",
          "19:30",
          "Rezerwacja restauracji",
          "Le Jules Verne",
          { Stolik: "Przy oknie, piętro 2" },
        ),
      ],
      [
        new JournalEntry(
          "j1",
          "Przylot do Salerno",
          "09:45",
          "Rejs promem przebiegł spokojniej niż się spodziewaliśmy. Linia brzegowa z portu zapiera dech w piersiach.",
          "arrival",
          photos,
        ),
        new JournalEntry(
          "j2",
          "Lunch w Trattoria d'Alba",
          "13:30",
          "Świeży makaron z owocami morza i lokalne białe wino. Idealna przerwa w drodze do Positano.",
          "meal",
          [],
          ["JEDZENIE", "KRAJOBRAZ", "MYŚLI"],
        ),
      ],
    )

    this.destinations = [
      new Destination(
        "d1",
        "Amsterdam",
        "Holandia",
        98,
        "7h 40m podróży",
        "Średni budżet",
        "Doskonałe połączenia kolejowe i bogata oferta kulturalna.",
        IMG.amsterdam,
        true,
      ),
      new Destination(
        "d2",
        "Innsbruck",
        "Austria",
        82,
        "12h 15m via München",
        "Średni budżet",
        "Idealne połączenie dla miłośników Alp.",
        IMG.mountains,
        false,
      ),
      new Destination(
        "d3",
        "Lyon",
        "Francja",
        91,
        "14h 50m TGV",
        "Średni budżet",
        "Doskonała baza gastronomiczna w Europie.",
        IMG.food,
        false,
      ),
      new Destination(
        "d4",
        "Kopenhaga",
        "Dania",
        88,
        "Express",
        "Wyższy budżet",
        "Skandynawski design i wybrzeże.",
        IMG.copenhagen,
        true,
        "EKSPRESOWE",
      ),
    ]

    this.activities = [
      new ActivityItem(
        "a1",
        "flight",
        "Potwierdzony lot",
        "BA 8386 · Londyn → Paryż",
        "14 maj, 08:45",
        [],
        "BILET",
      ),
      new ActivityItem(
        "a2",
        "journal",
        "Wpis w dzienniku",
        "Croissanty tutaj smakują jak nigdzie indziej…",
        undefined,
        ["ISLANDIA", "MYŚLI"],
      ),
      new ActivityItem(
        "a3",
        "booking",
        "Aktualizacja rezerwacji",
        "Le Meurice — zameldowanie o 14:30",
        "Paryż, Francja",
      ),
    ]

    this.travelLogs = [
      new TravelLog(
        "l1",
        "Tropikalna cisza",
        "Plaże Bali i tarasy ryżowe.",
        "SIE 2023",
        IMG.tropical,
        true,
      ),
      new TravelLog(
        "l2",
        "Zorza północna",
        "Polowanie na zorzę w Tromsø.",
        "LUT 2024",
        IMG.mountains,
      ),
      new TravelLog(
        "l3",
        "Nadmorskie drogi",
        "Trasa Amalfi i gaje cytrynowe.",
        "MAJ 2024",
        IMG.coast,
      ),
    ]

    this.stats = new DashboardStats(
      28,
      "+2 w tym roku",
      "142 tys. km",
      "+18 tys. w tym roku",
      56,
      "+4 w tym roku",
      142,
      "8,4 km/dzień",
      "24°",
      "310 m n.p.m.",
    )
  }

  static getInstance(): TripService {
    if (!TripService.instance) {
      TripService.instance = new TripService()
    }
    return TripService.instance
  }

  getActiveTrip(): UserTrip {
    return this.activeTrip
  }

  getJournalTrip(): UserTrip {
    return new UserTrip(
      "journal-view",
      "cobalt-horizon",
      "Kobaltowy horyzont",
      IMG.coast,
      "Wybrzeże Amalfitańskie",
      "Podróż wzdłuż krętych nadmorskich dróg i ukrytych zatoczek południowych Włoch.",
      ["#AMALFI", "#WŁOCHY2024"],
      new Date("2024-05-14"),
      [],
      [],
      this.activeTrip.journalEntries,
    )
  }

  getDestinations(): Destination[] {
    return [...this.destinations]
  }

  getActivities(): ActivityItem[] {
    return [...this.activities]
  }

  getTravelLogs(): TravelLog[] {
    return [...this.travelLogs]
  }

  getStats(): DashboardStats {
    return this.stats
  }
}
