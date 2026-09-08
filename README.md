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

## Tilbudsskjemaet

Designeren tegnet Kontakt-siden om 7. september 2026: det korte skjemaet med
navn, e-post og melding er byttet ut med seks nummererte spørsmål. Det samme
skjemaet står nederst på forsiden. Begge stedene er hentet 1:1 fra Figma
(rammene «Kontakt oss» 46:964 og «kontaktoss» 226:195).

- Spørsmålene: hva slags jobb, hvor, omtrent hvor stort areal, når det kan
  utføres, inntil seks bilder, og en kort beskrivelse.
- **Spørsmål 7, «Hvordan når vi deg?», står ikke i designet.** Det er lagt
  til med navn, telefon og e-post, fordi skjemaet ellers kommer fram uten
  noen måte å svare kunden på. Det er også grunnen til at begge sidene er
  237px høyere enn Figma-rammen (`SKIFT` i `Kontakt.tsx` og `Home.tsx`).
- Bare spørsmål 1, 2 og 7 er påkrevd. Areal og tidspunkt er frivillige:
  et svar vi ikke fikk er bedre enn en henvendelse kunden ga opp.
- Bildene krympes i nettleseren (`src/lib/tilbud.ts`, JPEG, lengste side
  1600px, rundt en halv megabyte hver) og følger med e-posten som vedlegg.
  Vercel tar imot høyst 4,5 MB per innsending, så summen holdes under 3 MB.
- Sendingen går til serverfunksjonen `api/kontakt.ts` med `skjema: 'tilbud'`;
  e-posten får en rad per felt og bildene vedlagt.
- Tilstanden bor i `App.tsx`, ikke i sidene, så det kunden har skrevet
  overlever at skjemaet bytter mellom mobil- og desktoputgaven.
- Skriften **Mulish SemiBold** kom inn med denne utgaven (brødteksten i
  kortet «Hva dere får»). Den ligger i `public/fonter/`, som de andre.

### `/tilbud` er borte

Siden `/tilbud` fra september 2026 hadde det samme skjemaet, og forsvant da
designet flyttet det til Kontakt-siden. Adressen sendes videre til
`/kontakt`: `vercel.json` gjør det med 308 på serveren, og `App.tsx` gjør
det samme inne i nettleseren. Lenken «Be om tilbud her» under de korte
skjemaene, og oppføringen i mobilmenyen, er tatt bort sammen med siden.

Kjør `supabase/oppsett.sql` på nytt om du vil rydde: `registrer_visning` har
fortsatt `/tilbud` i listen over sider som telles. Det gjør ingen skade, for
adressen sendes videre før noe telles.

## Bakgrunnsmusikk

Kunden ønsket ett rolig jazzspor på nettstedet (Pixabay, «Piano Jazz with
Saxophone», gratis lisens). `src/lib/musikk.ts` og `src/components/Musikk.tsx`:

- Starter fra stille og glir opp til 7 % volum over fem sekunder
  (`MAAL_VOLUM` i `musikk.ts` er det eneste tallet å justere), går i sløyfe
  med en myk overgang, og kan skrus av med knappen nede til høyre. Valget
  huskes i nettleseren.
- Nettleserne tillater ikke lyd før besøkeren har trykket eller tastet noe
  på siden. Vi prøver ved lasting; sier nettleseren nei, starter musikken
  ved første trykk hvor som helst på siden. Det gjelder alle nettlesere og
  kan ikke omgås.
- Filen er én runde av sløyfa: 72 sekunder, mono, AAC-LC 48 kbit/s, 442 kB.
  Den hentes først ved besøkerens første berøring, altså i det øyeblikket
  nettleseren i det hele tatt tillater lyd. Se «Fart» lenger nede.
- Volumet går gjennom Web Audio (GainNode), fordi iPhone ignorerer
  `audio.volume`. Skjules fanen, settes musikken på pause.

## Sider

| Rute              | Side           | Høyde i designet |
| ----------------- | -------------- | ---------------- |
| `/`               | Forside        | 6268px (6505 bygget) |
| `/om-oss`         | Om oss         | 1858px           |
| `/portefolje`     | Portefølje     | 4050px           |
| `/malertjenester` | Malertjenester | 2838px           |
| `/kontakt`        | Få et uforpliktende tilbud | 2838px (3075 bygget) |

Forsiden og Kontakt-siden er 237px høyere enn rammene i Figma. Det er
spørsmål 7 i tilbudsskjemaet, se «Tilbudsskjemaet» over.

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

**Kontrollmåling 7. september 2026**, etter at Kontakt-siden og forsiden ble
bygget om. Tallene ligger litt høyere enn i tabellen over fordi de er skutt med
andre Chrome-innstillinger; derfor er Om oss, som ingen har rørt, målt samtidig
som referanse:

| Måling                              | Avvik      | Piksler over 32/255 |
| ----------------------------------- | ---------- | ------------------- |
| Om oss (urørt, referanse)           | 3.43 / 255 | 2.01 %              |
| Kontakt (bygget om)                 | 3.56 / 255 | 1.83 %              |
| Forsiden, ny kontaktseksjon         | 2.56 / 255 | 1.53 %              |
| Forsiden, resten (urørt)            | 5.75 / 255 | 3.77 %              |

Det som er bygget om ligger altså like nær designet som referansen, eller
nærmere. Målingen dekker den delen som faktisk er tegnet i Figma; bolken med
kontaktopplysninger finnes ikke i designet og kan ikke sammenlignes.

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

## Fart (7. september 2026)

Målt med Lighthouse 12 på et bygget nettsted, samme motor som PageSpeed.

| Side | | Fart | Tilgjengelighet | God praksis | SEO |
| ---- | - | ---- | --------------- | ----------- | --- |
| Forsiden | telefon | 87–88 | 96 | 100 | 100 |
| Forsiden | PC | 99 | 90 | 100 | 100 |
| Kontakt | telefon | 91–92 | 96 | 100 | 100 |
| Kontakt | PC | 100 | 90 | 100 | 100 |
| Om oss | telefon | 87 | 100 | 100 | 100 |
| Malertjenester | telefon | 89 | 100 | 100 | 100 |

Tallene svinger to–tre poeng mellom kjøringer på samme bygg; det er normalt.
Måles på `node tools/vis.mjs`, som serverer `dist/` slik Vercel gjør (ferdige
filer per rute, og komprimering – uten den måler man noe helt annet).

Til sammenligning lå det som var live før dette: forsiden 62 og Kontakt 78 på telefon.

**Det som ble gjort, i rekkefølge etter hvor mye det ga:**

- **Musikken.** Sporet var 5 min 31 s i stereo, 2,85 MB, og ble hentet 0,7 s
  etter at siden var lastet – også for de aller fleste som aldri fikk høre
  den, siden nettleseren uansett nekter lyd før første trykk. Nå: én runde av
  sløyfa på nøyaktig 72 sekunder (sporet gjentar seg selv der), mono, AAC-LC
  48 kbit/s, **442 kB**. Klippepunktet er der bølgeformen møter seg selv, med
  en krysstoning på 0,25 s, så gjentakelsen ikke høres. Filen hentes først ved
  første berøring, altså i det øyeblikket avspilling faktisk er tillatt.
- **Bildene.** Alle fotografier fra JPEG til WebP: 1816 kB → 820 kB, uten
  synlig forskjell (PSNR 37–44 dB). Akvarellsølet fra tapsfri til vanlig
  WebP: 134 → 29 kB og 266 → 79 kB. Mobilsidene har egne, mindre utgaver av
  de tre største bildene.
- **Skriftene.** Montserrat lå som fem separate vektfiler, 34 kB hver. Nå
  ligger den som **variabel skrift**: én fil dekker 300–800. 170 kB og fem
  forespørsler ble til 34 kB og én. Utseendet er kontrollert med pikselsammen-
  ligning: avvik 0,14 av 255 mot forrige bygg.
- **Stilarket legges inn i HTML-en** av `tools/etterbygg.mjs` etter bygget.
  Det var en egen tur til serveren som blokkerte første tegning.
- **Bildet øverst på mobilforsiden hentes med `preload`** (samme skript), med
  mediespørring så PC-en slipper.
- **Besøkstellingen** kjørte med én gang siden åpnet og la en CORS-runde midt
  i lastingen. Nå venter den til siden er lastet og nettleseren er ledig.
- **Kartet** lastet 380 kB Google-skript selv om det står 2300 piksler nede.
  `src/components/Kart.tsx` holder rammen tilbake til besøkeren er mindre enn
  600 piksler unna. En tom flate i samme størrelse står der hele tiden, så
  ingenting hopper.
- **En ekte feil ble funnet på veien:** `rpc()` ga `undefined` både når kallet
  feilet og når det gikk bra uten innhold. `registrer_visning` returnerer
  `void`, altså 204 uten innhold, så hver eneste sidevisning trodde den hadde
  feilet og prøvde reserveløsningen – som RLS stopper med 401. Hver besøkende
  laget altså en mislykket forespørsel og en feil i konsollen. Nå finnes
  `rpcUtenSvar()` som svarer med ja eller nei.
- **Trykkflatene i mobilfooteren** er utvidet med polstring og hentet inn
  igjen med negativ marg, så de er 24 piksler høye uten at noe flytter seg.
- **Lenis (myk rulling) hentes med `import()`** først når nettleseren er
  ledig, og hoppes helt over på berøringsskjerm, der rullingen er myk fra
  før. 20 kB mindre å laste ned og kjøre ved oppstart, på den enheten som
  har minst kraft.
- **Bildene på mobil har fått `width` og `height`.** Uten dem visste ikke
  nettleseren hvor høyt bildet ble før det var lastet, og alt under hoppet.
  CLS gikk fra 0,108 til 0.
- **Ferdigrendring** (`tools/forhaandsrender.mjs`): hver side rendres én gang
  i en usynlig nettleser under bygget, og det første skjermbildet av
  mobilutgaven legges rett inn i HTML-en sammen med riktig tittel,
  beskrivelse og kanonisk adresse. Filene legges som `<rute>/index.html`, og
  både Vercel og `tools/vis.mjs` serverer dem rett på adressen uten oppsett.
  To gevinster: teksten kommer på skjermen omtrent 0,3 sekunder tidligere, og
  søkemotorer som ikke kjører JavaScript ser riktig tittel og beskrivelse per
  side. Skallet skjules på desktop og fjernes av React selv når den starter.

**Prøvd og forkastet:** å dele koden i én bunt for desktop og én for mobil.
Rollup la delte moduler i desktopbunten, det oppsto en sirkulær avhengighet,
og siden ble hvit (`Cannot access 's' before initialization`). Gevinsten var
usikker, risikoen var ikke verdt det. `vite.config.ts` er derfor uendret.

**Det som står igjen, og hvorfor:**

- **Tilgjengelighet 90 på PC** skyldes at lenkene i footeren er lavere enn de
  24 pikslene kravet ber om. Designets linjeavstand er 22,5px, og siden hele
  designet skaleres med `zoom`, blir de enda lavere på smale vinduer. Å fikse
  det betyr en synlig luftigere footer enn i Figma.
- **Tilgjengelighet 96 i stedet for 100** skyldes fargen `#9a9ac3` på hvitt
  (kontrast 2,69, kravet er 4,5). Det er designets egen farge på hjelpeteksten
  i opplastingsfeltet. Å fikse det betyr mørkere grå enn Figma viser.
- **Fart 87–92 på telefon i stedet for 100.** Det som stopper oss er TBT:
  tiden hovedtråden er opptatt med å bygge siden. Den teller 30 % av
  farts-karakteren, ligger på rundt 300 ms, og er kostnaden ved å starte en
  React-app av denne størrelsen på en treg mobilprosessor. Regnestykket:
  med perfekt FCP, LCP, hastighetsindeks og CLS, og TBT på 300 ms, blir
  summen omtrent 91.

  Ferdigrendringen over hjalp på FCP og hastighetsindeks, men ikke på
  karakteren, fordi LCP måles på den siste tegningen: når React bytter ut
  skallet, teller LCP fra da. Å beholde skallet ville krevd ekte hydrering,
  og den krever at HTML-en er laget for riktig enhet – noe én fil ikke kan
  være når mobil og desktop er to helt ulike oppsett.

  For å komme til 100 må det sendes vesentlig mindre JavaScript ved
  oppstart. Det betyr en annen arkitektur: statiske sider der bare de
  delene som faktisk er interaktive (skjemaet, menyen, musikken, kartet)
  får kode. Det er en ombygging av nettstedet, ikke en justering.

## Bevisste avvik fra designet

1. **Adressen.** Designet har to ulike adresser: kontaktraden på Kontakt-siden sier
   «Ullevålsveien 76, 0454 Oslo», footeren sier «Nedre Ullevål 3C 0850 Oslo».
   Etter avklaring med kunden brukes **Ullevålsveien 76, 0454 Oslo** overalt.
2. **«Portfolje» i footeren** manglet ø i designet. Rettet til «Portefølje».
3. **Kartet på Kontakt-siden** er i designet et skjermbilde av Google Maps. På
   nettsiden er det et ekte, interaktivt Google Maps-kart på firmaets adresse.
   I den nye utgaven av rammen ligger skjermbildet dessuten *utenfor* rammen,
   så det er ikke med i Figmas egen eksport. Plasseringen er lest av noden
   (`171:213`, 1194x473, hjørneradius 67).
4. **Kontaktopplysningene i skjemaet** (spørsmål 7) er lagt til. Designet har
   ingen felt for navn, telefon eller e-post, og uten dem kan ikke Delius
   svare den som spør.
5. **E-postadressen i kontaktraden** står midtstilt i en boks på 221px, som i
   designet. Vår adresse er lengre enn designets `info@malerdelius.no`, så
   teksten får stå utenfor boksen i stedet for å brekke i to linjer.
   Midtpunktet er det samme.
6. **«Ullevålsveien 76 Bygg 22»** er ny i designet fra 7. september 2026.
   Nettsiden står fortsatt på «Ullevålsveien 76, 0454 Oslo», som ble avklart
   med kunden i august. Må bekreftes før «Bygg 22» eventuelt legges til.

## Ikke ferdig ennå

- Lenkene til Facebook og Instagram i footeren peker foreløpig til forsidene deres.
- **Mobildesignet i Figma er påbegynt, ikke ferdig.** iPhone-rammen `203:23` er
  nå 402x6039 og har hero og team tegnet; resten er tom. Seksjonene «Våre
  tjenester» (`219:339`) og «CARDS ABOUT US» (`219:342`) ligger som løse rammer
  ved siden av og er ikke satt inn. Mobilversjonen på nettsiden er derfor
  fortsatt vår egen, med designets farger, tekster og bilder.
- **Teksten «Det jeg faktisk sikter til», «Forslag: …» og listen «Teknisk»** er
  designerens egen forklaring til kunden, ikke tekst skrevet for besøkende. De
  står på siden fordi Artiom bestemte at designet skulle følges slik det er.
  Skal de byttes ut, er det bare tekst: se `Kontakt.tsx` og `Teknisk.tsx`.

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
  lib/tilbud.ts       Skjemalogikk: validering, krymping av bilder, sending
  lib/useIsMobile.ts  Bryteren mellom desktop og mobil
  components/         Stage, SiteHeader, SiteFooter, GoldButton, prim,
                      TilbudSkjemaDesign (skjemaet på desktop),
                      HvaDereFaar og Teknisk (spalten ved siden av),
                      TilbudSkjema (samme skjema, flytende, for mobil)
  components/mobile/  Header, meny, footer og Fordeler (kortet på mobil)
  pages/              Desktop: Home, OmOss, Portefolje, Malertjenester, Kontakt
  pages/mobile/       Mobilversjonene av de samme fem sidene
  assets/figma/       Originale bilder, ikoner og søl fra designet
```

## Juridisk gjennomgang (8. september 2026)

Alt under er gjort lokalt, uten push. Hele listen over hva som er kontrollert,
hva som ble endret og hva kunden selv må avgjøre, står i
[`docs/JURIDISK.md`](docs/JURIDISK.md).

### Nye sider

| Adresse | Innhold | Hjemmel |
| --- | --- | --- |
| `/personvern` | Personvernerklæringen, skrevet om: alle behandlinger, databehandlere, oppbevaring, rettigheter, Datatilsynet | personvernforordningen art. 13 |
| `/informasjonskapsler` | Alt som lagres i nettleseren, hvem, hvorfor, hvor lenge, med knapper for å endre og trekke tilbake samtykket | ekomloven § 3-15, personvernforordningen art. 7 nr. 3 |
| `/vilkar` | Vilkår for bruk, faste opplysninger om selskapet (org.nr. MVA, adresser, register), tilbud og pris, reklamasjon og «garanti», opphavsrett, tvister | ehandelsloven § 8, tjenesteloven § 20, håndverkertjenesteloven |
| `/angrerett` | 14 dagers angrerett, tilbakebetaling, oppstart før fristen, reklamasjon | angrerettloven, håndverkertjenesteloven § 22 |

Rammen er `src/components/JuridiskSide.tsx` (BloggStage på desktop, Shell på
mobil), teksten stiles av `.jus` i `index.css`. Sidene står i `seo.ts`,
`api/sitemap.ts`, `tools/forhaandsrender.mjs`, `spor.ts` og i allowlisten i
`supabase/oppsett.sql` (**må kjøres på nytt** i SQL-editoren, ellers droppes
visninger av de nye sidene).

### Samtykke til informasjonskapsler

`src/lib/samtykke.ts` + `src/components/Samtykke.tsx`. Banneret følger
Datatilsynets krav: «Bare nødvendige» er like stor og like lett som «Godta
alle», ingenting er forhåndsavkrysset, hvert formål kan velges under «Tilpass»,
nettstedet virker uten å svare, og svaret (localStorage `md-samtykke`, 12
måneder, `VERSJON` i filen) kan endres fra `/informasjonskapsler`. To formål:

- **statistikk** → Google Analytics 4. Google-taggen (gtag.js) står
  **statisk i `index.html`**, fordi Google Ads leser kildekoden for å finne
  den («Google Analytics ble ikke funnet» ellers). `public/analyse-start.js`
  kjører først og setter Googles samtykkemodus v2 til «nei» på alt, så taggen
  verken setter kapsler eller lagrer noe før svaret; `src/lib/analyse.ts`
  åpner `analytics_storage` ved ja. Før svaret sender taggen bare Googles
  samtykkeløse ping (uten identifikator); et «Bare nødvendige» slår målingen
  helt av (`ga-disable`) og sletter `_ga`/`_gcl`. Målings-ID-en står **bare i
  tag-linjen i `index.html`** (G-82M65MEYRW, eiendommen Google Ads laget på
  kundens konto, sendt 8. sep kl. 21:30); `basekonfig.ts` og
  `analyse-start.js` leser den derfra, `VITE_GA_ID` kan overstyre.
  Eiendommen G-F8F8B1R8N8 opprettet på malerdeliusas@gmail.com samme kveld er
  overflødig og kan slettes. Sidevisningene telles av Googles «forbedrede
  måling» (standard PÅ); skrus den av i Analytics, sett
  `MANUELL_SIDEVISNING = true` i `analyse.ts`.
- **markedsforing** → `ad_storage` + `ad_user_data` i samtykkemodusen, så
  Google Ads kan måle om en annonse førte til en henvendelse (kapslene
  `_gcl_…`, 90 dager). `ad_personalization` står alltid på nei: ingen
  remarketing, ingen personlig tilpassede annonser. Trengs ikke noe eget
  Ads-skript; GA4-eiendommen er knyttet til Ads-kontoen.
- **eksternt** → kartet fra Google Maps (`Kart.tsx`). Før ja står en grå flate
  i samme størrelse med knappen «Vis kartet fra Google Maps» og en lenke som
  åpner adressen i en ny fane.

Vår egen besøksteller (`spor.ts`) lagrer ikke lenger noe i nettleseren:
økt-id, lenkekode og «første visning» ligger i minnet til fanen. En
oppfrisking teller derfor som ny økt.

### Skjemaet

- Avkryssing «Jeg har lest personvernerklæringen …» før knappen, både på
  desktop (absolutt, `Y.samtykke` i `TilbudSkjemaDesign.tsx`, spalten er nå
  `EKSTRA_HOYDE` = 297 px høyere enn Figma, mot 237 før) og på mobil.
  Serveren avviser innsendinger uten den, og e-posten får raden
  «Personvern: Godtatt dd.mm.åååå hh:mm».
- Telefon **eller** e-post er nok (dataminimering); det som er fylt ut må være
  gyldig. Uten e-post får «Svar»-knappen i e-posten `tel:`-lenke i stedet.

### Footer

Desktop-footeren er 34 px høyere (`FOOTER_EKSTRA` i `SiteFooter.tsx`), med
raden Personvern · Informasjonskapsler · Vilkår for bruk · Angrerett og
reklamasjon. Alle sidehøydene har fått `+ FOOTER_EKSTRA`. «MVA» er lagt til
etter organisasjonsnummeret. Mobilfooteren har en fjerde blokk «Juridisk».

### Tekst som avviker fra designet (juridisk begrunnet)

| Sted | Før | Nå | Hvorfor |
| --- | --- | --- | --- |
| Forsiden + Om oss, «Kvalitet og pålitelighet» | «… varighet på vår» / «på vårt.» | «… varighet på vårt arbeid.» | avkuttet setning |
| Forsiden + Om oss, «Miljøansvar» | «Vi bruker kun miljøvennlige materialer …» | «Vi tar hensyn til både din helse og miljøet når vi velger materialer og arbeidsmåte.» | markedsføringsloven §§ 6–7, Forbrukertilsynets veileder om bærekraftpåstander: «kun miljøvennlige» må kunne dokumenteres |
| Tjenestekortet «Miljøvennlige løsninger» | «Bruk av sertifiserte miljømaterialer.» | «Miljømerkede produkter når du ønsker det.» | samme |
| Portefølje | «+300 utførte arbeider» | «75 jobber vunnet på Mittanbud» | markedsføringsloven § 3 (dokumentasjonskrav); 300 lot seg ikke kontrollere, 75 står på Mittanbud-profilen |
| Portefølje | «+7 År i Bransjen» | «+7 års erfaring per maler» | selskapet ble stiftet 14.10.2024; malerne har 7–16 år |
| Portefølje | «57 vurderinger» + skjermbilde med 57 | `BEDRIFT.mittanbudVurderinger` (58) i kortet og i `MittanbudKort.tsx` | tallet var utdatert; kortet tegnes nå av koden |

Mittanbud-tallene ligger i `BEDRIFT.mittanbud*` i `src/lib/theme.ts` og må
oppdateres for hånd (lest 8. september 2026).

### Annet

- `vercel.json`: CSP slipper gjennom `googletagmanager.com` og
  `google-analytics.com`; `"regions": ["fra1"]` flytter serverfunksjonen
  (skjemaet) fra Washington til Frankfurt, så kundeopplysningene behandles i EU.
  Skulle utrullingen klage på `regions`, fjern linjen.
- `index.html`: JSON-LD har fått `vatID` og `foundingDate`.
- Bildet `mittanbud-anmeldelser.webp` brukes ikke lenger.
