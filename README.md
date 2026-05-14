# Briskly

**Fullstack Duo**

- Michał Banaszkiewicz  
- Dawid Błaszczyk

---

## 1) Słowny opis wybranego tematu oraz charakterystyka problemów do rozwiązania

### Charakterystyka ogólna

Projekt „Briskly” to aplikacja webowa realizująca dwa główne cele: **optymalizację logistyczną złożonych podróży** (z uwzględnieniem **sugerowanych destynacji** pod kątem **atrakcyjności lokacji**) oraz **cyfrową archiwizację doświadczeń turystycznych**. System dedykowany jest użytkownikom planującym trasy wieloetapowe, wymagające precyzyjnej synchronizacji czasowej oraz sprawnego zarządzania dokumentacją multimedialną z przebiegu wyprawy.

#### Moduł logistyczny i planowanie strukturalne

Moduł logistyczny ma na celu **rozbudowę logiki biznesowej wyszukiwarki połączeń**, aby umożliwić **sugerowanie destynacji do zwiedzenia** na podstawie atrakcyjności lokacji, czasu i miejsca startu. Użytkownik może też **złożyć plan z kilku połączeń w jednym miejscu**, zamiast **długo układać wszystko ręcznie w edytorze tekstowym**. Wielu rozwiązań na rynku **nie łączy** aktualnych **danych od przewoźników** z **budowaniem rozbudowanych planów podróży**.

**Od strony technicznej** moduł pomaga **ograniczać błędy** przy planowaniu **złożonych tras** poprzez:

- **Sugestie destynacji:** ranking lub podpowiedzi miejsc do zwiedzenia **według atrakcyjności lokacji**, spięte z punktem startu, czasem podróży i dostępnością połączeń.
- **Wyszukiwanie relacyjne:** mechanizm wyszukiwania miast oraz bezpośrednich połączeń transportowych.
- **Algorytm synchronizacji czasu:** automatyczne przeliczanie parametrów czasowych z uwzględnieniem zmian stref czasowych, zapewniające spójność harmonogramu w skali globalnej.
- **Zarządzanie oknami czasowymi:** definiowanie maksymalnego interwału oczekiwania i filtrowanie połączeń pod kątem preferowanego tempa podróży.
- **Sekwencyjne budowanie etapów:** składanie odcinków w jedną, chronologiczną strukturę wycieczki.

#### Moduł dokumentacji i personalizacji

Warstwa funkcjonalna odpowiedzialna za gromadzenie danych subiektywnych i materiałów wizualnych z poszczególnych węzłów podróży.

- **Profilowanie stacji/punktów trasy:** dedykowana przestrzeń na dane (meta-opisy) dla kolejnych etapów.
- **Zarządzanie treścią multimedialną:** asocjacja plików graficznych z lokalizacjami i etapami podróży wraz z komentarzami autorskimi.
- **Archiwizacja doświadczeń:** tworzenie narracyjnych wpisów (dzienników) zintegrowanych z technicznym planem wycieczki.

#### Moduł wizualizacji danych i interakcji

Warstwa odpowiedzialna za agregację danych historycznych oraz mechanizmy prezentacji i udostępniania zasobów.

- **Zatwierdzanie i wersjonowanie:** finalizacja planu generująca stały, interaktywny podgląd wycieczki do celów udostępniania zewnętrznego.
- **Globalna Mapa Wspomnień:** widok mapy nakładający historyczne trasy użytkownika na wspólny model geograficzny; umożliwia analizę zasięgu podróży oraz wizualizację „siatki połączeń życiowych” w formie graficznej.

### Charakterystyka problemów implementacyjnych

#### 1. Integralność czasowa w środowisku wielostrefowym

Konieczne jest opracowanie mechanizmu zapewniającego spójność chronologiczną planu przy przemieszczaniu się między różnymi strefami czasowymi. Wymaga to ujednolicenia zapisu dat i godzin w bazie oraz ich przeliczania na czas lokalny dla każdego etapu podróży.

#### 2. Relacyjne powiązanie danych strukturalnych z obiektami multimedialnymi

Należy zaprojektować strukturę bazy umożliwiającą trwałe powiązanie technicznych parametrów trasy z zasobami tworzonymi przez użytkownika, w szczególności relacyjność między konkretnym punktem podróży a przypisanymi do niego zdjęciami i opisami.

#### 3. Wydajność wizualizacji przestrzennej na mapie zbiorczej

Przy prezentacji wszystkich odbytych podróży pojawia się problem renderowania dużej liczby obiektów geograficznych, przy znacznym nagromadzeniu tras może dochodzić do spadku płynności działania aplikacji.

#### 4. Wersjonowanie stanów i bezpieczne udostępnianie

Trzeba zdefiniować przejście podróży z fazy edycji do fazy archiwalnej. Kluczowe jest wprowadzenie mechanizmu blokady danych uniemożliwiającego przypadkową zmianę już zrealizowanego planu oraz model bezpiecznego udostępniania osobom trzecim podglądu wycieczki bez możliwości edycji.

#### 5. Model atrakcyjności lokacji i spójność z logistyką

**Sugerowanie destynacji** wymaga **źródeł i reguł oceny atrakcyjności** (np. dane zewnętrzne, proste wagi, preferencje użytkownika) oraz **powiązania ich z realnymi połączeniami**.

### Kontekst konkurencyjny

- **Logistyka + sens podróży:** typowe wyszukiwarki rozkładów skupiają się na **dojściu z A do B**; Briskly dodaje warstwę **sugerowania destynacji do zwiedzenia** wg **atrakcyjności lokacji** i kontekstu (start, czas).
- **Spójność logistyczna i narracyjna:** jeden system łączy wyszukiwanie połączeń, **układanie kilku etapów**, sugestie miejsc oraz warstwę wspomnień.
- **Świadome planowanie w czasie:** strefy czasowe i okna transferowe w jednym modelu harmonogramu.
- **Archiwum podróży w jednym miejscu:** historia wycieczek i „mapa wspomnień” zamiast rozproszenia po plikach.

---

## 2) Zakres funkcjonalny systemu

### 1. Zarządzanie kontem i profilem użytkownika

- **Rejestracja i autoryzacja:** tworzenie konta, logowanie, bezpieczna sesja lub token. Planowane jest także **logowanie SSO** z wykorzystaniem **Google Identity**.
- **Personalizacja profilu:** preferencje podróżnicze (np. preferowane tempo przesiadek).
- **Statystyki podróżnika:** podsumowania w rodzaju liczby zrealizowanych wypraw, odwiedzonych krajów, czy też przebytych odcinków na podstawie danych zapisanych w systemie.

### 2. Moduł planowania logistycznego

- **Sugestie destynacji do zwiedzenia** na podstawie **atrakcyjności lokacji** oraz kontekstu (miejsce i czas startu, ewentualnie preferencje użytkownika), **powiązane z dostępnymi połączeniami**.
- **Wyszukiwanie miast** z podpowiedziami i ograniczeniem liczby wyników.
- **Wyszukiwanie bezpośrednich połączeń** z wybranego miasta dla wskazanej daty i godziny, z uwzględnieniem strefy czasowej i maksymalnego czasu oczekiwania.
- **Tworzenie i przegląd listy wycieczek** użytkownika, **podgląd szczegółów** pojedynczej wycieczki, **usuwanie** wycieczki.
- **Uzupełnianie metadanych wycieczki** po zebraniu odcinków (m.in. nazwa, zakres dat, miniatura wyliczana z odwiedzanych miejsc).
- **Lista odcinków** przypisanych do wycieczki, **dodawanie odcinka**, **podgląd i usunięcie** pojedynczego odcinka.

### 3. Moduł dokumentacji i dziennika podróży

- **Multimedialny notatnik:** komentarze i notatki przywiązane do etapu trasy.
- **Repozytorium mediów:** przesyłanie zdjęć do konkretnego punktu.
- **Dziennik narracyjny:** układanie wpisów w spójną opowieść zsynchronizowaną z osią czasu wyprawy.

### 4. Wizualizacja i archiwizacja

- **Lista wycieczek** jako proste **archiwum planów**.
- **Interaktywna mapa globalna:** zbiorcze wyświetlanie odbytych tras i „siatki połączeń”.
- **Filtrowanie historyczne:** przegląd według dat lub regionów.
- **Tryb archiwalny:** zamrożenie zakończonej podróży i blokada edycji logistycznej w celu ochrony integralności wspomnień.

### 5. Udostępnianie i interakcje społeczne

- **Publiczny podgląd wycieczki:** unikalny identyfikator lub link umożliwiający osobom trzecim przegląd bez edycji.
- **Eksport:** wygenerowanie podsumowania w formie czytelnej offline (np. PDF z planem i materiałami graficznymi).

---

## 3) Repozytorium kodu i pipeline CI

**Repozytorium:** prace projektowe będą prowadzone są w repozytorium **Git** na **GitHub**. Planujemy dodać pipeline CI.

### Główne elementy pipeline CI

- **Linting:**
  - **Django:** Flake8 lub Ruff.
  - **React:** ESLint oraz Prettier (spójność kodu JavaScript/TypeScript).
- **Build check:** automatyczna próba zbudowania projektu przy każdym PR, aby wykryć błędy konfiguracji i brakujące zależności (np. w `requirements.txt` lub `package.json`) przed scaleniem zmian.

---

## 4) Opis projektowanego systemu oraz diagramy procesów (BPMN)

System Briskly składa się z **warstwy API (backend)**, **warstwy prezentacji (frontend SPA)** oraz **warstwy danych** obejmującej import **GTFS**, modele planu użytkownika oraz (docelowo) multimedia przy przystankach. Zamiast osobnych diagramów **UML** (np. diagramów klas na tym etapie), w sprawozdaniu przyjęto **diagramy BPMN** dwóch kluczowych procesów biznesowych — zgodnie z ustaleniami projektowymi zastępują one formalny pakiet UML w zakresie wizualizacji dynamiki systemu.

### Proces 1: Budowa planu wycieczki z odcinków komunikacji

Proces odpowiada **rdzeniowi modułu logistycznego**: użytkownik zbiera **UserTripConnection** w ramach **UserTrip**, korzystając z danych **GTFS** (Trip, StopTime, Stop) oraz powiązań czasu i stref.

**Diagram BPMN (collaboration, User — System):** interakcja przy pierwszym utworzeniu tripu w aplikacji — od uruchomienia po zapis planu.

![Diagram BPMN — tworzenie tripu w aplikacji](BPMN.png)

```mermaid
flowchart TB
  subgraph SYS[System Briskly – warstwa aplikacji]
    direction TB
    start1((Start))
    start1 --> A[Utworzenie lub wybór rekordu UserTrip]
    A --> B[Wybór przystanku startu / miasta]
    B --> C[Wyszukanie dostępnych kursów Trip i godzin StopTime]
    C --> D{Zapisano wybrane połączenie jako UserTripConnection?}
    D -->|Nie| E[Dostosowanie daty/czasu i strefy dla etapu]
    E --> C
    D -->|Tak| F{Kolejny etap planu?}
    F -->|Tak| B
    F -->|Nie| G[Uzupełnienie metadanych UserTrip np. nazwa, zakres dat]
    G --> end1((Koniec))
  end

  subgraph ZEW[Źródła zewnętrzne – na razie w bazie GTFS]
    direction TB
    C -.->|odczyt| GTFS[(Route Trip Stop StopTime Calendar)]
  end
```

### Proces 2: Sugestie destynacji według atrakcyjności i realnych połączeń

Proces łączy **modele atrakcyjności** z **faktyczną dostępnością przejazdów**, aby nie sugerować miejsc „oderwanych” od sieci transportowej.

```mermaid
flowchart TB
  subgraph U[Użytkownik]
    direction TB
    s2((Start))
    s2 --> P1[Podanie kontekstu: start, czas, preferencje]
    P1 --> P2[Żądanie listy sugestii destynacji]
  end

  subgraph B[System Briskly]
    direction TB
    Q1[Pobranie przystanków i atrakcji w zasięgu StopAttraction]
    Q1 --> Q2[Filtrowanie po dostępnych Trip / StopTime dla wybranego okna]
    Q2 --> Q3{Brama: czy atrakcja ma sens logistycznie?}
    Q3 -->|Nie| Q4[Pomiń lub obniż ranking]
    Q3 -->|Tak| Q5[Ranking według importance / odległości / reguł]
    Q4 --> Q5
    Q5 --> Q6[Zwrot uporządkowanej listy destynacji]
    Q6 --> e2((Koniec))
  end

  P2 --> Q1
```

---

## 5) Spis ekranów wraz z makietami (mockupy)

| Lp. | Ekran / widok | Krótki opis | Makieta |
|-----|----------------|-------------|---------|
| 1 | Logowanie i rejestracja | Formularze uwierzytelnienia użytkownika | *(do wstawienia)* |
| 2 | Lista wycieczek (dashboard) | Archiwum planów użytkownika, wejście w szczegóły | *(do wstawienia)* |
| 3 | Wyszukiwarka: miasta i kontekst wyjazdu | Zapytanie o miasto startu, datę, godzinę, strefę, okno oczekiwania | *(do wstawienia)* |
| 4 | Wyniki sugestii destynacji | Lista destynacji z czasem przejazdu i „pkt atrakcyjności” | *(do wstawienia)* |
| 5 | Szczegóły wycieczki | Nazwa, daty, miniatura, lista odcinków | *(do wstawienia)* |
| 6 | Dodawanie / edycja odcinka | Wybór przystanków, czasów, powiązanie z kursami GTFS | *(do wstawienia)* |
| 7 | Harmonogram / oś czasu | Wizualizacja kolejnych etapów i przesiadek | *(do wstawienia)* |
| 8 | Dziennik przy przystanku | Opis, notatki, zdjęcia po zatwierdzeniu wycieczki | *(do wstawienia)* |
| 9 | Mapa wspomnień | Zbiorcza mapa historycznych tras | *(do wstawienia)* |
| 10 | Publiczny podgląd wycieczki | Widok tylko do odczytu dla linku udostępnionego | *(do wstawienia)* |
| 11 | Profil / ustawienia | Preferencje podróży, statystyki | *(do wstawienia)* |

---

## 6) Wybór i opis architektury aplikacji wraz z uzasadnieniem (MVC, MVVM itd.)

### 1. Architektura rozdzielona (klient–serwer z wyraźnym API)

**Co przyjmujemy:** backend i frontend jako **oddzielne warstwy**, komunikujące się przez **udokumentowane API**.

**Dlaczego:** tak można **równolegle** projektować endpointy i interfejs, testować API oraz w przyszłości podłączyć **innego klienta** (np. aplikację mobilną) bez przebudowy całej logiki po stronie serwera.

### 2. Warstwa serwera w układzie MTV (Model, Template, View)

**Co przyjmujemy:** po stronie serwera podział na **model** (dane i reguły biznesowe), **widoki** obsługi żądań oraz warstwę odpowiadającą za **prezentację wobec klienta**. Przy aplikacji API rolę „szablonu” pełnią zwykle **serializowane odpowiedzi** (np. JSON), a nie statyczny HTML.

**Dlaczego:** układ **MTV** porządkuje kod serwera przy rozbudowanej domenie (wycieczki, odcinki, multimedia, logistyka, reguły sugestii destynacji) i oddziela **trwałe modele** od **sposobu wystawienia danych** na zewnątrz.

### 3. Klient oparty o komponenty i stan (bogaty klient / SPA)

**Co przyjmujemy:** interfejs jako zestaw **komponentów UI** z **lokalnym lub globalnym stanem**, działający jako **aplikacja jednostronicowa**: zmiany planu, mapy i list odświeżają wybrane fragmenty widoku, zamiast przeładowywać całą stronę przy każdej akcji.

**Dlaczego:** Briskly wymaga **intensywnej interakcji** (mapa, harmonogram wielu połączeń, filtry czasu, sugestie destynacji). Model „bogatego klienta” jest do tego **naturalnym dopasowaniem**; inspiracja **MVVM** (rozdział stanu od widoku) realizuje się tu przez **komponenty i przepływ danych**, bez narzucania konkretnej biblioteki w tym punkcie.

### 4. Podsumowanie uzasadnienia

Łącznie: **rozdzielony system**, **serwer w konwencji MTV**, **klient komponentowy z API REST** daje spójny obraz zgodny z wymaganiami projektu i ułatwia podział pracy oraz utrzymanie kodu w małym zespole.

---

## 7) Propozycja schematu bazy danych (diagram ER)

Schemat składa się z **warstwy GTFS i planu podróży** oraz **planowanego rozszerzenia** pod **dokumentację wizyt przy przystankach** (zdjęcia, notatki, opisy) po **zatwierdzeniu wycieczki**.

### Diagram związków encji (ER)

```mermaid
erDiagram
    City ||--o{ Place
    Place ||--o{ Stop
    Route ||--o{ Trip
    Calendar ||--o{ Trip
    Calendar ||--o{ CalendarDate
    Trip ||--o{ StopTime
    Stop ||--o{ StopTime
    Stop ||--o{ StopAttraction
    Attraction ||--o{ StopAttraction
    UserTrip ||--o{ UserTripConnection
    Trip ||--o{ UserTripConnection
    Stop ||--o{ UserTripConnection
    UserTrip ||--o{ TripStopJournalEntry
    Stop ||--o{ TripStopJournalEntry
    UserTripConnection |o--o{ TripStopJournalEntry
    TripStopJournalEntry ||--o{ TripStopPhoto

    City {
        string city_id PK
        string city_name
        float city_lat
        float city_long
        string city_timezone
    }

    Place {
        string place_id PK
        string place_name
        float place_importance
        string place_type
    }

    Stop {
        string stop_id PK
        string stop_name
        float stop_lat
        float stop_lon
        string stop_timezone
    }

    Route {
        string route_id PK
        string route_short_name
    }

    Calendar {
        string service_id PK
        date start_date
        date end_date
    }

    Trip {
        string trip_id PK
    }

    StopTime {
        int stop_time_id PK
        string arrival_time
        string departure_time
        int stop_sequence
    }

    Attraction {
        string attraction_id PK
        string attraction_name
        float attraction_lat
        float attraction_lon
    }

    CalendarDate {
        date date
        int exception_type
    }

    StopAttraction {
        int distance_meters
    }

    UserTrip {
        string slug UK
        string name
        date start_date
        date end_date
        datetime finalized_at
    }

    UserTripConnection {
        int id PK "implicit"
        string timezone
        date departure_date
        time departure_time
        int duration_total
    }

    TripStopJournalEntry {
        int id PK
        text user_description
        text user_note
        datetime created_at
        datetime updated_at
    }

    TripStopPhoto {
        int id PK
        string image_url
        int sort_order
        string caption
        datetime created_at
    }
```

### Opis ról tabel (skrót)

| Tabela | Rola |
|--------|------|
| **City**, **Place**, **Stop** | Słownik geografii i przystanków; **Stop** jest punktem styku z rozkładem GTFS i z **UserTripConnection**. |
| **Route**, **Calendar**, **CalendarDate**, **Trip**, **StopTime** | Import i model **GTFS**: linie, **kalendarz kursowania** i **wyjątki** (**CalendarDate**), kursy (**Trip**) oraz **godziny przyjazdów/odjazdów** na przystankach (**StopTime**). |
| **Attraction**, **StopAttraction** | **Atrakcyjność destynacji** i powiązanie atrakcji z przystankami (np. odległość), pod proces sugestii. |
| **UserTrip** | **Plan wycieczki użytkownika** (nazwa, daty, **slug**). Rozszerzenie koncepcyjne: znacznik **zatwierdzenia** (np. **`finalized_at`**), po którym sensowne jest **trwałe** dopisywanie treści przy przystankach i **tryb archiwalny** z dokumentu. |
| **UserTripConnection** | **Pojedynczy odcinek** planu: start/koniec (**Stop**), czasy, czasy trwania, opcjonalne powiązanie z **Trip** GTFS. |
| **TripStopJournalEntry** | **Kontekst „ta wycieczka + ten przystanek”**: **opis** i **notatki** użytkownika. Opcjonalnie **UserTripConnection**. Treści po **zatwierdzeniu** planu. |
| **TripStopPhoto** | **Zdjęcia** przy wpisie dziennika, kolejność i podpis. |

---

## 8) Propozycja stosu technologicznego

### Backend: Django (MTV)

Django formalnie stosuje wzorzec MTV (Model, Template, View), zbliżony do klasycznego MVC:

- **Model:** warstwa danych i logiki biznesowej (**PostgreSQL** w **Supabase**): struktura wycieczek, odcinków, multimedia. W module logistycznym także reguły **oceny atrakcyjności lokacji**, **sugestii destynacji** oraz powiązanie z **terminami połączeń**.
- **Template:** w miejsce szablonów HTML zwracane są odpowiedzi **JSON** generowane przez **Django REST Framework**.
- **View:** logika obsługi żądań HTTP, komunikacja z modelami, zwracanie danych do klienta.

**Uzasadnienie:** Django dostarcza zwarty zestaw narzędzi (ORM, autoryzacja, panel administracyjny), co skraca budowę stabilnego modułu logistycznego i warstwy API.

### Frontend: React (komponenty i stan)

- **Komponenty:** niezależne, wielokrotnego użytku części interfejsu (np. etap trasy, lista połączeń, fragment mapy).
- **Stan aplikacji:** lokalnie (`useState`, `useContext`) lub globalnie (np. Redux, Zustand), aby interfejs natychmiast reagował na zmianę dat, filtrów lub wyboru destynacji.

**Uzasadnienie:** Widok Briskly jest **silnie interaktywny**: składanie wielu połączeń, harmonogram, mapa i **sugestie destynacji** wymagają częstych, punktowych aktualizacji **bez przeładowywania strony**. React dobrze to wspiera, a szeroki ekosystem bibliotek (mapy, formularze, kalendarze) przyspiesza implementację i utrzymanie frontendu w małym zespole.

### Komunikacja: RESTful API

Warstwy łączy **Django REST Framework**. API jest **bezstanowe (stateless)**. Każde żądanie z Reacta zawiera informacje potrzebne do obsługi (np. token JWT).

### Dane i tożsamość

- **Baza danych:** **PostgreSQL** hostowany w **Supabase**.
- **Uwierzytelnianie:** obok klasycznego konta w aplikacji przewidziane jest **SSO przez Google Identity** (logowanie kontem Google), zgodnie z zakresem modułu konta w sekcji funkcjonalnej.

### Uzasadnienie architektury hybrydowej

Podział backend / frontend wynika z wymagań projektu:

- **Mapa i harmonogram:** pełne renderowanie stron po stronie serwera (SSR) byłoby mało wygodne przy „Globalnej Mapie Wspomnień” i dynamicznym planie, a React umożliwia płynną pracę na mapie i na osi czasu.
- **Praca równoległa:** rozdział warstw pozwala równocześnie rozwijać endpointy API i interfejs na podstawie uzgodnionej dokumentacji.
- **Skalowalność:** REST ułatwia późniejsze podłączenie aplikacji mobilnej korzystającej z tego samego backendu.
- **Multimedia:** **Django Storage** i obsługa plików po stronie serwera, w połączeniu z przesyłaniem zdjęć z Reacta, wspierają wygodne tworzenie dziennika podróży.

---

## 9) Diagramy sekwencyjne (Mermaid) — scenariusze testowe Briskly

Poniższe diagramy modelują interakcje **użytkownika** z głównymi **widokami aplikacji** oraz uproszczoną warstwą **danych** (propozycje połączeń, zapis tripu), zgodnie z opisanymi testami.

---

### Test 1 — Dodawanie nowego tripu

**Wstęp:** baza tripów i connections jest pusta; tworzony jest nowy plan podróży.

```mermaid
sequenceDiagram
    autonumber
    actor U as Użytkownik
    participant App as Aplikacja
    participant Exp as Explore
    participant Map as Mapa
    participant Sum as Podsumowanie
    participant Idx as Lista tripów
    participant DB as Baza

    U->>App: Start
    App->>Exp: Ekran Explore
    Exp-->>U: Formularz wyjazdu

    U->>Exp: Szukanie Wro i wybór daty
    Exp-->>U: Wrocław jako start

    U->>Exp: Odkryj miejsca
    Exp->>Map: Mapa z sugestiami
    Map->>DB: Propozycje dla nowego planu
    DB-->>Map: Lista miast
    Map-->>U: Kafelki

    U->>Map: Wybór Gliwic
    Map-->>U: Szczegóły miasta

    U->>Map: Dodaj do tripu
    Map->>Sum: Podsumowanie
    Sum-->>U: Plan z dwoma miastami

    U->>Sum: Zapisz
    Sum->>DB: Zapis planu
    DB-->>Sum: OK
    Sum->>Idx: Lista tripów
    Idx-->>U: Nowy trip na liście
```

---

### Test 2 — Dodanie nowego miasta do istniejącego tripu

**Wstęp:** w bazie jest trip „Wrocław and Gliwice”.

```mermaid
sequenceDiagram
    autonumber
    actor U as Użytkownik
    participant App as Aplikacja
    participant Idx as Lista tripów
    participant Sum as Podsumowanie
    participant Map as Mapa
    participant DB as Baza

    U->>App: Start
    App->>DB: Odczyt tripów
    DB-->>App: Jest trip Wrocław i Gliwice
    App->>Idx: Lista
    Idx-->>U: Widać zapisany plan

    U->>Idx: Otwarcie tripu
    Idx->>Sum: Szczegóły
    Sum->>DB: Dane planu
    DB-->>Sum: Dwa etapy
    Sum-->>U: Podsumowanie trasy

    U->>Sum: Więcej destynacji
    Sum->>Map: Mapa z sugestiami
    Map->>DB: Propozycje z ostatniego miasta
    DB-->>Map: Nowe miejsca
    Map-->>U: Kafelki na mapie

    U->>Map: Inna data i godzina
    Map->>DB: Świeże propozycje
    DB-->>Map: Zaktualizowana lista
    Map-->>U: Nowe kafelki

    U->>Map: Wybór Berlina
    Map->>Sum: Powrót do podsumowania
    Sum->>DB: Zapis planu z trzema miastami
    DB-->>Sum: OK
    Sum-->>U: Rozszerzony trip
```

---

### Uwagi do notacji

- **Router / Aplikacja** grupuje nawigację między widokami zgodnie z krokami testów.
- **Baza (trips, connections)** reprezentuje trwałość danych: zapis po „Save This Trip”, odczyt przy starcie i przy ładowaniu propozycji — dokładny podział na endpointy zależy od implementacji, ale przepływ logiczny odpowiada efektom opisanym w testach.
