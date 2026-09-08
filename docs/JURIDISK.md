# Juridisk gjennomgang av malerdelius.no

Gjort 8. september 2026, lokalt, uten push. Dette dokumentet er sjekklisten:
hva som er kontrollert, hva som ble endret i koden, og hva som må avgjøres av
Maler Delius AS selv før eller like etter at endringene legges ut.

## 1. Faktakontroll (kilder hentet 8. september 2026)

| Påstand på nettstedet | Kilde | Resultat |
| --- | --- | --- |
| Org.nr. 934 409 256 | Enhetsregisteret (data.brreg.no) | Riktig. Aksjeselskap, stiftet 14.10.2024, registrert i Foretaks- og MVA-registeret, 5 ansatte, næringskode 43.340. Styreleder Nicolae Secara. |
| Adresse «Ullevålsveien 76, 0454 Oslo» | Enhetsregisteret og Mittanbud | **Avvik.** Begge registre sier **Nedre Ullevål 3C, 0850 Oslo**. Designet (7. sep) skriver «Ullevålsveien 76 Bygg 22». På de juridiske sidene står nå begge: forretningsadresse (register) og besøksadresse (design). Kunden må bekrefte hvilken som skal stå i footer og JSON-LD. |
| «57 vurderinger på Mittanbud», skjermbilde «5.0 av 5 / 57 Evalueringer» | mittanbud.no/bedrift/9061904 | Profilen viser **58** vurderinger, snitt 5,0, **75 vunne jobber**. Tallene er rettet og samlet i `BEDRIFT.mittanbud*`; kortet tegnes av koden i stedet for skjermbildet. |
| «+300 utførte arbeider» | ingen | Lot seg ikke dokumentere. Byttet til «75 jobber vunnet på Mittanbud». Kan settes tilbake hvis kunden kan dokumentere 300 (fakturaer, oppdragsliste), jf. markedsføringsloven § 3. |
| «+7 År i Bransjen» | Enhetsregisteret | Selskapet er under to år gammelt. Ingen tidligere malerbedrift på Secara i registeret (Delius Secara ENK fra 2023 er budtjenester). Byttet til «+7 års erfaring per maler», som stemmer med teamet (7–16 år). |
| «Vi bruker kun miljøvennlige materialer», «sertifiserte miljømaterialer», «Miljøvennlige løsninger» | Forbrukertilsynets veileder om bærekraftpåstander | Generelle miljøpåstander krever dokumentasjon. De to setningene er gjort konkrete. **Overskriften «Miljøvennlige løsninger» står fortsatt** (den er tegnet i to linjer i designet); kunden bør enten dokumentere (Svanemerkede produkter, leverandørlister) eller la oss bytte den. |
| «Vi garanterer …», «Garantier og støtte», «Sikring av garantier» | Forbrukertilsynet, tjenesteloven § 20 f | En «garanti» må ha vilkår og kan ikke gi mindre enn loven. Vilkårssiden forklarer nå at ordet betyr de lovfestede rettighetene pluss det som står i tilbudet. Har kunden en egen garanti (f.eks. 5 år på utvendig maling), bør vilkårene skrives ned og legges i tilbudsmalen. |
| «over 5 års erfaring» (team) | teamsiden | Konsistent med malernes 7–16 år. Beholdt. |
| Kundevurderingene | Mittanbud | Ekte, ligger på en tredjepart der kunden ikke kan redigere dem. Kortet lenker dit. Ingen falske omtaler funnet på nettstedet. |

## 2. Hva nettstedet faktisk gjør (målt på live 8. september 2026)

- Ingen egne informasjonskapsler. Ingen skript fra tredjepart på forsiden
  (0 forespørsler til Google før endringene, bekreftet i kildekoden på live).
- Egen besøksteller mot Supabase (`sidevisninger`): sti, referrer-vert,
  mobil/desktop, økt-id. Økt-id-en lå i `sessionStorage`; **nå i minnet**.
- Google Maps-ramme på `/kontakt`: Google satte kapsler ved lasting. **Nå bak
  samtykke.**
- Google-taggen (Analytics 4, G-82M65MEYRW fra kundens Google Ads) ligger
  statisk i sidene med samtykkemodus v2 på «nei» før svar. Det er Googles
  anbefalte oppsett for EØS og det vanlige i Norge, men merk: før besøkeren
  svarer, sender taggen et samtykkeløst ping (side, IP-adresse i transport,
  ingen identifikator) til Google. Datatilsynet har ikke uttalt seg
  eksplisitt om slike ping; de lagrer ingenting i utstyret (utenfor ekomloven
  § 3-15), og grunnlaget etter GDPR er berettiget interesse i aggregerte
  besøkstall. Vil bedriften ha null risiko, kan taggen legges inn først etter
  ja igjen (slik den var før 8. sep kl. 21:30), men da finner ikke Google Ads
  den automatisk.
- Skjemaet: serverfunksjonen kjørte i `iad1` (Washington). **Nå `fra1`.**
- Resend sender fra `eu-west-1`, men lagrer logger i USA (DPF/SCC).
- Supabase-prosjektets region er ikke bekreftet (bak Cloudflare). Sjekk i
  Supabase-dashbordet under Project settings → General; ligger det i USA,
  vurder å opprette prosjektet på nytt i `eu-central-1` (bare statistikk og
  blogg, ingen kundedata).
- Vercel: hosting med tekniske logger (IP) i kort tid. DPF-sertifisert.
- Bakgrunnsmusikk: `localStorage md-musikk` bare når besøkeren trykker på
  knappen (nødvendig). Pixabay Content License tillater bruken uten
  kreditering.
- E-postkassen malerdelius@gmail.com er en privat Gmail-konto. Google gir
  ikke databehandleravtale på gratiskontoer. **Anbefalt:** Google Workspace
  (ca. 60–70 kr/mnd) eller en norsk e-postleverandør, så kundeopplysningene
  ligger under en databehandleravtale.

## 3. Hva som er bygget (se README, «Juridisk gjennomgang»)

Sider `/personvern`, `/informasjonskapsler`, `/vilkar`, `/angrerett`;
samtykkebanner med to formål; Google Analytics 4 bare etter samtykke; kart
bare etter samtykke; avkryssing i skjemaet; telefon eller e-post; footer med
juridiske lenker og «MVA»; CSP; EU-region for skjemaet; tekstene i tabellen
over.

## 4. Kunden må gjøre / bekrefte

1. **Adressen** (se tabellen). Registrert adresse er Nedre Ullevål 3C. Hvis
   Ullevålsveien 76 er et verksted eller en gammel adresse, bør footer og
   JSON-LD byttes; det er én linje i `src/lib/theme.ts` (`BEDRIFT.adresse`).
2. **Angreskjema med avtalebekreftelsen.** Angrerettloven § 8 og § 18: når en
   avtale inngås på telefon, e-post, via skjemaet eller hjemme hos kunden,
   skal kunden få bekreftelse på avtalen og angreskjema på papir eller e-post.
   Uten det løper angrefristen i 12 måneder, og bedriften kan miste retten til
   betaling for arbeid som er startet. Legg lenken til `/angrerett` og det
   offisielle skjemaet (regjeringen.no, «Skjema om angrerett») inn i
   tilbudsmalen. Ber kunden om oppstart før 14 dager, må det stå skriftlig i
   avtalen at kunden ber om det og godtar at angreretten faller bort når
   arbeidet er fullført (§ 12 og § 22 bokstav c).
3. **Databehandleravtaler.** Vercel og Resend har DPA-er i sine dashbord
   (godta dem én gang på kontoene). Google Analytics: «Data Processing Terms»
   ble godtatt ved opprettelsen av kontoen. Gmail: se punkt 2 over.
4. **Google Analytics-innstillinger.** Nettstedet bruker eiendommen Google
   Ads laget på kundens konto (G-82M65MEYRW). Kontroller der, under Admin:
   Google Signals AV, datadeling med Google AV, oppbevaring av hendelsesdata
   2 måneder (standard). Endres oppbevaringen til 14 måneder, må
   `/personvern` oppdateres («to måneder»). Eiendommen G-F8F8B1R8N8 på
   malerdeliusas@gmail.com kan slettes.
5. **Forsikring.** Tjenesteloven § 20 i: opplys om yrkesansvarsforsikring hvis
   bedriften har det. Vilkårssiden sier «på forespørsel og i tilbudet». Har
   bedriften forsikring, skriv selskap og dekning inn på `/vilkar`.
6. **Bildelisenser.** Foto av prosjekter og team er egne (DSC-filer, egne
   ansatte). Ikke bekreftet: akvarellsølene (`splash*.webp`) og de 17
   ikonene (3D-ikoner og strekikoner, trolig fra Flaticon/Freepik eller et
   Figma-bibliotek). Gratis-lisensene der krever kreditering. Be designeren
   (Victoria) om kilde og lisens, eller bytt ikonene til et fritt sett
   (Lucide er allerede en avhengighet). Logoen er kundens egen.
7. **Overskriften «Miljøvennlige løsninger»** og garantivilkårene, se
   tabellen.
8. **Designernotatene på Kontakt-siden** («Det jeg faktisk sikter til …»,
   «Forslag: …», listen «Teknisk», «Samme uttrykk: Skjemaet bygges i tråd med
   designet») er tekst skrevet til kunden, ikke til kundens kunder. De er
   beholdt etter Artioms beslutning 7. september, men de svekker
   troverdigheten og bør byttes når designet oppdateres.
9. **`supabase/oppsett.sql` må kjøres på nytt** (allowlisten for
   `registrer_visning` har fått de tre nye sidene).
10. **Google Search Console** kan få nytt sitemap (fire nye adresser).

## 5. Lovene som er lagt til grunn

- Personvernforordningen (GDPR) art. 5, 6, 7, 13, 15–21, 44–46; personopplysningsloven.
- Ekomloven § 3-15 (i kraft 1. januar 2025) og Datatilsynets veiledning om samtykke til informasjonskapsler.
- Markedsføringsloven §§ 3, 6, 7, 8; Forbrukertilsynets veileder om bærekraftpåstander og om brukeromtaler.
- Ehandelsloven § 8 (opplysningsplikt) og tjenesteloven § 20.
- Angrerettloven §§ 5, 8, 12, 18, 20–26.
- Håndverkertjenesteloven §§ 1, 22, 32.
- Bokføringsloven (oppbevaring fem år).
- Åndsverkloven (bilder og tekst).
- EU-U.S. Data Privacy Framework (overføring til Vercel, Resend, Google).
