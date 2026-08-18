-- ============================================================================
-- Maler Delius – database for blogg, galleri, besøksstatistikk og lenker
-- ============================================================================
-- Kjøres i Supabase: Dashboard → SQL Editor → lim inn hele filen → Run.
-- Skriptet er idempotent: å kjøre det på nytt gjør ingen skade, og det er
-- meningen at det kjøres på nytt når denne filen er oppdatert.
-- Nederst skriver skriptet ut en liten sjekkliste, så du ser at alt kom på plass.
--
-- SIKKERHETSMODELL
--   anon (nettstedet, ingen innlogging)
--     · leser publiserte blogginnlegg og galleribilder
--     · slår opp én sporingslenke av gangen (ser aldri hele lenkelisten)
--     · registrerer sidevisninger (kan ikke lese dem tilbake)
--   innlogget bruker som står i tabellen admin_epost  =  ADMIN
--     · full tilgang til alt
--   innlogget bruker som IKKE står der
--     · ser og gjør akkurat like mye som en vanlig besøkende
--
--   Det siste punktet er viktig: så lenge «Allow new users to sign up» står på
--   i Supabase, kan hvem som helst lage seg en bruker (den offentlige nøkkelen
--   ligger i nettleseren). Derfor er det e-postlisten – ikke det å være
--   innlogget – som gir tilgang. Skru gjerne av registrering i tillegg
--   (Authentication → Sign In / Up), men glemmer du det, er ingenting åpent.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0. Hvem er admin
-- ---------------------------------------------------------------------------
create table if not exists public.admin_epost (
  epost text primary key,
  lagt_til timestamptz not null default now()
);

-- Ingen policyer i det hele tatt: da er tabellen usynlig for både anon og
-- innloggede. Bare SQL-editoren og funksjonen under (SECURITY DEFINER) ser den.
alter table public.admin_epost enable row level security;

create or replace function public.er_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_epost
    where lower(epost) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;

revoke execute on function public.er_admin() from public;
revoke execute on function public.er_admin() from anon;
grant execute on function public.er_admin() to authenticated;


-- ---------------------------------------------------------------------------
-- 1. Blogg
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

-- innlogget: kladdene er bare for admin, resten ser det samme som publikum
drop policy if exists "admin leser alt" on public.blogg_innlegg;
create policy "admin leser alt"
  on public.blogg_innlegg for select to authenticated
  using (publisert or public.er_admin());

drop policy if exists "admin oppretter innlegg" on public.blogg_innlegg;
create policy "admin oppretter innlegg"
  on public.blogg_innlegg for insert to authenticated
  with check (public.er_admin());

drop policy if exists "admin endrer innlegg" on public.blogg_innlegg;
create policy "admin endrer innlegg"
  on public.blogg_innlegg for update to authenticated
  using (public.er_admin()) with check (public.er_admin());

drop policy if exists "admin sletter innlegg" on public.blogg_innlegg;
create policy "admin sletter innlegg"
  on public.blogg_innlegg for delete to authenticated
  using (public.er_admin());

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
-- 2. Galleri: overstyrte bilder på Portefølje-siden
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
  with check (public.er_admin());

drop policy if exists "admin endrer galleriet" on public.galleri_bilder;
create policy "admin endrer galleriet"
  on public.galleri_bilder for update to authenticated
  using (public.er_admin()) with check (public.er_admin());

drop policy if exists "admin sletter i galleriet" on public.galleri_bilder;
create policy "admin sletter i galleriet"
  on public.galleri_bilder for delete to authenticated
  using (public.er_admin());


-- ---------------------------------------------------------------------------
-- 3. Sporingslenker: korte adresser som malerdelius.no/l/facebook-host
-- ---------------------------------------------------------------------------
create table if not exists public.lenker (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique check (kode ~ '^[a-z0-9-]{1,60}$'),
  navn text not null check (char_length(navn) between 1 and 120),
  mal text not null default '/' check (mal ~ '^/[a-z0-9/-]{0,120}$'),
  opprettet timestamptz not null default now()
);

alter table public.lenker enable row level security;

-- Besøkende skal ikke kunne lese hele lenketabellen: kampanjenavnene er
-- interne («Facebook-annonse august»), og listen forteller hva vi holder på
-- med. Nettstedet slår derfor opp én kode av gangen gjennom funksjonen under,
-- og får bare vite hvor lenken peker.
drop policy if exists "alle leser lenker" on public.lenker;

drop policy if exists "admin leser lenker" on public.lenker;
create policy "admin leser lenker"
  on public.lenker for select to authenticated
  using (public.er_admin());

create or replace function public.slaa_opp_lenke(p_kode text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select mal from public.lenker where kode = lower(p_kode) limit 1
$$;

grant execute on function public.slaa_opp_lenke(text) to anon, authenticated;

drop policy if exists "admin oppretter lenker" on public.lenker;
create policy "admin oppretter lenker"
  on public.lenker for insert to authenticated
  with check (public.er_admin());

drop policy if exists "admin endrer lenker" on public.lenker;
create policy "admin endrer lenker"
  on public.lenker for update to authenticated
  using (public.er_admin()) with check (public.er_admin());

drop policy if exists "admin sletter lenker" on public.lenker;
create policy "admin sletter lenker"
  on public.lenker for delete to authenticated
  using (public.er_admin());


-- ---------------------------------------------------------------------------
-- 4. Sidevisninger: én rad per side noen ser på nettstedet
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

-- Nettleseren skriver IKKE lenger rett i tabellen. Den offentlige nøkkelen
-- ligger jo i bunten, og en åpen insert-policy betyr at hvem som helst kan
-- fylle statistikken med oppdiktede besøk og oppdiktede kampanjeklikk – tall
-- klienten faktisk tar beslutninger på. All registrering går nå gjennom
-- funksjonen registrer_visning under, som selv kontrollerer hva som slippes
-- inn. Den gamle policyen fjernes her, om den finnes fra før.
drop policy if exists "alle registrerer visninger" on public.sidevisninger;
revoke insert on public.sidevisninger from anon, authenticated;

drop policy if exists "admin leser statistikken" on public.sidevisninger;
create policy "admin leser statistikken"
  on public.sidevisninger for select to authenticated
  using (public.er_admin());

drop policy if exists "admin rydder statistikken" on public.sidevisninger;
create policy "admin rydder statistikken"
  on public.sidevisninger for delete to authenticated
  using (public.er_admin());

-- Registrering av én sidevisning. SECURITY DEFINER, så den skriver på vegne
-- av databasen og ikke av den besøkende, og den slipper bare gjennom det som
-- gir mening:
--   · stien må være en av nettstedets egne sider (samme liste som spor.ts)
--   · kampanjekoden må finnes i lenker – ellers lagres den ikke
--   · maks 200 visninger per økt per time, så ingen kan pumpe inn tusenvis
-- Funksjonen sier aldri fra om noe ble avvist: en teller skal ikke fortelle
-- en robot hvordan den skal oppføre seg for å slippe forbi.
create or replace function public.registrer_visning(
  p_sti text,
  p_kilde text default null,
  p_lenke_kode text default null,
  p_enhet text default 'desktop',
  p_okt uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kode text;
begin
  if p_okt is null then
    return;
  end if;

  if p_sti not in ('/', '/om-oss', '/portefolje', '/malertjenester', '/kontakt', '/blogg', '/personvern')
     and p_sti !~ '^/blogg/[a-z0-9-]{1,120}$' then
    return;
  end if;

  if (select count(*) from public.sidevisninger
       where okt_id = p_okt and tidspunkt > now() - interval '1 hour') >= 200 then
    return;
  end if;

  -- En kode som ikke finnes hos oss, lagres ikke. Ellers kunne hvem som helst
  -- dikte opp kampanjer som aldri har eksistert.
  select kode into v_kode from public.lenker where kode = lower(coalesce(p_lenke_kode, ''));

  insert into public.sidevisninger (sti, kilde, lenke_kode, enhet, okt_id)
  values (
    left(p_sti, 200),
    nullif(left(coalesce(p_kilde, ''), 120), ''),
    v_kode,
    case when p_enhet = 'mobil' then 'mobil' else 'desktop' end,
    p_okt
  );
end $$;

revoke execute on function public.registrer_visning(text, text, text, text, uuid) from public;
grant execute on function public.registrer_visning(text, text, text, text, uuid) to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 5. Statistikk-funksjonene admin-panelet spør
--
-- Hele regnestykket gjøres her, ikke i nettleseren. Det er ikke bare
-- raskere – det er også den eneste måten å få datoene riktige på: dagene
-- grupperes i norsk tid, og da må også periodens start og selve
-- dagslisten regnes ut i norsk tid. Regnet nettleseren ut datoene selv,
-- ville en maskin med en annen tidssone lete etter dager som ikke finnes
-- i svaret, og ekte trafikk ville falt ut av grafen.
--
-- Serien kommer ferdig utfylt: dager uten besøk er med som 0, slik at
-- grafen viser hele perioden uten hull.
-- ---------------------------------------------------------------------------

-- den gamle utgaven tok fra/til – den erstattes av dager/måneder under
drop function if exists public.hent_statistikk(timestamptz, timestamptz);

create or replace function public.hent_statistikk(dager int)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  svar jsonb;
  v_dager int := greatest(1, least(coalesce(dager, 30), 400));
  v_fra_dag date;
  v_i_dag date;
  v_fra timestamptz;
  v_til timestamptz;
begin
  if not public.er_admin() then
    raise exception 'Ingen admin-tilgang'
      using hint = 'Legg e-postadressen inn i tabellen admin_epost.';
  end if;

  v_i_dag := (now() at time zone 'Europe/Oslo')::date;
  v_fra_dag := v_i_dag - (v_dager - 1);
  v_fra := v_fra_dag::timestamp at time zone 'Europe/Oslo';
  v_til := now() + interval '1 minute';

  with utvalg as (
    select s.*, (s.tidspunkt at time zone 'Europe/Oslo')::date as dag
    from sidevisninger s
    where s.tidspunkt >= v_fra and s.tidspunkt < v_til
  ),
  serie as (
    select d::date as dag,
           count(u.id) as visninger,
           count(distinct u.okt_id) as unike
    from generate_series(v_fra_dag, v_i_dag, interval '1 day') d
    left join utvalg u on u.dag = d::date
    group by 1
  )
  select jsonb_build_object(
    'fra', v_fra,
    'til', v_til,
    'totalt', (
      select jsonb_build_object(
        'visninger', count(*),
        'unike', count(distinct okt_id)
      ) from utvalg
    ),
    'serie', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'merke', to_char(dag, 'YYYY-MM-DD'),
        'visninger', visninger,
        'unike', unike
      ) order by dag), '[]'::jsonb) from serie
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
  ) into svar;

  return svar;
end $$;

revoke execute on function public.hent_statistikk(int) from public;
revoke execute on function public.hent_statistikk(int) from anon;
grant execute on function public.hent_statistikk(int) to authenticated;

/**
 * Samme svarform, men gruppert på måned og med hele kalendermåneder.
 * «Unike» regnes her per måned, ikke som en sum av dagstall – å legge
 * sammen dagstall ville telt den samme besøkende én gang per dag.
 */
create or replace function public.hent_statistikk_maneder(maneder int)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  svar jsonb;
  v_ant int := greatest(1, least(coalesce(maneder, 12), 36));
  v_fra_mnd date;
  v_denne_mnd date;
  v_fra timestamptz;
  v_til timestamptz;
begin
  if not public.er_admin() then
    raise exception 'Ingen admin-tilgang'
      using hint = 'Legg e-postadressen inn i tabellen admin_epost.';
  end if;

  v_denne_mnd := date_trunc('month', (now() at time zone 'Europe/Oslo')::date)::date;
  v_fra_mnd := (v_denne_mnd - make_interval(months => v_ant - 1))::date;
  v_fra := v_fra_mnd::timestamp at time zone 'Europe/Oslo';
  v_til := now() + interval '1 minute';

  with utvalg as (
    select s.*,
           date_trunc('month', (s.tidspunkt at time zone 'Europe/Oslo'))::date as mnd
    from sidevisninger s
    where s.tidspunkt >= v_fra and s.tidspunkt < v_til
  ),
  serie as (
    select m::date as mnd,
           count(u.id) as visninger,
           count(distinct u.okt_id) as unike
    from generate_series(v_fra_mnd, v_denne_mnd, interval '1 month') m
    left join utvalg u on u.mnd = m::date
    group by 1
  )
  select jsonb_build_object(
    'fra', v_fra,
    'til', v_til,
    'totalt', (
      select jsonb_build_object(
        'visninger', count(*),
        'unike', count(distinct okt_id)
      ) from utvalg
    ),
    'serie', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'merke', to_char(mnd, 'YYYY-MM-DD'),
        'visninger', visninger,
        'unike', unike
      ) order by mnd), '[]'::jsonb) from serie
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
  ) into svar;

  return svar;
end $$;

revoke execute on function public.hent_statistikk_maneder(int) from public;
revoke execute on function public.hent_statistikk_maneder(int) from anon;
grant execute on function public.hent_statistikk_maneder(int) to authenticated;

/** Klikktall per sporingslenke, for hele historikken. */
create or replace function public.lenke_klikk()
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  svar jsonb;
begin
  if not public.er_admin() then
    raise exception 'Ingen admin-tilgang'
      using hint = 'Legg e-postadressen inn i tabellen admin_epost.';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'kode', lenke_kode, 'visninger', visninger, 'okter', okter
  ) order by okter desc), '[]'::jsonb)
  into svar
  from (
    select lenke_kode, count(*) as visninger, count(distinct okt_id) as okter
    from sidevisninger where lenke_kode is not null
    group by lenke_kode
  ) t;

  return svar;
end $$;

revoke execute on function public.lenke_klikk() from public;
revoke execute on function public.lenke_klikk() from anon;
grant execute on function public.lenke_klikk() to authenticated;


-- ---------------------------------------------------------------------------
-- 6. Lagringsbøtte for opplastede bilder (blogg + galleri)
-- Offentlig lesing (bildene vises jo på nettstedet), opplasting kun for admin.
--
-- NB: På enkelte prosjekter nekter SQL-editoren å lage regler på storage-
-- tabellene («must be owner of table objects»). Sjekklisten nederst sier
-- tydelig ifra hvis det skjedde, og da lages de i dashbordet i stedet:
-- Storage → bilder → Policies.
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
  -- Ingen leseregel for anon: bøtta er offentlig, så bildene hentes uten
  -- videre gjennom /storage/v1/object/public/…. En leseregel ville i tillegg
  -- latt hvem som helst LISTE hele bøtta, altså også bilder som hører til
  -- innlegg som ennå ligger som kladd.
  drop policy if exists "alle leser bilder" on storage.objects;

  drop policy if exists "admin leser bilder" on storage.objects;
  create policy "admin leser bilder"
    on storage.objects for select to authenticated
    using (bucket_id = 'bilder' and public.er_admin());

  drop policy if exists "admin laster opp bilder" on storage.objects;
  create policy "admin laster opp bilder"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'bilder' and public.er_admin());

  drop policy if exists "admin erstatter bilder" on storage.objects;
  create policy "admin erstatter bilder"
    on storage.objects for update to authenticated
    using (bucket_id = 'bilder' and public.er_admin())
    with check (bucket_id = 'bilder' and public.er_admin());

  drop policy if exists "admin sletter bilder" on storage.objects;
  create policy "admin sletter bilder"
    on storage.objects for delete to authenticated
    using (bucket_id = 'bilder' and public.er_admin());
exception when others then
  raise notice 'Fikk ikke laget storage-reglene via SQL (%). Lag dem i dashbordet: Storage → bilder → Policies.', sqlerrm;
end $$;


-- ---------------------------------------------------------------------------
-- 7. Sjekkliste – dette er det du ser i resultatvinduet
-- ---------------------------------------------------------------------------
select 'Tabeller på plass (4 forventet)' as sjekk,
       count(*)::text || ' av 4' as resultat,
       case when count(*) = 4 then 'OK' else 'MANGLER' end as status
from information_schema.tables
where table_schema = 'public'
  and table_name in ('blogg_innlegg', 'galleri_bilder', 'lenker', 'sidevisninger')

union all
select 'Funksjoner på plass (5 forventet)',
       count(*)::text || ' av 5',
       case when count(*) = 5 then 'OK' else 'MANGLER' end
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('er_admin', 'hent_statistikk', 'hent_statistikk_maneder',
                    'slaa_opp_lenke', 'lenke_klikk')

union all
select 'Bildebøtta «bilder» finnes og er offentlig',
       coalesce((select case when public then 'ja, offentlig' else 'ja, men PRIVAT' end
                 from storage.buckets where id = 'bilder'), 'nei'),
       case when exists (select 1 from storage.buckets where id = 'bilder' and public)
            then 'OK' else 'MANGLER' end

union all
select 'Storage-regler for bildene (4 forventet)',
       count(*)::text || ' av 4',
       case when count(*) = 4 then 'OK' else 'LAG DEM I DASHBORDET' end
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname in ('admin leser bilder', 'admin laster opp bilder',
                     'admin erstatter bilder', 'admin sletter bilder')

union all
select 'Admin-e-poster registrert',
       count(*)::text || case when count(*) = 0 then ' – INGEN har tilgang ennå' else '' end,
       case when count(*) > 0 then 'OK' else 'LEGG INN E-POST' end
from public.admin_epost

union all
select 'Registrering av nye brukere er avslått',
       'sjekk Authentication → Sign In / Up',
       'ANBEFALT';
