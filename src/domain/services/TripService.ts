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
import type { PlannerRouteLeg } from "@/features/planner/types"
import {
  plannerLegsToTripRoute,
  tripStopsToPlannerLegs,
} from "@/features/planner/plannerTripUtils"

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

  private readonly trips: UserTrip[]
  private readonly plannerDrafts = new Map<string, PlannerRouteLeg[]>()
  private readonly destinations: Destination[]
  private readonly activities: ActivityItem[]
  private readonly travelLogs: TravelLog[]
  private readonly stats: DashboardStats

  private constructor() {
    const amalfiPhotos = [
      new TripStopPhoto("p1", IMG.coast, "Pierwszy widok na zatokę Salerno.", "Port"),
      new TripStopPhoto("p2", IMG.street, "Wąskie uliczki starego miasta.", "Uliczki"),
    ]

    const europeanTrip = new UserTrip(
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
          "06:10",
          "Wylot",
          "Warszawa Chopin (WAW)",
          { Lot: "LO 381" },
          undefined,
          undefined,
          [],
          { lat: 52.2297, lng: 21.0122 },
        ),
        new ScheduleStop(
          "s2",
          "train",
          "09:40",
          "Przesiadka",
          "Berlin Hauptbahnhof",
          { Pociąg: "ICE 77" },
          undefined,
          undefined,
          [],
          { lat: 52.52, lng: 13.405 },
        ),
        new ScheduleStop(
          "s3",
          "train",
          "14:05",
          "Postój",
          "Praga, Dworzec Główny",
          {},
          undefined,
          undefined,
          [],
          { lat: 50.0755, lng: 14.4378 },
        ),
        new ScheduleStop(
          "s4",
          "train",
          "18:20",
          "Kolacja",
          "Wiedeń, Stephansplatz",
          {},
          undefined,
          undefined,
          [],
          { lat: 48.2082, lng: 16.3738 },
        ),
        new ScheduleStop(
          "s5",
          "train",
          "11:30",
          "Spacer",
          "Wenecja, Piazza San Marco",
          {},
          undefined,
          undefined,
          [],
          { lat: 45.4408, lng: 12.3155 },
        ),
        new ScheduleStop(
          "s6",
          "journal",
          "16:00",
          "Wpis z dziennika",
          "Rzym, Koloseum",
          {},
          undefined,
          "Słońce odbija się od kamieni Forum Romanum — idealny dzień na długi spacer.",
          ["HISTORIA"],
          { lat: 41.9028, lng: 12.4964 },
        ),
        new ScheduleStop(
          "s7",
          "dining",
          "13:15",
          "Lunch",
          "Florencja, Ponte Vecchio",
          {},
          IMG.food,
          undefined,
          [],
          { lat: 43.7696, lng: 11.2558 },
        ),
        new ScheduleStop(
          "s8",
          "train",
          "20:45",
          "Wieczór",
          "Lyon, Presqu'île",
          {},
          undefined,
          undefined,
          [],
          { lat: 45.764, lng: 4.8357 },
        ),
        new ScheduleStop(
          "s9",
          "hotel",
          "14:30",
          "Zameldowanie",
          "Le Meurice, Paryż",
          { Adres: "228 Rue de Rivoli" },
          IMG.hotel,
          undefined,
          [],
          { lat: 48.8656, lng: 2.328 },
        ),
        new ScheduleStop(
          "s10",
          "flight",
          "08:45",
          "Lot",
          "Londyn Heathrow (LHR)",
          { Lot: "BA 8386" },
          undefined,
          undefined,
          [],
          { lat: 51.47, lng: -0.4543 },
        ),
        new ScheduleStop(
          "s11",
          "train",
          "17:00",
          "Finał trasy",
          "Amsterdam Centraal",
          {},
          undefined,
          undefined,
          [],
          { lat: 52.3676, lng: 4.9041 },
        ),
        new ScheduleStop(
          "s12",
          "train",
          "10:20",
          "Skandynawia",
          "Kopenhaga, Nyhavn",
          {},
          IMG.copenhagen,
          undefined,
          [],
          { lat: 55.6761, lng: 12.5683 },
        ),
      ],
      [
        new JournalEntry(
          "j-e2",
          "s6",
          "2024-06-15",
          "Spacer po Rzymie",
          "16:00",
          "Forum Romanum o złotej godzinie — tłumy już się rozchodzą, a kamień jest ciepły.",
          "sight",
          [],
          0,
        ),
        new JournalEntry(
          "j-e1",
          "s9",
          "2024-06-18",
          "Kolacja przy wieży Eiffla",
          "21:30",
          "Wieczorne światła Paryża i ciepły deser w kawiarni przy Sekwanie.",
          "meal",
          [],
          1,
        ),
      ],
      new Date("2024-06-20"),
      [
        { lat: 52.2297, lng: 21.0122 },
        { lat: 52.52, lng: 13.405 },
        { lat: 50.0755, lng: 14.4378 },
        { lat: 48.2082, lng: 16.3738 },
        { lat: 45.815, lng: 15.9819 },
        { lat: 46.948, lng: 7.4474 },
        { lat: 45.4408, lng: 12.3155 },
        { lat: 43.7696, lng: 11.2558 },
        { lat: 41.9028, lng: 12.4964 },
        { lat: 43.2965, lng: 5.3698 },
        { lat: 45.764, lng: 4.8357 },
        { lat: 48.8656, lng: 2.328 },
        { lat: 51.47, lng: -0.4543 },
        { lat: 52.3676, lng: 4.9041 },
        { lat: 52.52, lng: 13.405 },
        { lat: 55.6761, lng: 12.5683 },
      ],
    )

    const amalfiTrip = new UserTrip(
      "trip-2",
      "cobalt-horizon",
      "Kobaltowy horyzont",
      IMG.coast,
      "Wybrzeże Amalfitańskie",
      "Podróż wzdłuż krętych nadmorskich dróg i ukrytych zatoczek południowych Włoch.",
      [],
      new Date("2024-05-14"),
      [],
      [
        new ScheduleStop(
          "am-s1",
          "flight",
          "07:30",
          "Start",
          "Palermo, Port",
          { Prom: "Traghetti Line" },
          undefined,
          undefined,
          [],
          { lat: 38.1157, lng: 13.3615 },
        ),
        new ScheduleStop(
          "am-s2",
          "bus",
          "10:15",
          "Wybrzeże",
          "Catania, Piazza Duomo",
          {},
          undefined,
          undefined,
          [],
          { lat: 37.5079, lng: 15.083 },
        ),
        new ScheduleStop(
          "am-s3",
          "flight",
          "09:45",
          "Przylot",
          "Port Salerno",
          { Prom: "Traghetti Line" },
          undefined,
          undefined,
          [],
          { lat: 40.6824, lng: 14.7681 },
        ),
        new ScheduleStop(
          "am-s4",
          "dining",
          "12:00",
          "Lunch",
          "Positano — taras widokowy",
          { Rezerwacja: "Taras z widokiem" },
          IMG.food,
          undefined,
          [],
          { lat: 40.6281, lng: 14.4849 },
        ),
        new ScheduleStop(
          "am-s5",
          "train",
          "15:40",
          "Przesiadka",
          "Neapol, Stazione Centrale",
          {},
          undefined,
          undefined,
          [],
          { lat: 40.8518, lng: 14.2681 },
        ),
        new ScheduleStop(
          "am-s6",
          "journal",
          "18:30",
          "Wpis z dziennika",
          "Rzym, Koloseum",
          {},
          undefined,
          "Druga wizyta w Rzymie — tym razem zachód słońca pada prosto na łuk Tytusa.",
          ["HISTORIA"],
          { lat: 41.9028, lng: 12.4964 },
        ),
        new ScheduleStop(
          "am-s7",
          "dining",
          "13:30",
          "Obiad",
          "Florencja, Uffizi",
          {},
          IMG.street,
          undefined,
          [],
          { lat: 43.7696, lng: 11.2558 },
        ),
        new ScheduleStop(
          "am-s8",
          "train",
          "17:10",
          "Postój",
          "Bolonia, Piazza Maggiore",
          {},
          undefined,
          undefined,
          [],
          { lat: 44.4949, lng: 11.3426 },
        ),
        new ScheduleStop(
          "am-s9",
          "train",
          "20:00",
          "Wieczór",
          "Wenecja, Canal Grande",
          {},
          IMG.sunset,
          undefined,
          [],
          { lat: 45.4408, lng: 12.3155 },
        ),
        new ScheduleStop(
          "am-s10",
          "bus",
          "11:20",
          "Bałkany",
          "Split, Riva",
          {},
          undefined,
          undefined,
          [],
          { lat: 43.5081, lng: 16.4402 },
        ),
        new ScheduleStop(
          "am-s11",
          "flight",
          "19:50",
          "Finał",
          "Ateny, Akropol",
          {},
          undefined,
          undefined,
          [],
          { lat: 37.9838, lng: 23.7275 },
        ),
      ],
      [
        new JournalEntry(
          "j-a1",
          "am-s3",
          "2024-05-14",
          "Przylot do Salerno",
          "09:45",
          "Rejs promem przebiegł spokojniej niż się spodziewaliśmy. Linia brzegowa z portu zapiera dech w piersiach.",
          "arrival",
          amalfiPhotos,
          0,
        ),
        new JournalEntry(
          "j-a2",
          "am-s4",
          "2024-05-15",
          "Lunch w Positano",
          "12:00",
          "Świeży makaron z owocami morza i lokalne białe wino na tarasie z widokiem na zatokę.",
          "meal",
          [],
          0,
        ),
        new JournalEntry(
          "j-a3",
          "am-s9",
          "2024-05-18",
          "Wenecja o zmierzchu",
          "20:00",
          "Canal Grande w złotym świetle — gondole i fasady palazzów odbijają się w wodzie jak z pocztówki.",
          "sight",
          [new TripStopPhoto("p3", IMG.sunset, "Zachód nad Canal Grande.", "Wenecja")],
          0,
        ),
      ],
      null,
      [
        { lat: 38.1157, lng: 13.3615 },
        { lat: 37.5079, lng: 15.083 },
        { lat: 40.6824, lng: 14.7681 },
        { lat: 40.6281, lng: 14.4849 },
        { lat: 40.8518, lng: 14.2681 },
        { lat: 41.9028, lng: 12.4964 },
        { lat: 43.7696, lng: 11.2558 },
        { lat: 44.4949, lng: 11.3426 },
        { lat: 45.4408, lng: 12.3155 },
        { lat: 45.815, lng: 15.9819 },
        { lat: 43.5081, lng: 16.4402 },
        { lat: 41.0082, lng: 28.9784 },
        { lat: 37.9838, lng: 23.7275 },
      ],
    )

    const baliTrip = new UserTrip(
      "trip-3",
      "tropical-serenity",
      "Tropikalna cisza",
      IMG.tropical,
      "Bali, Indonezja",
      "Plaże, tarasy ryżowe i spokojne świątynie — powrót do wspomnień z ubiegłego lata.",
      [],
      new Date("2023-09-08"),
      [],
      [
        new ScheduleStop(
          "b-s1",
          "flight",
          "08:00",
          "Start",
          "Denpasar, Lotnisko Ngurah Rai",
          {},
          undefined,
          undefined,
          [],
          { lat: -8.7482, lng: 115.1672 },
        ),
        new ScheduleStop(
          "b-s2",
          "journal",
          "06:30",
          "Poranek",
          "Taras ryżowy Tegallalang, Ubud",
          {},
          IMG.tropical,
          undefined,
          [],
          { lat: -8.4312, lng: 115.2798 },
        ),
        new ScheduleStop(
          "b-s3",
          "bus",
          "11:00",
          "Wulkan",
          "Kintamani, Batur",
          {},
          undefined,
          undefined,
          [],
          { lat: -8.2482, lng: 115.3665 },
        ),
        new ScheduleStop(
          "b-s4",
          "bus",
          "15:30",
          "Północ",
          "Lovina, plaża",
          {},
          IMG.coast,
          undefined,
          [],
          { lat: -8.1329, lng: 115.047 },
        ),
        new ScheduleStop(
          "b-s5",
          "bus",
          "09:20",
          "Zachód",
          "Pemuteran, rafa koralowa",
          {},
          undefined,
          undefined,
          [],
          { lat: -8.1662, lng: 114.687 },
        ),
        new ScheduleStop(
          "b-s6",
          "journal",
          "17:45",
          "Świątynia",
          "Tanah Lot",
          {},
          IMG.sunset,
          undefined,
          [],
          { lat: -8.6211, lng: 115.0868 },
        ),
        new ScheduleStop(
          "b-s7",
          "dining",
          "13:00",
          "Lunch",
          "Uluwatu, klif",
          {},
          IMG.food,
          undefined,
          [],
          { lat: -8.8291, lng: 115.0849 },
        ),
        new ScheduleStop(
          "b-s8",
          "bus",
          "10:40",
          "Południe",
          "Nusa Dua",
          {},
          undefined,
          undefined,
          [],
          { lat: -8.8006, lng: 115.2317 },
        ),
        new ScheduleStop(
          "b-s9",
          "dining",
          "20:00",
          "Kolacja",
          "Plaża Seminyak",
          { Stolik: "Przy wodzie" },
          IMG.coast,
          undefined,
          [],
          { lat: -8.691, lng: 115.1682 },
        ),
        new ScheduleStop(
          "b-s10",
          "journal",
          "05:15",
          "Wschód słońca",
          "Amed, wschodnie wybrzeże",
          {},
          IMG.tropical,
          undefined,
          [],
          { lat: -8.3431, lng: 115.6712 },
        ),
      ],
      [
        new JournalEntry(
          "j-b1",
          "b-s2",
          "2023-09-08",
          "Ubud o świcie",
          "06:30",
          "Mgła nad tarasami ryżowymi Tegallalang i śpiew ptaków, zanim obudzi się reszta wyspy.",
          "sight",
          [],
          0,
        ),
        new JournalEntry(
          "j-b2",
          "b-s9",
          "2023-09-10",
          "Kolacja na plaży Seminyak",
          "20:00",
          "Grillowane owoce morza, muzyka na żywo i ciepły wiatr od Oceanu Indyjskiego.",
          "meal",
          [],
          0,
        ),
      ],
      new Date("2023-10-02"),
      [
        { lat: -8.7482, lng: 115.1672 },
        { lat: -8.4312, lng: 115.2798 },
        { lat: -8.2482, lng: 115.3665 },
        { lat: -8.1329, lng: 115.047 },
        { lat: -8.1662, lng: 114.687 },
        { lat: -8.6211, lng: 115.0868 },
        { lat: -8.8291, lng: 115.0849 },
        { lat: -8.8006, lng: 115.2317 },
        { lat: -8.691, lng: 115.1682 },
        { lat: -8.3431, lng: 115.6712 },
        { lat: -8.7482, lng: 115.1672 },
      ],
    )

    const tromsoTrip = new UserTrip(
      "trip-4",
      "aurora-hunt",
      "Polowanie na zorzę",
      IMG.mountains,
      "Tromsø, Norwegia",
      "Arktyczna noc, ciepła herbata w termosie i czekanie na zielone światło na niebie.",
      [],
      new Date("2024-02-18"),
      [],
      [
        new ScheduleStop(
          "t-s1",
          "flight",
          "07:00",
          "Start",
          "Oslo, Gardermoen",
          {},
          undefined,
          undefined,
          [],
          { lat: 60.1976, lng: 11.1004 },
        ),
        new ScheduleStop(
          "t-s2",
          "train",
          "12:30",
          "Przesiadka",
          "Kopenhaga, Nyhavn",
          {},
          IMG.copenhagen,
          undefined,
          [],
          { lat: 55.6761, lng: 12.5683 },
        ),
        new ScheduleStop(
          "t-s3",
          "train",
          "16:45",
          "Postój",
          "Sztokholm, Gamla Stan",
          {},
          undefined,
          undefined,
          [],
          { lat: 59.3293, lng: 18.0686 },
        ),
        new ScheduleStop(
          "t-s4",
          "train",
          "10:10",
          "Fiordy",
          "Bergen, Bryggen",
          {},
          IMG.mountains,
          undefined,
          [],
          { lat: 60.3913, lng: 5.3221 },
        ),
        new ScheduleStop(
          "t-s5",
          "bus",
          "14:20",
          "Widok",
          "Geiranger, punkt widokowy",
          {},
          undefined,
          undefined,
          [],
          { lat: 62.1008, lng: 7.2058 },
        ),
        new ScheduleStop(
          "t-s6",
          "train",
          "18:00",
          "Północ",
          "Trondheim, katedra Nidaros",
          {},
          undefined,
          undefined,
          [],
          { lat: 63.4305, lng: 10.3951 },
        ),
        new ScheduleStop(
          "t-s7",
          "bus",
          "11:40",
          "Lofoty",
          "Reine, wioska rybacka",
          {},
          IMG.coast,
          undefined,
          [],
          { lat: 67.9334, lng: 13.0895 },
        ),
        new ScheduleStop(
          "t-s8",
          "journal",
          "23:15",
          "Polowanie na zorzę",
          "Fjellheisen, Tromsø",
          { Temperatura: "−12 °C" },
          IMG.mountains,
          undefined,
          [],
          { lat: 69.65, lng: 18.96 },
        ),
      ],
      [
        new JournalEntry(
          "j-t1",
          "t-s8",
          "2024-02-18",
          "Zorza o północy",
          "23:15",
          "Po godzinie w mrozie niebo rozbłysło zielonymi smugami — warto było czekać na mrozie.",
          "sight",
          [],
          0,
        ),
      ],
      new Date("2024-02-25"),
      [
        { lat: 60.1976, lng: 11.1004 },
        { lat: 57.7089, lng: 11.9746 },
        { lat: 55.6761, lng: 12.5683 },
        { lat: 59.3293, lng: 18.0686 },
        { lat: 60.3913, lng: 5.3221 },
        { lat: 62.1008, lng: 7.2058 },
        { lat: 63.4305, lng: 10.3951 },
        { lat: 67.9334, lng: 13.0895 },
        { lat: 69.65, lng: 18.96 },
      ],
    )

    const flixWroclawPoznan = new UserTrip(
      "trip-flix-wro-poz",
      "flix-wroclaw-poznan",
      "Flixbus: Wrocław → Poznań",
      IMG.street,
      "Dworzec autobusowy",
      "Bezpośrednie połączenie Flixbus — trasa wyznaczana po drogach z Mapbox.",
      ["#FLIX", "#BUS"],
      new Date("2024-11-08"),
      [
        new RouteLeg(
          "fx-leg-1",
          "bus",
          "Wrocław, Dworzec Autobusowy",
          "Poznań, Dworzec Autobusowy",
          "FlixBus 1234",
          "2h 15m",
          "Bezpośrednio",
        ),
      ],
      [
        new ScheduleStop(
          "fx-s1",
          "bus",
          "06:45",
          "Wyjazd",
          "Wrocław, Dworzec Autobusowy",
          { FlixBus: "1234", Peron: "5" },
          undefined,
          undefined,
          [],
          { lat: 51.0988, lng: 17.0385 },
        ),
        new ScheduleStop(
          "fx-s2",
          "bus",
          "09:00",
          "Przyjazd",
          "Poznań, Dworzec Autobusowy",
          { Peron: "2" },
          undefined,
          undefined,
          [],
          { lat: 52.4025, lng: 16.9125 },
        ),
      ],
      [
        new JournalEntry(
          "j-fx1",
          "fx-s1",
          "2024-11-08",
          "W trasie",
          "07:30",
          "Autobus jedzie autostradą A2 — widok z okna na równinę Wielkopolski.",
          "sight",
          [],
          0,
        ),
      ],
      new Date("2024-11-08"),
      [],
    )

    this.trips = [
      flixWroclawPoznan,
      europeanTrip,
      amalfiTrip,
      baliTrip,
      tromsoTrip,
    ]

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
    return this.trips[0]
  }

  getJournalTrips(): UserTrip[] {
    return [...this.trips]
  }

  getTripById(id: string): UserTrip | undefined {
    return this.trips.find((trip) => trip.id === id)
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

  getPlanningTrips(): UserTrip[] {
    return this.trips.filter((trip) => !trip.isFinalized)
  }

  createPlanningTrip(): UserTrip {
    const id = `trip-plan-${Date.now()}`
    const trip = new UserTrip(
      id,
      `plan-${Date.now()}`,
      "Nowa podróż",
      IMG.street,
      "Planowanie",
      "Trasa w przygotowaniu — dodaj przystanki Flixbus.",
      ["#PLANOWANIE"],
      new Date(),
      [],
      [],
      [],
      null,
      [],
    )
    this.trips.unshift(trip)
    this.plannerDrafts.set(id, [])
    return trip
  }

  getPlannerLegs(tripId: string): PlannerRouteLeg[] {
    const draft = this.plannerDrafts.get(tripId)
    if (draft) {
      return draft.map((leg) => ({ ...leg }))
    }

    const trip = this.getTripById(tripId)
    if (!trip || trip.isFinalized || trip.scheduleStops.length === 0) {
      return []
    }

    return tripStopsToPlannerLegs(trip.scheduleStops)
  }

  savePlannerLegs(tripId: string, legs: PlannerRouteLeg[]): void {
    const trip = this.getTripById(tripId)
    if (!trip || trip.isFinalized) return

    const copy = legs.map((leg) => ({ ...leg }))
    this.plannerDrafts.set(tripId, copy)

    const { scheduleStops, routeLegs, mapPath } = plannerLegsToTripRoute(copy)
    trip.scheduleStops = scheduleStops
    trip.legs = routeLegs
    trip.mapPath = mapPath

    if (copy.length > 0) {
      const first = copy[0]!
      const last = copy[copy.length - 1]!
      trip.name =
        copy.length === 1
          ? `Podróż: ${first.cityLabel}`
          : `${first.cityLabel} → ${last.cityLabel}`
      trip.location = last.cityLabel
    }
  }

  finalizeTrip(tripId: string): boolean {
    const trip = this.getTripById(tripId)
    if (!trip || trip.isFinalized) return false

    const legs = this.getPlannerLegs(tripId)
    if (legs.length < 2) return false

    this.savePlannerLegs(tripId, legs)
    trip.finalize()
    this.plannerDrafts.delete(tripId)
    return true
  }
}
