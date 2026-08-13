# Maler Delius AS — nettside

Nettside for **Maler Delius AS**, et malerfirma i Oslo. Bygget **pikselnøyaktig**
etter Figma-designet «Redesign pagina web Malerdelius»
(fil `8VM3QkSLrwR5HwMndd5bBM`, versjonen fra 4. august 2026).

## Slik er den bygget

Designet er hentet rett fra Figma via **REST API** — eksakte posisjoner, størrelser,
farger, fonter og tekst — og alle bilder, ikoner og akvarell-søl er de **originale
filene fra designet** (`src/assets/figma/`).

- **Vite** + **React 18** + **TypeScript**, ingen CSS-rammeverk
- Fonter: **Montserrat** og **Mukta** (Google Fonts)
- Ruter: **React Router**, 5 sider

### Desktop og mobil

Figma-designet finnes bare for desktop. Derfor er siden bygget i to varianter,
med nøyaktig samme farger, fonter, bilder og tekster:

| Bredde        | Hva som vises                                                       |
| ------------- | ------------------------------------------------------------------- |
| Over 1000px   | Designet 1:1 i 1430px, skalert til skjermen av `Stage` (CSS `zoom`)  |
| 1000px og under | Egen mobil-layout i én kolonne (`src/pages/mobile/`)               |

Bryteren ligger i `src/lib/useIsMobile.ts` og brukes fra `App.tsx`.
Tekstene deles mellom variantene, så en rettelse ett sted slår gjennom begge steder.

## Kom i gang

```bash
npm install
npm run dev      # utviklingsserver (http://localhost:5173)
npm run build    # produksjonsbygg til /dist
npm run preview  # forhåndsvis bygget
```

### Utrulling

Siden ligger på **Vercel**. `vercel.json` sender alle stier unntatt `/api/*`
til `index.html` (SPA-fallback), slik at oppfriskning og delte lenker til
undersidene ikke gir 404.

## Kontaktskjemaet

Begge skjemaene (forsiden og Kontakt-siden, desktop og mobil) sender til
serverfunksjonen `api/kontakt.ts`, som legger meldingen i e-post via
[Resend](https://resend.com). `Reply-To` settes til kundens adresse, så
«Svar» i e-postklienten går rett tilbake til den som skrev.

E-posten er tegnet i designets stil: akvarellsølet og logoen øverst,
marineblå tekst, meldingen i en kremfarget boks og en gul, rund
«Svar»-knapp. Bildene ligger i `public/epost/` og hentes fra nettsiden.
Meldingene går til firmaets adresse **malerdelius@gmail.com** (styres av
`KONTAKT_TIL`).

**Miljøvariabler** (Vercel → Settings → Environment Variables, og `.env`
lokalt – se `.env.example`):

| Variabel         | Hva den er                                              |
| ---------------- | ------------------------------------------------------- |
| `RESEND_API_KEY` | Nøkkelen fra Resend                                     |
| `KONTAKT_TIL`    | Adressen(e) meldingene skal til, komma mellom flere      |
| `KONTAKT_FRA`    | Avsender, på et domene som er verifisert i Resend        |

Avsenderdomenet i Resend er underdomenet **`send.malerdelius.no`**. Da ligger
DKIM-, SPF- og bounce-postene på underdomenet, og MX-postene for
`info@malerdelius.no` hos one.com blir ikke rørt.

**Mot søppelpost:** et skjult felt (`firma`) som bare roboter fyller ut, en
sperre mot innsending under to sekunder etter at siden er lastet, og maks fem
innsendinger per IP per ti minutter. Roboter får `200 OK` og ingen e-post, så
de merker ikke at meldingen ble stoppet.

Lokalt kobler `vite.config.ts` den samme funksjonen inn som mellomvare, så
`npm run dev` oppfører seg som produksjon. Uten `RESEND_API_KEY` svarer den
med feil, og skjemaet viser feilmeldingen – det er forventet.

## Sider

| Rute              | Side           | Høyde i designet |
| ----------------- | -------------- | ---------------- |
| `/`               | Forside        | 5488px           |
| `/om-oss`         | Om oss         | 1858px           |
| `/portefolje`     | Portefølje     | 4050px           |
| `/malertjenester` | Malertjenester | 2838px           |
| `/kontakt`        | Kontakt oss    | 2025px           |

## Kontroll mot designet

Hver side er skutt i 1430px og sammenlignet piksel for piksel mot Figmas egen
1:1-eksport. Gjennomsnittlig avvik:

| Side           | Avvik       | Piksler over 32/255 |
| -------------- | ----------- | ------------------- |
| Portefølje     | 0.91 / 255  | 0.40 %              |
| Malertjenester | 1.18 / 255  | 0.68 %              |
| Kontakt        | 1.38 / 255  | 0.79 %              |
| Forside        | 1.40 / 255  | 0.90 %              |
| Om oss         | 2.17 / 255  | 1.54 %              |

Det som er igjen er kantutjevning på tekst — Figma og nettleseren tegner bokstaver
litt ulikt. Plassering, størrelser, farger og bilder er like.

## Oppdatering 4. august 2026

Designeren endret teamseksjonen på forsiden. Nettsiden er oppdatert etter den:

- **Victoria** kom til som sjette person (Kreativ leder, interiørarkitekt,
  fotograf og innholdsprodusent), midt i nederste rad.
- **Bildene ble 16 % større** (271 × 406 mot 233 × 349) og hele raden flyttet seg.
- **Undertitlene fikk full tekst**, «Maler med 16 års erfaring» i stedet for
  «16 års erfaring».
- Seksjonen ble **294px høyere**, så forsiden gikk fra 5195px til 5488px. Alt
  under teamet (tjenester, kontakt, footer) er flyttet tilsvarende ned.

De fire andre sidene er uendret i designet og er kontrollert på nytt mot Figma.

## Bevisste avvik fra designet

1. **Adressen.** Designet har to ulike adresser: kontaktraden på Kontakt-siden sier
   «Ullevålsveien 76, 0454 Oslo», footeren sier «Nedre Ullevål 3C 0850 Oslo».
   Etter avklaring med kunden brukes **Ullevålsveien 76, 0454 Oslo** overalt.
2. **«Portfolje» i footeren** manglet ø i designet. Rettet til «Portefølje».
3. **Kartet på Kontakt-siden** er i designet et skjermbilde av Google Maps. På
   nettsiden er det et ekte, interaktivt Google Maps-kart på firmaets adresse.

## Ikke ferdig ennå

- Lenkene til Facebook og Instagram i footeren peker foreløpig til forsidene deres.
- **Mobildesignet i Figma er påbegynt, ikke ferdig.** Utenfor hovedrammene ligger
  det nå to iPhone-rammer (`203:22`, `203:23`) og en «Hero Section» (`203:24`).
  Bare toppen av den ene er tegnet, resten er tom. Mobilversjonen på nettsiden er
  derfor fortsatt vår egen, med designets farger, tekster og bilder.

## Fallgruver i Figma-filen som er håndtert

Notert her fordi de vil dukke opp igjen ved neste oppdatering av designet.

- **Bildefyll har egne utsnitt.** Fyll i STRETCH-modus har en `imageTransform`
  `[[sx,0,tx],[0,sy,ty]]` som sier hvilken del av bildet som vises. Uten den blir
  bildene feil beskåret. Håndteres av `CropImg` i `src/components/prim.tsx`.
- **15 bilder har fargejustering i Figma** (eksponering, kontrast, skygger …).
  Den lar seg ikke gjenskape i CSS, så disse er eksportert **ferdig rendret** fra
  Figma via `/v1/images` og lagt inn som vanlige bilder.
- **Gradienter med fyllopasitet under 1** blander seg annerledes i CSS enn i Figma
  (premultiplisert alfa). Løsningen er mange stopp med utregnet farge — se `G` og
  `alphaStops` i `src/lib/theme.ts`.
- **Figma bruker U+2028** som linjeskift inne i tekst. Det bryter enkelte verktøy
  og må erstattes med vanlig linjeskift.
- **Hero-bildet på forsiden er speilvendt**, ikke rotert: matrisen er
  `[[-1,0,tx],[0,1,ty]]`. Det samme gjelder to bilder på Portefølje-siden.
- **Skygge under maske:** `clip-path` klipper også bort `drop-shadow`, så skyggen
  må ligge på et ytre element.

## Struktur

```
api/kontakt.ts        Serverfunksjon: tar imot skjemaet og sender e-post
src/
  lib/theme.ts        Eksakte farger, gradienter, fonter, firmadata
  lib/site.ts         Delt innhold: tjenester, team, koordinater fra Figma
  lib/kontakt.ts      Felles skjemalogikk: validering, sending, status
  lib/useIsMobile.ts  Bryteren mellom desktop og mobil
  components/         Stage, SiteHeader, SiteFooter, GoldButton, ContactForm, prim
  components/mobile/  Header, meny, footer og skjema for mobil
  pages/              Desktop: Home, OmOss, Portefolje, Malertjenester, Kontakt
  pages/mobile/       Mobilversjonene av de samme fem sidene
  assets/figma/       Originale bilder, ikoner og søl fra designet
```
