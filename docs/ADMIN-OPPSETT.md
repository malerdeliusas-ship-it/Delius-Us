# Admin-panelet – oppsett og bruk

Nettstedet har et admin-panel på **`/admin`** med blogg, galleristyring,
besøksstatistikk og sporingslenker. Alt lagres i Supabase-prosjektet
`fufzioaqnbbiyzhswjab`; nettstedet snakker med det via de offentlige
anon-nøklene i `.env` (se `.env.example`).

## Oppsett – to filer å kjøre

Begge kjøres i Supabase-dashbordet → **SQL Editor** → lim inn hele filen → **Run**.
Begge er trygge å kjøre flere ganger.

1. **[`supabase/oppsett.sql`](../supabase/oppsett.sql)** – tabeller, sikkerhets-
   regler, statistikkfunksjon og bildelager. Nederst skriver den ut en
   sjekkliste: alle radene skal si `OK`. Sier «Storage-regler» noe annet, lag
   dem i dashbordet (Storage → bilder → Policies) – resten er da likevel klart.

2. **[`supabase/lag-admin-bruker.sql`](../supabase/lag-admin-bruker.sql)** –
   lager innloggingen. **Endre e-post og passord øverst i filen først.**
   Brukeren blir ferdig bekreftet med én gang, så ingen e-post trenger å sendes
   eller klikkes. Filen legger også inn et demoinnlegg du kan slette i panelet.

Deretter: gå til `/admin`, logg inn, og alt skal virke.

### Hvem har tilgang – og hvorfor det er gjort slik

Tilgangen styres av tabellen **`admin_epost`**. Å være innlogget er ikke nok:
funksjonen `er_admin()` sjekker om e-postadressen i innloggingen står i den
tabellen, og alle skriveregler i databasen henger på den funksjonen.

Grunnen: den offentlige nøkkelen ligger i nettleseren til alle som besøker
nettstedet. Står «Allow new users to sign up» på i Supabase, kan hvem som helst
registrere seg – men en slik bruker havner ikke i `admin_epost`, og ser og gjør
da nøyaktig like mye som en vanlig besøkende. Panelet møter den med en skjerm
som forklarer hva som mangler.

Gi flere tilgang:

```sql
insert into admin_epost (epost) values ('navn@eksempel.no');
```

Anbefalt i tillegg (rydder bort søppelbrukere, men er ikke det som holder
panelet lukket): Authentication → **Sign In / Up** → skru av
**Allow new users to sign up**.

### Før nettstedet legges ut

- Kjør `lag-admin-bruker.sql` på nytt med et **ordentlig passord**, og slett
  testbrukeren under Authentication → Users.
- Slett demoinnlegget i panelet.
- Legg `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY` inn i Vercel
  (Settings → Environment Variables), ellers står panelet uten database i prod.

## Daglig bruk

- **Blogg**: skriv innlegg med tittel, ingress, toppbilde og innhold (enkle
  formateringsknapper; forhåndsvisningen viser resultatet slik bloggen viser
  det). «Publisert»-bryteren avgjør om innlegget ligger ute; kladder er bare
  synlige i panelet.
- **Galleri**: de tretten bildeplassene på Portefølje-siden. Bytt et bilde
  eller sett originalen tilbake – begge deler slår gjennom umiddelbart, på
  både desktop og mobil.
- **Statistikk**: sidevisninger og unike besøk per dag (7/30/90 dager og
  12 måneder), mest sette sider, kilder, enheter og lenketrafikk. Ingen
  informasjonskapsler, ingen IP-adresser – bare sti, kilde, enhetstype og en
  tilfeldig økt-id som dør med fanen. Egne besøk telles ikke fra maskiner der
  noen har vært innlogget i panelet.
- **Lenker**: lag adresser som `malerdelius.no/l/facebook-august`, del dem i
  annonser/innlegg, og se hvor mange besøk hver av dem ga.

## Teknisk

- Admin-koden ligger i `src/admin/` og lastes som egen bunt – besøkende laster
  den aldri ned. Bloggen på nettstedet ligger i `src/pages/Blogg*` +
  `src/pages/mobile/Blogg*`, sporingen i `src/lib/spor.ts`.
- Opplastede bilder krympes i nettleseren (maks 1600 px, WebP) før de havner i
  storage-bøtta `bilder`.
- Statistikken er én SQL-funksjon, `hent_statistikk(fra, til)`, som selv
  avviser alle som ikke er admin.
- CSP-en i `vercel.json` tillater kall og bilder fra Supabase-prosjektet.
