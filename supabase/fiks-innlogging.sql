-- ============================================================================
-- Maler Delius – reparer innlogging som svarer «Database error querying schema»
-- ============================================================================
-- Kjøres i Supabase: SQL Editor → lim inn hele fila → Run. Trygg å kjøre flere
-- ganger, og den rører ingenting annet enn tomme tekstfelt.
--
-- HVA SOM ER GALT
-- Lager man en bruker rett i auth.users med SQL, står en del tekstkolonner
-- igjen som NULL: confirmation_token, recovery_token, email_change og de
-- andre. Innloggingstjenesten (GoTrue) er skrevet i Go og leser disse feltene
-- rett inn i vanlige tekstvariabler, som ikke tåler NULL. Da faller hele
-- spørringen, og svaret utad blir «Database error querying schema» – som
-- høres ut som at databasen er nede, men egentlig bare betyr «tomt felt der
-- det skulle stått en tom tekst».
--
-- Riktig verdi er altså tom tekst (''), ikke NULL.
--
-- Kolonnene finnes i litt ulike sett fra versjon til versjon, så skriptet
-- sjekker først hvilke som faktisk er der, og rører bare dem.
-- ============================================================================

do $$
declare
  v_kolonne text;
  v_endret  int;
  v_sum     int := 0;
  -- alle tekstfeltene GoTrue leser uten å tåle NULL
  v_aktuelle text[] := array[
    'confirmation_token',
    'recovery_token',
    'email_change',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change',
    'phone_change_token',
    'reauthentication_token'
  ];
begin
  foreach v_kolonne in array v_aktuelle loop
    -- hopp over kolonner denne Supabase-versjonen ikke har
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'auth'
        and table_name = 'users'
        and column_name = v_kolonne
    ) then
      continue;
    end if;

    execute format(
      'update auth.users set %I = '''' where %I is null',
      v_kolonne, v_kolonne
    );
    get diagnostics v_endret = row_count;
    v_sum := v_sum + v_endret;

    if v_endret > 0 then
      raise notice 'Fylte ut % tomme felt i %', v_endret, v_kolonne;
    end if;
  end loop;

  if v_sum = 0 then
    raise notice 'Ingenting å rette – feltene var allerede i orden.';
  end if;
end $$;

-- Sjekkliste: alle skal stå med «i orden».
select
  u.email,
  case when u.email_confirmed_at is null then 'IKKE BEKREFTET' else 'bekreftet' end as e_post,
  case when exists (
    select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
  ) then 'i orden' else 'MANGLER IDENTITET' end as innlogging,
  case when exists (
    select 1 from public.admin_epost a where lower(a.epost) = lower(u.email)
  ) then 'admin' else 'vanlig bruker' end as tilgang
from auth.users u
order by u.created_at;
