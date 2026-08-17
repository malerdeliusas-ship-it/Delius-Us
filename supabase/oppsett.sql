-- ============================================================================
-- Maler Delius – database for blogg, galleri, besøksstatistikk og lenker
-- ============================================================================
-- Kjøres ÉN gang i Supabase: Dashboard → SQL Editor → lim inn hele filen → Run.
-- Skriptet er idempotent: å kjøre det på nytt gjør ingen skade.
--
-- Sikkerhetsmodellen er enkel og stram:
--   * anon (nettstedet, uten innlogging): kan LESE publiserte innlegg,
--     galleribilder og lenker, og kan REGISTRERE sidevisninger. Ingenting mer.
--   * authenticated (admin-panelet, etter innlogging): full tilgang.
--     Registrering av nye brukere skal være AV i Authentication → Sign In
--     (admin-brukeren opprettes manuelt i dashbordet), så «authenticated»
--     betyr i praksis «admin».
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Blogg
-- ---------------------------------------------------------------------------
create table if not exists public.blogg_innlegg (
  id uuid primary key default gen_random_uuid(),
  tittel text not null check (char_length(tittel) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,120}$'),
  ingress text not null default '' check (char_length(ingress) <= 500),
  innhold text not null default '' check (char_length(innhold) <= 100000),
  bilde_url text,
  publisert boolean not null default false,
  publisert_dato timestamptz,
  opprettet timestamptz not null default now(),
  oppdatert timestamptz not null default now()
);

create index if not exists blogg_publisert_idx
  on public.blogg_innlegg (publisert, publisert_dato desc);

alter table public.blogg_innlegg enable row level security;

drop policy if exists "alle leser publiserte innlegg" on public.blogg_innlegg;
create policy "alle leser publiserte innlegg"
  on public.blogg_innlegg for select to anon
  using (publisert);

drop policy if exists "admin leser alt" on public.blogg_innlegg;
create policy "admin leser alt"
  on public.blogg_innlegg for select to authenticated
  using (true);

drop policy if exists "admin oppretter innlegg" on public.blogg_innlegg;
create policy "admin oppretter innlegg"
  on public.blogg_innlegg for insert to authenticated
  with check (true);

drop policy if exists "admin endrer innlegg" on public.blogg_innlegg;
create policy "admin endrer innlegg"
  on public.blogg_innlegg for update to authenticated
  using (true) with check (true);

drop policy if exists "admin sletter innlegg" on public.blogg_innlegg;
create policy "admin sletter innlegg"
  on public.blogg_innlegg for delete to authenticated
  using (true);

-- «oppdatert» settes automatisk ved hver endring
create or replace function public.sett_oppdatert()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.oppdatert = now();
  return new;
end $$;

drop trigger if exists blogg_sett_oppdatert on public.blogg_innlegg;
create trigger blogg_sett_oppdatert
  before update on public.blogg_innlegg
  for each row execute function public.sett_oppdatert();

-- ---------------------------------------------------------------------------
-- Galleri: overstyrte bilder på Portefølje-siden
-- Nettstedet har originalbildene innebygd; en rad her bytter ut ett av dem.
-- «plass» er en fast nøkkel per bildeplass (pf-1 … pf-13, se src/lib/galleri.ts).
-- ---------------------------------------------------------------------------
create table if not exists public.galleri_bilder (
  plass text primary key check (plass ~ '^[a-z0-9-]{1,40}$'),
  bilde_url text not null,
  oppdatert timestamptz not null default now()
);

alter table public.galleri_bilder enable row level security;

drop policy if exists "alle leser galleriet" on public.galleri_bilder;
create policy "alle leser galleriet"
  on public.galleri_bilder for select to anon, authenticated
  using (true);

drop policy if exists "admin skriver galleriet" on public.galleri_bilder;
create policy "admin skriver galleriet"
  on public.galleri_bilder for insert to authenticated
  with check (true);

drop policy if exists "admin endrer galleriet" on public.galleri_bilder;
create policy "admin endrer galleriet"
  on public.galleri_bilder for update to authenticated
  using (true) with check (true);

drop policy if exists "admin sletter i galleriet" on public.galleri_bilder;
create policy "admin sletter i galleriet"
  on public.galleri_bilder for delete to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Sporingslenker: korte adresser som malerdelius.no/l/facebook-host
-- ---------------------------------------------------------------------------
create table if not exists public.lenker (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique check (kode ~ '^[a-z0-9-]{1,60}$'),
  navn text not null check (char_length(navn) between 1 and 120),
  mal text not null default '/' check (mal ~ '^/[a-z0-9/-]{0,120}$'),
  opprettet timestamptz not null default now()
);

alter table public.lenker enable row level security;

-- anon må kunne slå opp koden for å vite hvor lenken skal videre
drop policy if exists "alle leser lenker" on public.lenker;
create policy "alle leser lenker"
  on public.lenker for select to anon, authenticated
  using (true);

drop policy if exists "admin oppretter lenker" on public.lenker;
create policy "admin oppretter lenker"
  on public.lenker for insert to authenticated
  with check (true);

drop policy if exists "admin endrer lenker" on public.lenker;
create policy "admin endrer lenker"
  on public.lenker for update to authenticated
  using (true) with check (true);

drop policy if exists "admin sletter lenker" on public.lenker;
create policy "admin sletter lenker"
  on public.lenker for delete to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Sidevisninger: én rad per side noen ser på nettstedet
-- Ingen personopplysninger: bare sti, kilde, enhetstype og en tilfeldig
-- økt-id som lever til fanen lukkes. Ingen IP, ingen informasjonskapsler.
-- ---------------------------------------------------------------------------
create table if not exists public.sidevisninger (
  id bigint generated always as identity primary key,
  sti text not null check (char_length(sti) between 1 and 200),
  kilde text check (kilde is null or char_length(kilde) <= 120),
  lenke_kode text check (lenke_kode is null or lenke_kode ~ '^[a-z0-9-]{1,60}$'),
  enhet text not null default 'desktop' check (enhet in ('mobil', 'desktop')),
  okt_id uuid not null,
  tidspunkt timestamptz not null default now()
);

create index if not exists sidevisninger_tid_idx
  on public.sidevisninger (tidspunkt);
create index if not exists sidevisninger_lenke_idx
  on public.sidevisninger (lenke_kode) where lenke_kode is not null;

alter table public.sidevisninger enable row level security;

-- nettstedet får bare LEGGE TIL rader – aldri lese, endre eller slette
drop policy if exists "alle registrerer visninger" on public.sidevisninger;
create policy "alle registrerer visninger"
  on public.sidevisninger for insert to anon, authenticated
  with check (true);

drop policy if exists "admin leser statistikken" on public.sidevisninger;
create policy "admin leser statistikken"
  on public.sidevisninger for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Statistikk-funksjonen admin-panelet spør
-- Teller opp alt i databasen (i stedet for å hente tusenvis av rader til
-- nettleseren). Datoer regnes i norsk tid. Kun for innloggede.
-- ---------------------------------------------------------------------------
create or replace function public.hent_statistikk(fra timestamptz, til timestamptz)
returns jsonb
language sql stable
set search_path = public
as $$
  with utvalg as (
    select * from sidevisninger where tidspunkt >= fra and tidspunkt < til
  )
  select jsonb_build_object(
    'totalt', (
      select jsonb_build_object(
        'visninger', count(*),
        'unike', count(distinct okt_id)
      ) from utvalg
    ),
    'dager', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'dag', dag, 'visninger', visninger, 'unike', unike
      ) order by dag), '[]'::jsonb)
      from (
        select (tidspunkt at time zone 'Europe/Oslo')::date as dag,
               count(*) as visninger,
               count(distinct okt_id) as unike
        from utvalg group by 1
      ) d
    ),
    'sider', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'sti', sti, 'visninger', visninger
      ) order by visninger desc), '[]'::jsonb)
      from (
        select sti, count(*) as visninger
        from utvalg group by sti order by count(*) desc limit 20
      ) s
    ),
    'kilder', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'kilde', kilde, 'okter', okter
      ) order by okter desc), '[]'::jsonb)
      from (
        select coalesce(kilde, 'direkte') as kilde,
               count(distinct okt_id) as okter
        from utvalg group by 1 order by count(distinct okt_id) desc limit 20
      ) k
    ),
    'enheter', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'enhet', enhet, 'okter', okter
      )), '[]'::jsonb)
      from (
        select enhet, count(distinct okt_id) as okter
        from utvalg group by enhet
      ) e
    ),
    'lenker', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'kode', lenke_kode, 'visninger', visninger, 'okter', okter
      ) order by okter desc), '[]'::jsonb)
      from (
        select lenke_kode, count(*) as visninger,
               count(distinct okt_id) as okter
        from utvalg where lenke_kode is not null
        group by lenke_kode
      ) l
    )
  )
$$;

-- funksjonen er kun for admin-panelet
revoke execute on function public.hent_statistikk(timestamptz, timestamptz) from public;
revoke execute on function public.hent_statistikk(timestamptz, timestamptz) from anon;
grant execute on function public.hent_statistikk(timestamptz, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- Lagringsbøtte for opplastede bilder (blogg + galleri)
-- Offentlig lesing (bildene vises jo på nettstedet), opplasting kun for admin.
--
-- NB: På enkelte Supabase-prosjekter nekter SQL-editoren å lage regler på
-- storage-tabellene («must be owner of table objects»). Da lages bøtta og
-- reglene i stedet i dashbordet: Storage → New bucket «bilder» (Public) og
-- Storage → bilder → Policies. Blokken under prøver, og sier klart ifra i
-- meldingsfeltet om den ikke fikk lov.
-- ---------------------------------------------------------------------------
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('bilder', 'bilder', true)
  on conflict (id) do update set public = true;
exception when others then
  raise notice 'Fikk ikke laget bøtta via SQL (%). Lag den i dashbordet: Storage → New bucket «bilder», huk av Public.', sqlerrm;
end $$;

do $$
begin
  drop policy if exists "alle leser bilder" on storage.objects;
  create policy "alle leser bilder"
    on storage.objects for select to anon, authenticated
    using (bucket_id = 'bilder');

  drop policy if exists "admin laster opp bilder" on storage.objects;
  create policy "admin laster opp bilder"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'bilder');

  drop policy if exists "admin erstatter bilder" on storage.objects;
  create policy "admin erstatter bilder"
    on storage.objects for update to authenticated
    using (bucket_id = 'bilder') with check (bucket_id = 'bilder');

  drop policy if exists "admin sletter bilder" on storage.objects;
  create policy "admin sletter bilder"
    on storage.objects for delete to authenticated
    using (bucket_id = 'bilder');
exception when others then
  raise notice 'Fikk ikke laget storage-reglene via SQL (%). Lag dem i dashbordet: Storage → bilder → Policies (les for alle, skriv for authenticated).', sqlerrm;
end $$;
