-- ============================================================================
-- Maler Delius – lag (eller nullstill) en admin-bruker
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
-- gir tilgang til panelet.
--
-- Denne filen inneholder med vilje INGENTING annet enn innloggingen. SQL-
-- editoren kjører hele filen som én transaksjon, så en feil hvor som helst
-- ville rullet tilbake alt – og da hadde ingen hatt tilgang. Demoinnhold og
-- annet opprydding ligger i supabase/demo-innhold.sql.
--
--   >>> BYTT DE TO LINJENE UNDER FØR DU KJØRER. <<<
--   Et testpassord er greit mens du prøver panelet lokalt. Før nettstedet
--   legges ut: kjør denne på nytt med et ordentlig passord, og slett
--   testbrukeren (Authentication → Users → … → Delete user).
-- ============================================================================

set search_path = public, extensions;

do $$
declare
  -- ↓↓↓ ENDRE DISSE TO ↓↓↓
  v_epost   text := 'test@malerdelius.no';
  v_passord text := 'test1234';
  -- ↑↑↑ ENDRE DISSE TO ↑↑↑
  v_id uuid;
begin
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
end $$;

-- Sjekkliste
select 'Brukere i auth' as sjekk, count(*)::text as resultat from auth.users
union all
select 'E-poster med admin-tilgang', coalesce(string_agg(epost, ', '), 'INGEN')
from public.admin_epost;
