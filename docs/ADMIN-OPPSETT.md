# Admin-panelet – oppsett og bruk

Nettstedet har et admin-panel på **`/admin`** med blogg, galleristyring,
besøksstatistikk og sporingslenker. Alt lagres i Supabase-prosjektet
`fufzioaqnbbiyzhswjab`; nettstedet snakker med det via de offentlige
anon-nøklene i `.env` (se `.env.example`), og alt de får lov til styres av
Row Level Security.

## Engangsoppsett i Supabase (ca. 5 minutter)

1. **Kjør databaseskriptet.**
   Supabase-dashbordet → **SQL Editor** → lim inn hele
   [`supabase/oppsett.sql`](../supabase/oppsett.sql) → **Run**.
   Skriptet er idempotent – å kjøre det på nytt gjør ingen skade.
   Les meldingsfeltet: sier det at bøtta eller storage-reglene ikke kunne
   lages, gjør punkt 2 manuelt; ellers er punkt 2 alt gjort.

2. **(Bare hvis skriptet sa ifra) Lag bildelageret manuelt.**
   Storage → **New bucket** → navn `bilder`, huk av **Public**.
   Storage → bilder → **Policies**: les for alle (`select` for `anon` og
   `authenticated`), skriv (`insert`/`update`/`delete`) kun for
   `authenticated`, alle med vilkåret `bucket_id = 'bilder'`.

3. **Opprett admin-brukeren.**
   Authentication → Users → **Add user** → e-post + passord, huk av
   **Auto confirm user**. Dette er innloggingen til `/admin`.

4. **Slå av åpen registrering** (viktig – ellers kan hvem som helst lage
   seg en bruker og «authenticated»-rettighetene følger med):
   Authentication → Sign In / Up → skru av **Allow new users to sign up**.

## Daglig bruk

- **`/admin`** – logg inn med brukeren fra punkt 3.
- **Blogg**: skriv innlegg med tittel, ingress, toppbilde og innhold
  (enkle formateringsknapper; forhåndsvisningen viser resultatet slik
  bloggen viser det). «Publisert»-bryteren avgjør om innlegget ligger ute;
  kladder er bare synlige i panelet.
- **Galleri**: de tretten bildeplassene på Portefølje-siden. Bytt et bilde
  eller sett originalen tilbake – begge deler slår gjennom umiddelbart,
  på både desktop og mobil.
- **Statistikk**: sidevisninger og unike besøk per dag (7/30/90 dager og
  12 måneder), mest sette sider, kilder, enheter og lenketrafikk.
  Ingen informasjonskapsler, ingen IP-adresser – bare sti, kilde,
  enhetstype og en tilfeldig økt-id som dør med fanen. Egne besøk telles
  ikke fra maskiner der noen har vært innlogget i panelet.
- **Lenker**: lag adresser som `malerdelius.no/l/facebook-august`, del dem
  i annonser/innlegg, og se hvor mange besøk hver av dem ga.

## Teknisk

- Admin-koden ligger i `src/admin/` og lastes som egen bunt – besøkende
  laster den aldri ned. Bloggen på nettstedet ligger i `src/pages/Blogg*`
  + `src/pages/mobile/Blogg*`, sporingen i `src/lib/spor.ts`.
- Opplastede bilder krympes i nettleseren (maks 1600 px, WebP) før de
  havner i storage-bøtta `bilder`.
- Statistikkspørringen er én SQL-funksjon, `hent_statistikk(fra, til)`,
  kun tilgjengelig for innloggede.
- CSP-en i `vercel.json` tillater kall og bilder fra Supabase-prosjektet.
