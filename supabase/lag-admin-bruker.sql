-- ============================================================================
-- Maler Delius – lag (eller nullstill) admin-brukeren
-- ============================================================================
-- Kjør supabase/oppsett.sql FØRST. Deretter denne, i SQL Editor.
--
-- Hvorfor SQL og ikke dashbordet? Prosjektet krever bekreftelse på e-post, og
-- den innebygde e-postsendingen er strupet. Her settes brukeren opp ferdig
-- bekreftet med én gang, uten at noen e-post må sendes eller klikkes.
-- (Dashbordet virker også: Authentication → Users → Add user → huk av
--  «Auto Confirm User». Da må e-posten legges inn i admin_epost i tillegg.)
--
-- Skriptet er trygt å kjøre flere ganger: finnes brukeren, får den bare nytt
-- passord. E-posten legges samtidig inn i admin_epost, som er det som faktisk
-- gir tilgang til panelet. Samtidig fjernes den gamle testbrukeren, både fra
-- innloggingen og fra admin-lista.
--
-- ----------------------------------------------------------------------------
--   PASSORDET SKAL ALDRI STÅ I DENNE FILA.
--
--   Kodelageret på GitHub er offentlig. Et passord som blir lagt inn her og
--   sjekket inn, er dermed lest av hvem som helst, og hele panelet står åpent.
--   Derfor: lim inn passordet på linja under RETT FØR du trykker Run i SQL
--   Editor, og la fila på disk beholde plassholderen. Skriptet nekter å kjøre
--   med plassholderen eller med et passord kortere enn 12 tegn.
-- ----------------------------------------------------------------------------

set search_path = public, extensions;

do $$
declare
  -- ↓↓↓ SETT PASSORDET HER, BARE I SQL-EDITOREN ↓↓↓
  v_epost   text := 'malerdelius@gmail.com';
  v_passord text := 'SETT-PASSORD-HER';
  -- ↑↑↑ SETT PASSORDET HER, BARE I SQL-EDITOREN ↑↑↑

  -- Gammel testbruker som skal bort. Sett til null om det ikke finnes noen.
  v_gammel  text := 'test@malerdelius.no';

  v_id uuid;
  v_gammel_id uuid;
begin
  if v_passord = 'SETT-PASSORD-HER' or length(v_passord) < 12 then
    raise exception 'Sett et ekte passord på minst 12 tegn før du kjører skriptet.';
  end if;

  select id into v_id from auth.users where lower(email) = lower(v_epost);

  if v_id is null then
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      lower(v_epost), crypt(v_passord, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb
    );

    -- GoTrue krever en identitetsrad for at passordinnlogging skal virke.
    -- Kolonnen provider_id kom til i en nyere versjon, så vi sjekker først –
    -- da virker skriptet uansett hvilken versjon prosjektet kjører.
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'auth' and table_name = 'identities'
        and column_name = 'provider_id'
    ) then
      insert into auth.identities (
        provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        v_id::text, v_id,
        jsonb_build_object('sub', v_id::text, 'email', lower(v_epost),
                           'email_verified', true, 'phone_verified', false),
        'email', now(), now(), now()
      );
    else
      insert into auth.identities (
        user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        v_id, jsonb_build_object('sub', v_id::text, 'email', lower(v_epost),
                                 'email_verified', true, 'phone_verified', false),
        'email', now(), now(), now()
      );
    end if;

    raise notice 'Brukeren % er opprettet og ferdig bekreftet.', v_epost;
  else
    update auth.users
       set encrypted_password = crypt(v_passord, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = v_id;

    raise notice 'Brukeren % fantes alt – passordet er satt på nytt.', v_epost;
  end if;

  -- dette er det som gir admin-tilgang
  insert into public.admin_epost (epost) values (lower(v_epost))
    on conflict (epost) do nothing;

  -- ---------------------------------------------------------------------
  -- Bort med testbrukeren: først admin-retten, så selve innloggingen.
  -- Rekkefølgen er med vilje – mister vi tilgangen halvveis, står vi igjen
  -- med en bruker uten rettigheter, ikke med en rettighet uten eier.
  -- ---------------------------------------------------------------------
  if v_gammel is not null and lower(v_gammel) <> lower(v_epost) then
    delete from public.admin_epost where lower(epost) = lower(v_gammel);

    select id into v_gammel_id from auth.users where lower(email) = lower(v_gammel);
    if v_gammel_id is not null then
      delete from auth.identities where user_id = v_gammel_id;
      delete from auth.users where id = v_gammel_id;
      raise notice 'Testbrukeren % er slettet.', v_gammel;
    end if;
  end if;
end $$;

-- Sjekkliste
select 'Brukere i auth' as sjekk, count(*)::text as resultat from auth.users
union all
select 'E-poster med admin-tilgang', coalesce(string_agg(epost, ', '), 'INGEN')
from public.admin_epost
union all
select 'Testbrukeren finnes ennå',
       case when exists (select 1 from auth.users where lower(email) = 'test@malerdelius.no')
            then 'JA – slett den manuelt' else 'nei' end;
