# HANDOVER: nie wysyłaj tego pliku klientowi

To notatka dla Ciebie. Przed wysłaniem strony **usuń ten plik** albo wrzuć
cały folder do ZIP-a bez niego.

---

## Co tu jest

| Plik | Co to |
|---|---|
| `index.html` | **Jedyna** strona. Ciemna lub jasna zależnie od ustawień urządzenia |
| `styles.css` | Jeden arkusz. Ciemny motyw w `:root`, jasny w `[data-theme="light"]` |
| `script.js` | Cała logika. **Wszystkie dane firmy są na górze w `CONFIG`** |
| `assets/` | Zdjęcia + favicon + obraz do social mediów |
| `original-draft.html` | Twój oryginalny szkic. Nie wysyłaj. |

Nie ma już dwóch wersji. Motyw ustawia się automatycznie:

- mały skrypt w `<head>` ustawia `data-theme` **przed** pierwszym renderem,
  więc strona nigdy nie mignie biało
- `script.js` nasłuchuje `prefers-color-scheme`, więc zmiana motywu w systemie
  działa natychmiast
- `T` to podgląd na żywo, nie zapisuje się nigdzie
- `?theme=light` albo `?theme=dark` w adresie wymusza wariant

---

## Kierunek: drukowane sprawozdanie, nie landing page

Strona celowo nie wygląda jak szablon. Nie ma wyśrodkowanego hero, nie ma trzech
kart obok siebie, nie ma gradientów i zaokrągleń. Jest gazeta:

- **Masthead** nad pierwszym zdjęciem, z jedną linią daty i odległości
- **Bodoni Moda** na nagłówkach, **Newsreader** na tekście, **IBM Plex Mono**
  na każdej etykiecie, cenie i dacie. Trzy kroje, każdy z jedną robotą
- **Jeden przygaszony akcent**: `--acc`, wyblakły kadm. Nic więcej nie jest kolorowe
- **Linie zamiast kafelków**: `.ledger` (fakty), `.sheets` (zabiegi),
  `.mx` (cennik), `.cred` (kwalifikacje), `.contact` (kontakt sheet)
- **Biegnący pasek** `.ticker` z nazwami usług
- **Bez liczników.** Żadnych `01 Masaż`, `02 Cennik`, `Plate 01`, `sheet__no`.
  Klient nie potrzebuje numeracji, a puste miejsce w lewym marginesie tylko
  zaburzało siatkę. Jeśli dodajesz sekcję, nadaj jej `id` i weź styl
  z istniejących, zamiast nowego wzoru.
- **Bez podpisów pod zdjęciami.** Zdjęcie mówi samo za siebie. Opis zostaje
  tylko w `alt`, żeby czytnik ekranowy i wyszukiwarka miały tekst.
- **Bez pieczęci z oceną.** Kadm w kółku wychodził jako plama i kradł
  uwagę zdjęciu. Ocena jest pierwszym wierszem `.ledger--hero`, czyli
  faktem obok "Doświadczenie" i "Godziny", a nie plakatem.

Jeśli dodajesz sekcję, nadaj jej `id` i styl z istniejących, zamiast nowego
wzoru. Wtedy strona dalej wygląda na jedną rzecz, a nie na skleik.

---

## Zmiana treści: jeden plik

Wszystko, co klient zobaczy, jest generowane z `CONFIG` na początku
`script.js`. Zmiana danych to edycja **jednego miejsca**.

```js
const CONFIG = {
  name: 'Adam Kowalski',
  phone: '+48501827364',
  whatsapp: '48501827364',      // do wa.me, bez + i bez spacji
  email: 'kontakt@masazadamakowalski.pl',
  domain: 'https://masazadamakowalski.pl',
  city: 'Gdańsk',
  cities: ['Gdańsk', 'Sopot', 'Gdynia'],
  districts: ['Wrzeszcz', 'Zaspa', ...],
  nearby: 'do 30 km od centrum',
  rating: '4,9', reviewCount: 340, yearsActive: 8, sessions: 1200,
  durations: [60, 90, 120],        // długości na skali czasu
  defaultDuration: 90,
  treatments: [                    // MUSI zgadzać się z tabelą #matrix
    { id: 'klasyczny', name: 'Masaż klasyczny', price: { 60: 180, 90: 240, 120: 300 } },
    { id: 'kamienie',   name: 'Kamienie i ciepło', price: { 60: 200, 90: 260, 120: 330 } },
    { id: 'sportowy',   name: 'Masaż sportowy',    price: { 60: 210, 90: 280, 120: 350 } }
  ],
  defaultTreatment: 'klasyczny',
  slots: {                    // okna, w których przyjmuje
    0: null,                  // 0 = niedziela, null = zamknięte
    6: [[10, 14]],            // 6 = sobota
    default: [[10, 13], [15, 18], [19, 21]]   // poniedziałek do piątku
  },
  hours: [...], reviews: [...], faq: [...]
};
```

Po edycji wystarczy **odświeżyć stronę**, nic nie jest zaszyte w HTML-u.

### Cennik żyje w dwóch miejscach, pilnuje tego test

Tabela `#matrix` w `index.html` jest tym, co klient widzi i co klika.
`CONFIG.treatments` jest tym, co wycenia rezerwację. `id` w `data-t` musi się
zgadzać z `id` w `CONFIG`, a ceny muszą być te same, bo `verify.py` porównuje
jedno z drugim i z JSON-LD.

### Co NIE jest w CONFIG (trzeba poprawić ręcznie w `index.html`)

- `<title>`, `<meta name="description">`, `canonical`, `og:*`
- JSON-LD w `<head>`: telefon, e-mail, domena, godziny, cennik, `areaServed`
- `<meta name="theme-color">`: `#13110f` dla ciemnej, `#efe9dd` dla jasnej
- tabela `#matrix` wraz z nagłówkiem (patrz wyżej)
- stopka: NIP, e-mail, rok

### Jedno miejsce, które łatwo rozjechać

Pytania FAQ są w **dwóch** miejscach: `CONFIG.faq` (to, co klient widzi)
i w `FAQPage` w JSON-LD (to, co czyta Google). Pytania muszą brzmieć identycznie,
inaczej strukturalne dane będą nieprawdziwe. `verify.py` to pilnuje:

```
python3 /tmp/opencode/verify.py
```

---

## Pierwsza osoba

Teksty mówią "przyjeżdżam", "przywożę", "odpowiadam". Nie ma zdań w trzeciej
osobie typu "Adam zrobi", bo brzmią jak ulotka agencycji. Nazwa "Adam Kowalski"
zostaje tylko tam, gdzie jest tożsamość firmy: logo, nagłówek "Nazywam się",
dane strukturalne, stopka. `verify.py` łapie wrota do trzeciej osoby.

Gwarancji nie ma. Blok "druga sesja za darmo" i `CONFIG.guarantee` zostały
usunięte, bo to obietnica, której nie da się wyegzekwować bez negocjacji.
Przeciwwskazania w FAQ zostały, te zostaw.

---

## Kalendarz i cennik

Silnik wolnych terminów: `daySlots()` generuje godziny dla jednego dnia,
`rebuildSlots()` rysuje listę dni i godzin, `collectSlots()` to płaska lista
na potrzeby testów.

| Element | Gdzie |
|---|---|
| `SPANS = [1, 2, 4]` | ile tygodni pokazuje przycisk "Pokaż kolejne tygodnie" |
| `HORIZON = 8` | ile tygodni w przód widać (potem przycisk się wyłącza) |
| `cal.span`, `cal.offset` | stan: szerokość widoku i przesunięcie w tygodniach |
| `CONFIG.slots` | okna godzinowe, `null` oznacza dzień zamknięty |
| `state.min`, `state.treatment` | co klient wybrał na skali czasu i w cenniku |

Godziny w przeszłości nigdy się nie pokazują, niedziela jest zawsze wyłączona,
a dzień bez wolnych godzin pokazuje "brak wolnych" zamiast pustego okna.
Wybrana godzina składa gotową wiadomość na WhatsApp i numer do telefonu,
więc klient tylko klika "wyślij". Zmiana zabiegu albo długości **przelicza cenę
przy już trzymanej godzinie**, bo `renderOut()` woła `priceFor()`.

Siatka dni to `repeat(7, 1fr)`, a poniżej 700 px `repeat(4, 1fr)`, czyli cztery
plus trzy. Świadomie: siedem nigdy nie dzieli się równo, a sierota rozciąga się
na całą szerokość i wygląda jak błąd.

Pod `.day em` ("3 terminy", "brak wolnych") jest `aria-label` z pełną datą,
więc kiedy `em` znika na telefonie, czytnik nadal czyta "piątek, 2 października,
3 wolne terminy".

---

## Zdjęcia: szybka podmiana

Otwórz stronę i naciśnij **klawisz `E`**. Wejdą pomarańczowe obwódki
i klikniesz w każde zdjęcie, żeby wstawić własne. Podmiana działa w sesji
przeglądarki, nie zapisuje się do pliku.

Na stałe: nadpisz pliki w `assets/` zachowując nazwy albo zmień `src`.

**Ważne przed wysyłką:** zdjęcia są stockowe (Pexels, darmowa licencja,
wolne do użycia komercyjnego). Klient musi wstawić swoje, szczególnie portret
w sekcji "O mnie", bo to buduje zaufanie. Dopisek w stopce "Zdjęcia
demonstracyjne: Pexels" i notka `.contact__note` mówią o tym samym, usuń je
razem po podmianie.

**Wymagane proporcje** (tak narysowany jest layout):

| Plik | Proporcje | Do czego |
|---|---|---|
| `hero.jpg` | 4:5 (`.r45`) | główne |
| `portrait.jpg` | 4:5 (`.r45`) | sekcja "O mnie" |
| `band.jpg` | 21:9 (`.r219`) | szeroka płyta na szczycie galerii |
| `relax/stones/sport.jpg` | 4:3 | arkusze zabiegów |
| `g1` do `g5` | 1:1 | pozostałe płyty kontaktowe |

Proporcje są zapisane jako `aspect-ratio` na `.ph`, więc podmiana na zdjęcie
o innym formacie nie rozwali layoutu, tylko rozciągnie kadr.

---

## Klawisze (do Twojej dyspozycji, klient ich nie zobaczy)

| Klawisz | Co robi |
|---|---|
| `E` | tryb podglądu: obwódki na zdjęciach + klik-to-replace |
| `T` | przełącza ciemny i jasny motyw na miejscu |
| `?edit=1` w adresie | startuje w trybie podglądu od razu |
| `?theme=light` / `?theme=dark` | wymusza wariant motywu |

Żadnego z tych klawiszy nie ma w interfejsie, klient ich nie znajdzie.
`data-full="assets/..."` na każdym zdjęciu w `#gallery` to wersja duża
do lightboxa; przy podmianie plików popraw też te atrybuty.

---

## Jak to wrzucić na domenę

1. Wgraj cały folder na hosting (FTP, Netlify, cPanel, cokolwiek).
2. Ustaw `index.html` jako stronę główną.
3. **Zmień `https://masazadamakowalski.pl/` na prawdziwą domenę**
   w `canonical`, `og:url` i JSON-LD.
4. Dopisz domenę do Google Search Console i załóż profil w Google Business.
   Dla lokalnego masażu to warte więcej niż wygląd strony.

Strona jest w pełni statyczna. Nie ma backendu, bazy ani formularza, więc
nie da się jej "hacknąć" i nie wymaga hostingu z PHP.

---

## Drobiazgi

- **Dane demonstracyjne.** Nazwa, numer telefonu, adres e-mail, opinie,
  certyfikaty i statystyki (`1 200` sesji, `4,9`, `340` opinii) są **zmyślone**.
  Trzeba je podmienić, szczególnie opinie: cudze są nie fair i pod kątem prawa.
- **`aggregateRating` jest w danych strukturalnych** i pokrywa się z liczbami
  widocznymi na pieczęci przy zdjęciu głównym. Google kara wymyślone gwiazdki
  dopiero przy podpięciu realnej domeny, więc albo zbierz prawdziwe opinie
  i zostaw, albo usuń `aggregateRating` z JSON-LD oraz `data-cfg="rating"`
  i `data-cfg="reviewCount"` z HTML-a.
- **Brak gwarancji efektu medycznego.** Teksty mówią o napięciu mięśniowym
  i samopoczuciu, nie o leczeniu. Przeciwwskazania są wypisane w FAQ, zostaw je.
- **Czcionki** Bodoni Moda + Newsreader + IBM Plex Mono wczytują się
  z Google Fonts. Jeśli klient martwi się o zgodność z RODO, pobierz je
  i podepnij lokalnie.
- **Selektor `html.js-ready`.** Animacje startują dopiero po włączeniu JS,
  więc przy wyłączonym JavaScripcie cała treść jest widoczna.
- **Kontrast.** Każda użyta para kolorów przechodzi 4,5:1 w obu motywach.
  `python3 /tmp/opencode/contrast-site.py` to sprawdza. Kadm jest celowo wyblakły,
  bo poprzedni był przesycony i przebijał tekst: ciemny motyw `#d9714f`,
  jasny `#a03a1e`. Złoto też przygaszone: `#c2a267` i `#6b6142`.
  Zmiana tych wartości wymaga przeliczenia kontrastu, nie rób tego na oko.
- **Czytelność.** Treść wstała w `Newsreader` **400**, nie 300. Cienka
  waga szeryfów przy 16 px dawała tekst, którego nie dało się czytać,
  a kontrast samego koloru tego nie naprawiał.
- **Zdjęcia** mają `filter: saturate(.82) contrast(.98)`, żeby stockowe kadry
  nie ciągnęły kolorem całej strony. Zdejmij filtr, kiedy wstaną prawdziwe
  zdjęcia bez nasyconych kolorów.
- **Dostępność:** skip link, widoczny focus, pełna obsługa klawiatury w cenniku
  (strzałki na skali czasu), kalendarzu, szufladzie i lightboxie,
  `prefers-reduced-motion`, `aria-live` w kalendarzu, `aria-pressed`
  na przełącznikach.
- **Brak pauzy.** W całej stronie nie ma długiej pauzy (U+2014).
  Zakresy typograficzne (`9:00 – 21:00`) celowo zostają na en dash.

---

## Sprawdzenie przed wysyłką

```
python3 /tmp/opencode/verify.py          # assety, JSON-LD, branding, motyw, cennik, a11y
cd /tmp/opencode && node test.js         # 122 testy zachowania w jsdom
python3 /tmp/opencode/contrast-site.py   # kontrast obu motywów
/tmp/opencode/node_modules/.bin/csstree-validator \
  /home/itz_4ura/web_design/styles.css   # czysty CSS, bez outputu
```

Wszystkie cztery muszą być zielone. `test.js` uruchamia stronę naprawdę: klika
w skalę czasu i cennik, przesuwa tygodnie, rozwija widok, składa linki
do WhatsApp i pilnuje, żeby niedziela nigdy nie pokazała się jako wolna,
żeby zmiana zabiegu przeliczyła cenę, a żeby lightbox był naprawdę widoczny.

`verify.py` dodatkowo pilnuje, żeby **każda klasa użyta w HTML i JS miała styl
w `styles.css`**. Ta kontrola złapała brakujący blok `.lb` (lightbox był
w HTML, ale nie w CSS, więc otwierał się jako niewidoczna warstwa 16x6 px).

Przed wysyłką warto też spojrzeć na stronę w Chromium na 390 px i 1440 px,
w obu motywach. Wąski układ kalendarza (cztery plus trzy) i kontakt sheet
(3 kolumny, notka w siatce zamiast pod spodem) były właśnie po to,
żeby nic nie zostało wdęte w pojedynczy kafelek.
