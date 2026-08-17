-- ============================================================================
-- Maler Delius – demoinnhold (helt frivillig)
-- ============================================================================
-- Legger inn ett ferdig blogginnlegg, så bloggen har noe å vise med én gang,
-- og rydder bort testraden som ble brukt til å kontrollere sikkerhetsreglene.
--
-- Slett innlegget i panelet når du har sett at alt virker:
-- Blogg → Rediger → Slett innlegget.
--
-- Ligger i sin egen fil med vilje: SQL-editoren kjører en fil som én
-- transaksjon, og innlogging (lag-admin-bruker.sql) skal ikke kunne bli
-- rullet tilbake av en feil i noe så uviktig som et demoinnlegg.
-- ============================================================================

insert into public.blogg_innlegg
  (tittel, slug, ingress, innhold, publisert, publisert_dato)
values (
  'Slik velger du riktig hvitfarge',
  'slik-velger-du-riktig-hvitfarge',
  'Hvitt er aldri bare hvitt. Her er de tre spørsmålene vi alltid stiller før vi anbefaler en farge til et rom.',
  E'Hvitt er den mest brukte fargen i norske hjem, og samtidig den vanskeligste å velge. To vegger malt i to ulike hvitfarger kan se helt like ut i butikken, og helt forskjellige ut hjemme hos deg.\n\n## Hvor kommer lyset fra?\n\nEt rom med vinduer mot nord får kjølig lys hele dagen. Der vil en hvitfarge med et snev av gult eller rødt i seg holde varmen i rommet. Mot sør blir lyset varmt av seg selv, og da kan en nøytral eller litt kjølig hvit gi den roen du er etter.\n\n## Hva står i rommet?\n\nEik og furu drar hvitfargen mot det gule. Er gulvet grått, eller er kjøkkenet svart og hvitt, tåler veggene en renere hvit.\n\n- **Test alltid på veggen** – aldri bare på fargekartet\n- Mal en flate på minst 50 x 50 cm\n- Se på den morgen, ettermiddag og kveld\n\n## Skal taket ha samme farge?\n\nOftest ikke. Vi maler som regel taket et par nyanser lysere enn veggene, så rommet føles høyere uten at overgangen blir hard.\n\n> Er du usikker, kommer vi gjerne på en gratis befaring og ser på rommet sammen med deg.\n\nTa kontakt, så finner vi fargen som passer akkurat ditt hjem.',
  true,
  now()
)
on conflict (slug) do nothing;

delete from public.sidevisninger where sti = '/test-rls';

select 'Blogginnlegg i basen' as sjekk, count(*)::text as resultat
from public.blogg_innlegg;
