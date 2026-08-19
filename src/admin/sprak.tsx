import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Språk i admin-panelet: norsk og rumensk. Valget lagres i nettleseren og
 * gjelder bare panelet – selve nettstedet er norsk uansett.
 *
 * Ordboka er skrevet ut i sin helhet for begge språk, og typene passer på
 * at ingen nøkkel mangler i oversettelsen: legger du til en norsk tekst
 * uten rumensk motpart, nekter TypeScript å bygge.
 */

export type Sprak = 'no' | 'ro'

const LAGRET = 'md-adm-sprak'

const NO = {
  // meny og ramme
  'meny.oversikt': 'Oversikt',
  'meny.blogg': 'Blogg',
  'meny.galleri': 'Galleri',
  'meny.statistikk': 'Statistikk',
  'meny.lenker': 'Lenker',
  'meny.seNettstedet': 'Se nettstedet',
  'meny.loggUt': 'Logg ut',
  'meny.aria': 'Admin-meny',
  'sprak.bytt': 'Bytt språk',

  // oppsett mangler
  'oppsett.tittel': 'Admin er ikke satt opp',
  'oppsett.tekst':
    'Legg VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY i .env-filen (se .env.example) og start utviklingsserveren på nytt.',

  // innlogging og vakt
  'login.tittel': 'Admin-panelet',
  'login.under': 'Logg inn for å styre bloggen, galleriet og statistikken.',
  'login.epost': 'E-post',
  'login.passord': 'Passord',
  'login.knapp': 'Logg inn',
  'login.venter': 'Logger inn …',
  'vakt.sjekkerInn': 'Sjekker innlogging …',
  'vakt.sjekkerTilgang': 'Sjekker tilgangen …',
  'vakt.ingenTilgang': 'Ingen admin-tilgang',
  'vakt.innloggetSom': 'Du er logget inn{hvem}, men denne brukeren har ikke tilgang til panelet.',
  'vakt.som': ' som {epost}',
  'vakt.leggInn': 'Legg adressen inn i databasen for å gi tilgang. I Supabase → SQL Editor:',

  // felles
  'felles.publisert': 'Publisert',
  'felles.kladd': 'Kladd',
  'felles.rediger': 'Rediger',
  'felles.lagre': 'Lagre',
  'felles.lagrer': 'Lagrer …',

  // oversikten
  'dash.under': 'Velkommen tilbake! Slik står det til med nettstedet akkurat nå.',
  'dash.nytt': 'Nytt innlegg',
  'dash.iDag': 'I dag',
  'dash.siste7': 'Siste 7 dager',
  'dash.visninger': 'sidevisninger',
  'dash.siste30': 'Siste 30 dager',
  'dash.seStatistikk': 'Se hele statistikken →',
  'dash.sisteInnlegg': 'Siste innlegg',
  'dash.ingenInnlegg': 'Ingen innlegg ennå – trykk «Nytt innlegg» og kom i gang!',
  'dash.snarveier': 'Snarveier',
  'dash.snarveiBlogg': 'Skriv og rediger blogginnlegg',
  'dash.snarveiGalleri': 'Bytt bilder i galleriet',
  'dash.snarveiLenker': 'Lag delbare sporingslenker',
  'dash.snarveiStatistikk': 'Se besøkstallene',
  'dash.henter': 'Henter tallene …',

  // blogglisten
  'liste.under': 'Skriv nytt, rediger og publiser innlegg på nettstedet.',
  'liste.henter': 'Henter innleggene …',
  'liste.tomTittel': 'Ingen innlegg ennå',
  'liste.tomTekst': 'Trykk «Nytt innlegg» og skriv det første – det tar bare noen minutter.',
  'liste.tittel': 'Tittel',
  'liste.status': 'Status',
  'liste.sistEndret': 'Sist endret',
  'liste.se': 'Se',

  // redigering
  'red.alle': 'Alle innlegg',
  'red.nytt': 'Nytt innlegg',
  'red.rediger': 'Rediger innlegg',
  'red.slett': 'Slett innlegget',
  'red.slettSporsmal': 'Slette innlegget for godt? Dette kan ikke angres.',
  'red.trengerTittel': 'Innlegget trenger en tittel.',
  'red.tomSlug': 'Adressen (slug) kan ikke være tom.',
  'red.lagretPublisert': 'Innlegget er lagret og publisert.',
  'red.lagretKladd': 'Kladden er lagret.',
  'red.lagretUte': 'Innlegget er lagret og ligger ute.',
  'red.lagretSomKladd': 'Lagret som kladd.',
  'red.fantIkke': 'Fant ikke innlegget.',
  'red.henter': 'Henter innlegget …',
  'red.tittel': 'Tittel',
  'red.tittelPlassholder': 'F.eks. Slik velger du riktig hvitfarge',
  'red.slug': 'Adresse (slug)',
  'red.slugHjelp': 'Innlegget får adressen malerdelius.no/blogg/{slug}',
  'red.ingress': 'Ingress',
  'red.ingressHjelp': 'Én–to setninger som vises i bloggoversikten.',
  'red.toppbilde': 'Toppbilde',
  'red.velgBilde': 'Velg bilde',
  'red.byttBilde': 'Bytt bilde',
  'red.fjern': 'Fjern',
  'red.lasterOpp': 'Laster opp …',
  'red.innhold': 'Innhold',
  'red.fet': 'Fet',
  'red.kursiv': 'Kursiv',
  'red.overskrift': 'Overskrift',
  'red.punktliste': 'Punktliste',
  'red.lenke': 'Lenke',
  'red.bilde': 'Bilde',
  'red.settInnBilde': 'Sett inn bilde',
  'red.innholdPlassholder':
    'Skriv innlegget her.\n\nTomme linjer gir nye avsnitt. Bruk knappene over for fet, kursiv, overskrifter, lister, lenker og bilder.',
  'red.forhandTittel': 'Slik ser det ut på nettstedet',
  'red.forhandTom': 'Forhåndsvisningen dukker opp når du skriver.',
  'red.fetTekst': 'fet tekst',
  'red.kursivTekst': 'kursiv tekst',
  'red.overskriftTekst': 'Overskrift',
  'red.punktTekst': 'punkt',
  'red.lenkeTekst': 'lenketekst',
  'red.bildetekst': 'Skriv en bildetekst her',

  // galleriet
  'gal.under':
    'Portefølje-siden i miniatyr, med bildene der de faktisk står. Bytt et bilde rett på plassen sin, eller hent originalen tilbake.',
  'gal.seSiden': 'Se siden',
  'gal.bytt': 'Bytt',
  'gal.original': 'Original',
  'gal.byttet': 'Byttet',
  'gal.jobber': 'Jobber …',
  'gal.henter': 'Henter galleriet …',
  'gal.gjelderBegge': 'Endringene gjelder både datamaskin- og mobilutgaven av siden.',
  'gal.plass': 'Bilde {nr}: {navn}',

  // statistikken
  'stat.under': 'Besøk på nettstedet, uten informasjonskapsler og uten å lagre noe om den enkelte.',
  'stat.p7': '7 dager',
  'stat.p30': '30 dager',
  'stat.p90': '90 dager',
  'stat.p12': '12 måneder',
  'stat.sidevisninger': 'Sidevisninger',
  'stat.sisteX': 'siste {periode}',
  'stat.unike': 'Unike besøk',
  'stat.unikeDetalj': 'økter – én per besøkende per fane',
  'stat.mestSett': 'Mest sett',
  'stat.ingenBesok': 'ingen besøk ennå',
  'stat.fraMobil': 'Fra mobil',
  'stat.andel': 'andel av øktene',
  'stat.besokPerDag': 'Besøk per dag',
  'stat.besokPerManed': 'Besøk per måned',
  'stat.visTabell': 'Vis tabell',
  'stat.visDiagram': 'Vis diagram',
  'stat.dag': 'Dag',
  'stat.maned': 'Måned',
  'stat.tomPeriode':
    'Ingen besøk registrert i perioden ennå. Tallene begynner å rulle inn så snart noen åpner nettstedet.',
  'stat.mestSette': 'Mest sette sider',
  'stat.kilder': 'Hvor besøkene kom fra',
  'stat.direkte': 'Direkte / skrev inn adressen',
  'stat.ingenKilder': 'Ingen kilder registrert ennå.',
  'stat.enheter': 'Enheter',
  'stat.mobil': 'Mobil',
  'stat.datamaskin': 'Datamaskin',
  'stat.lenketrafikk': 'Trafikk fra lenkene dine',
  'stat.lenkeTom':
    'Ingen besøk via sporingslenker i perioden. Lag lenker under «Lenker» og del dem – så dukker tallene opp her.',
  'stat.lenke': 'Lenke',
  'stat.besok': 'Besøk',
  'stat.visningerKol': 'Visninger',
  'stat.teller': 'Teller opp besøkene …',
  'stat.ingenting': 'Ingenting å vise ennå.',

  // sidenavn
  'side.forsiden': 'Forsiden',
  'side.omOss': 'Om oss',
  'side.portefolje': 'Portefølje',
  'side.malertjenester': 'Malertjenester',
  'side.kontakt': 'Kontakt',
  'side.blogg': 'Blogg',
  'side.bloggPrefiks': 'Blogg: {slug}',

  // lenker
  'len.under':
    'Lag en egen adresse for hver deling – annonse, innlegg, e-post – og se hvor mange som kom via hver av dem.',
  'len.ny': 'Ny lenke',
  'len.navn': 'Navn',
  'len.navnHjelp': 'Bare for deg, f.eks. «Facebook-annonse august».',
  'len.navnPlassholder': 'Facebook-annonse august',
  'len.kode': 'Kode',
  'len.kodeHjelp': 'Adressen blir {vert}/l/{kode}',
  'len.malside': 'Sender besøkende til',
  'len.lag': 'Lag lenken',
  'len.lager': 'Lager …',
  'len.henter': 'Henter lenkene …',
  'len.giNavn': 'Gi lenken et navn – koden lages av seg selv.',
  'len.adresse': 'Adresse',
  'len.gaarTil': 'Går til',
  'len.laget': 'Laget',
  'len.kopier': 'Kopier',
  'len.kopiert': 'Kopiert!',
  'len.slettSporsmal': 'Slette lenken «{navn}»? Gamle delinger av den vil da gå til forsiden.',
  'len.tomTittel': 'Ingen lenker ennå',
  'len.tomTekst':
    'Lag den første over – gi den et navn, kopier adressen og del den der du vil måle effekten.',
  'len.kopierManuelt': 'Kopier adressen:',
  'len.slett': 'Slett lenken',

  // diagrammet
  'diagram.visninger': 'Sidevisninger',
  'diagram.unike': 'Unike besøk',
  'diagram.aria': 'Besøk over tid',

  // feilmeldinger
  'feil.innlogging': 'Feil e-post eller passord.',
  'feil.ikkeBekreftet': 'E-postadressen er ikke bekreftet ennå.',
  'feil.slugOpptatt': 'Det finnes alt et innlegg med denne adressen (slug). Velg en annen.',
  'feil.kodeOpptatt': 'Det finnes alt en lenke med denne koden. Velg en annen.',
  'feil.ugyldigVerdi': 'Ett av feltene har en verdi som ikke godtas. Sjekk lengde og tegn.',
  'feil.nett': 'Fikk ikke kontakt med databasen. Sjekk nettforbindelsen.',
  'feil.botteMangler': 'Bildelageret «bilder» finnes ikke ennå – kjør oppsettet i Supabase først.',
  'feil.tabellerMangler':
    'Databasetabellene er ikke laget ennå – kjør supabase/oppsett.sql i Supabase først.',
  'feil.ikkeAdmin':
    'Denne brukeren har ikke admin-tilgang. Legg e-postadressen inn i tabellen admin_epost i Supabase.',
  'feil.rls':
    'Ingen tilgang til å lagre dette. Sjekk at e-postadressen din står i tabellen admin_epost i Supabase.',
  'feil.ikkeBilde': 'Filen er ikke et bilde.',
} as const

export type Nokkel = keyof typeof NO

/** Rumensk. Typen tvinger fram nøyaktig de samme nøklene som i den norske. */
const RO: Record<Nokkel, string> = {
  'meny.oversikt': 'Panou',
  'meny.blogg': 'Blog',
  'meny.galleri': 'Galerie',
  'meny.statistikk': 'Statistici',
  'meny.lenker': 'Linkuri',
  'meny.seNettstedet': 'Vezi site-ul',
  'meny.loggUt': 'Ieșire',
  'meny.aria': 'Meniu administrare',
  'sprak.bytt': 'Schimbă limba',

  'oppsett.tittel': 'Panoul nu este configurat',
  'oppsett.tekst':
    'Adaugă VITE_SUPABASE_URL și VITE_SUPABASE_ANON_KEY în fișierul .env (vezi .env.example) și repornește serverul de dezvoltare.',

  'login.tittel': 'Panoul de administrare',
  'login.under': 'Autentifică-te pentru a gestiona blogul, galeria și statisticile.',
  'login.epost': 'E-mail',
  'login.passord': 'Parolă',
  'login.knapp': 'Autentificare',
  'login.venter': 'Se autentifică…',
  'vakt.sjekkerInn': 'Se verifică autentificarea…',
  'vakt.sjekkerTilgang': 'Se verifică accesul…',
  'vakt.ingenTilgang': 'Fără acces de administrator',
  'vakt.innloggetSom': 'Ești autentificat{hvem}, dar acest cont nu are acces la panou.',
  'vakt.som': ' ca {epost}',
  'vakt.leggInn': 'Pentru a acorda acces, adaugă adresa în baza de date. În Supabase → SQL Editor:',

  'felles.publisert': 'Publicat',
  'felles.kladd': 'Ciornă',
  'felles.rediger': 'Editează',
  'felles.lagre': 'Salvează',
  'felles.lagrer': 'Se salvează…',

  'dash.under': 'Bine ai revenit! Așa stă site-ul chiar acum.',
  'dash.nytt': 'Articol nou',
  'dash.iDag': 'Azi',
  'dash.siste7': 'Ultimele 7 zile',
  'dash.visninger': 'afișări de pagină',
  'dash.siste30': 'Ultimele 30 de zile',
  'dash.seStatistikk': 'Vezi toate statisticile →',
  'dash.sisteInnlegg': 'Ultimele articole',
  'dash.ingenInnlegg': 'Niciun articol încă. Apasă „Articol nou” și scrie primul!',
  'dash.snarveier': 'Scurtături',
  'dash.snarveiBlogg': 'Scrie și editează articole',
  'dash.snarveiGalleri': 'Schimbă pozele din galerie',
  'dash.snarveiLenker': 'Creează linkuri de urmărire',
  'dash.snarveiStatistikk': 'Vezi cifrele de trafic',
  'dash.henter': 'Se încarcă cifrele…',

  'liste.under': 'Scrie, editează și publică articole pe site.',
  'liste.henter': 'Se încarcă articolele…',
  'liste.tomTittel': 'Niciun articol încă',
  'liste.tomTekst': 'Apasă „Articol nou” și scrie primul. Durează doar câteva minute.',
  'liste.tittel': 'Titlu',
  'liste.status': 'Stare',
  'liste.sistEndret': 'Ultima modificare',
  'liste.se': 'Vezi',

  'red.alle': 'Toate articolele',
  'red.nytt': 'Articol nou',
  'red.rediger': 'Editează articolul',
  'red.slett': 'Șterge articolul',
  'red.slettSporsmal': 'Ștergi articolul definitiv? Acest lucru nu se poate anula.',
  'red.trengerTittel': 'Articolul are nevoie de un titlu.',
  'red.tomSlug': 'Adresa (slug) nu poate fi goală.',
  'red.lagretPublisert': 'Articolul a fost salvat și publicat.',
  'red.lagretKladd': 'Ciorna a fost salvată.',
  'red.lagretUte': 'Articolul a fost salvat și este public.',
  'red.lagretSomKladd': 'Salvat ca ciornă.',
  'red.fantIkke': 'Articolul nu a fost găsit.',
  'red.henter': 'Se încarcă articolul…',
  'red.tittel': 'Titlu',
  'red.tittelPlassholder': 'De ex. Cum alegi nuanța potrivită de alb',
  'red.slug': 'Adresă (slug)',
  'red.slugHjelp': 'Articolul va avea adresa malerdelius.no/blogg/{slug}',
  'red.ingress': 'Introducere',
  'red.ingressHjelp': 'Una sau două fraze afișate în lista blogului.',
  'red.toppbilde': 'Imagine de copertă',
  'red.velgBilde': 'Alege imaginea',
  'red.byttBilde': 'Schimbă imaginea',
  'red.fjern': 'Elimină',
  'red.lasterOpp': 'Se încarcă…',
  'red.innhold': 'Conținut',
  'red.fet': 'Aldin',
  'red.kursiv': 'Cursiv',
  'red.overskrift': 'Subtitlu',
  'red.punktliste': 'Listă',
  'red.lenke': 'Link',
  'red.bilde': 'Imagine',
  'red.settInnBilde': 'Inserează o imagine',
  'red.innholdPlassholder':
    'Scrie articolul aici.\n\nRândurile goale creează paragrafe noi. Folosește butoanele de sus pentru aldin, cursiv, subtitluri, liste, linkuri și imagini.',
  'red.forhandTittel': 'Așa va arăta pe site',
  'red.forhandTom': 'Previzualizarea apare pe măsură ce scrii.',
  'red.fetTekst': 'text aldin',
  'red.kursivTekst': 'text cursiv',
  'red.overskriftTekst': 'Subtitlu',
  'red.punktTekst': 'element',
  'red.lenkeTekst': 'textul linkului',
  'red.bildetekst': 'Scrie aici o descriere a imaginii',

  'gal.under':
    'Pagina Portefølje în miniatură, cu pozele exact acolo unde stau pe site. Schimbă o poză direct pe locul ei sau readu originalul.',
  'gal.seSiden': 'Vezi pagina',
  'gal.bytt': 'Schimbă',
  'gal.original': 'Originalul',
  'gal.byttet': 'Schimbată',
  'gal.jobber': 'Se lucrează…',
  'gal.henter': 'Se încarcă galeria…',
  'gal.gjelderBegge': 'Modificările se aplică atât versiunii pentru calculator, cât și celei pentru mobil.',
  'gal.plass': 'Poza {nr}: {navn}',

  'stat.under': 'Vizitele site-ului, fără cookie-uri și fără a stoca nimic despre vizitatori.',
  'stat.p7': '7 zile',
  'stat.p30': '30 de zile',
  'stat.p90': '90 de zile',
  'stat.p12': '12 luni',
  'stat.sidevisninger': 'Afișări de pagină',
  'stat.sisteX': 'ultimele {periode}',
  'stat.unike': 'Vizite unice',
  'stat.unikeDetalj': 'sesiuni, câte una pe vizitator și filă',
  'stat.mestSett': 'Cea mai văzută',
  'stat.ingenBesok': 'nicio vizită încă',
  'stat.fraMobil': 'De pe mobil',
  'stat.andel': 'procent din sesiuni',
  'stat.besokPerDag': 'Vizite pe zi',
  'stat.besokPerManed': 'Vizite pe lună',
  'stat.visTabell': 'Vezi tabelul',
  'stat.visDiagram': 'Vezi graficul',
  'stat.dag': 'Zi',
  'stat.maned': 'Lună',
  'stat.tomPeriode':
    'Nicio vizită înregistrată în această perioadă. Cifrele încep să apară imediat ce cineva deschide site-ul.',
  'stat.mestSette': 'Cele mai văzute pagini',
  'stat.kilder': 'De unde au venit vizitele',
  'stat.direkte': 'Direct / adresă tastată',
  'stat.ingenKilder': 'Nicio sursă înregistrată încă.',
  'stat.enheter': 'Dispozitive',
  'stat.mobil': 'Mobil',
  'stat.datamaskin': 'Calculator',
  'stat.lenketrafikk': 'Trafic din linkurile tale',
  'stat.lenkeTom':
    'Nicio vizită prin linkuri de urmărire în această perioadă. Creează linkuri la „Linkuri” și distribuie-le, iar cifrele vor apărea aici.',
  'stat.lenke': 'Link',
  'stat.besok': 'Vizite',
  'stat.visningerKol': 'Afișări',
  'stat.teller': 'Se numără vizitele…',
  'stat.ingenting': 'Nimic de arătat încă.',

  'side.forsiden': 'Prima pagină',
  'side.omOss': 'Despre noi',
  'side.portefolje': 'Portofoliu',
  'side.malertjenester': 'Servicii de vopsit',
  'side.kontakt': 'Contact',
  'side.blogg': 'Blog',
  'side.bloggPrefiks': 'Blog: {slug}',

  'len.under':
    'Creează o adresă separată pentru fiecare distribuire (reclamă, postare, e-mail) și vezi câți vizitatori a adus fiecare.',
  'len.ny': 'Link nou',
  'len.navn': 'Nume',
  'len.navnHjelp': 'Doar pentru tine, de ex. „Reclamă Facebook august”.',
  'len.navnPlassholder': 'Reclamă Facebook august',
  'len.kode': 'Cod',
  'len.kodeHjelp': 'Adresa va fi {vert}/l/{kode}',
  'len.malside': 'Trimite vizitatorii la',
  'len.lag': 'Creează linkul',
  'len.lager': 'Se creează…',
  'len.henter': 'Se încarcă linkurile…',
  'len.giNavn': 'Dă-i linkului un nume. Codul se generează singur.',
  'len.adresse': 'Adresă',
  'len.gaarTil': 'Duce la',
  'len.laget': 'Creat',
  'len.kopier': 'Copiază',
  'len.kopiert': 'Copiat!',
  'len.slettSporsmal': 'Ștergi linkul „{navn}”? Distribuirile vechi vor duce la prima pagină.',
  'len.tomTittel': 'Niciun link încă',
  'len.tomTekst':
    'Creează primul mai sus: dă-i un nume, copiază adresa și distribuie-o acolo unde vrei să măsori efectul.',
  'len.kopierManuelt': 'Copiază adresa:',
  'len.slett': 'Șterge linkul',

  'diagram.visninger': 'Afișări',
  'diagram.unike': 'Vizite unice',
  'diagram.aria': 'Vizite în timp',

  'feil.innlogging': 'E-mail sau parolă greșită.',
  'feil.ikkeBekreftet': 'Adresa de e-mail nu este confirmată încă.',
  'feil.slugOpptatt': 'Există deja un articol cu această adresă (slug). Alege alta.',
  'feil.kodeOpptatt': 'Există deja un link cu acest cod. Alege altul.',
  'feil.ugyldigVerdi': 'Unul dintre câmpuri are o valoare neacceptată. Verifică lungimea și caracterele.',
  'feil.nett': 'Nu s-a putut contacta baza de date. Verifică conexiunea la internet.',
  'feil.botteMangler': 'Spațiul de stocare „bilder” nu există încă. Rulează întâi scriptul de configurare în Supabase.',
  'feil.tabellerMangler':
    'Tabelele bazei de date nu există încă. Rulează întâi supabase/oppsett.sql în Supabase.',
  'feil.ikkeAdmin':
    'Acest cont nu are drepturi de administrator. Adaugă adresa de e-mail în tabelul admin_epost din Supabase.',
  'feil.rls':
    'Nu ai drepturi să salvezi. Verifică dacă adresa ta de e-mail este în tabelul admin_epost din Supabase.',
  'feil.ikkeBilde': 'Fișierul nu este o imagine.',
}

const ORDBOK: Record<Sprak, Record<Nokkel, string>> = { no: NO, ro: RO }

/* -------------------------------------------------------------------------
   Tall og substantiv

   Begge språk bøyer substantivet etter tallet, og rumensk krever i tillegg
   «de» foran: 1 vizită, 5 vizite, men 20 de vizite. Regelen henger på de to
   siste sifrene, så 101 vizite (uten «de») og 120 de vizite (med).
   Derfor settes disse frasene sammen her i stedet for i ordboka.
   ------------------------------------------------------------------------- */

/** Substantiver som opptrer sammen med et tall i panelet. */
export type Tellbart = 'visninger' | 'unike'

function ro(n: number, ental: string, flertall: string): string {
  if (n === 1) return `1 ${ental}`
  const rest = Math.abs(n) % 100
  const medDe = Math.abs(n) >= 20 && (rest === 0 || rest >= 20)
  return `${n} ${medDe ? 'de ' : ''}${flertall}`
}

function no(n: number, ental: string, flertall: string): string {
  return `${n} ${n === 1 ? ental : flertall}`
}

const TELL: Record<Sprak, Record<Tellbart, (n: number) => string>> = {
  no: {
    visninger: (n) => no(n, 'sidevisning', 'sidevisninger'),
    unike: (n) => no(n, 'unikt besøk', 'unike besøk'),
  },
  ro: {
    visninger: (n) => ro(n, 'afișare', 'afișări'),
    unike: (n) => ro(n, 'vizită unică', 'vizite unice'),
  },
}

export type Oversetter = (nokkel: Nokkel, deler?: Record<string, string | number>) => string

/** Tall + substantiv, bøyd riktig: «1 afișare», «5 afișări», «20 de afișări». */
export type Teller = (antall: number, ord: Tellbart) => string

type SprakVerdi = {
  sprak: Sprak
  sett: (s: Sprak) => void
  t: Oversetter
  tell: Teller
  /** Datoformat som følger språket: nb-NO eller ro-RO. */
  locale: string
}

const Ctx = createContext<SprakVerdi | null>(null)

function lagretSprak(): Sprak {
  try {
    return localStorage.getItem(LAGRET) === 'ro' ? 'ro' : 'no'
  } catch {
    return 'no'
  }
}

export function SprakGiver({ children }: { children: ReactNode }) {
  const [sprak, settSprak] = useState<Sprak>(lagretSprak)

  const verdi = useMemo<SprakVerdi>(() => {
    const bok = ORDBOK[sprak]
    return {
      sprak,
      locale: sprak === 'ro' ? 'ro-RO' : 'nb-NO',
      tell: (antall, ord) => TELL[sprak][ord](antall),
      sett: (s) => {
        settSprak(s)
        try {
          localStorage.setItem(LAGRET, s)
        } catch {
          /* uten lagring gjelder valget bare denne økta */
        }
      },
      t: (nokkel, deler) => {
        let tekst: string = bok[nokkel]
        if (deler) {
          for (const [navn, v] of Object.entries(deler)) {
            tekst = tekst.split(`{${navn}}`).join(String(v))
          }
        }
        return tekst
      },
    }
  }, [sprak])

  return <Ctx.Provider value={verdi}>{children}</Ctx.Provider>
}

export function useSprak(): SprakVerdi {
  const verdi = useContext(Ctx)
  if (!verdi) throw new Error('useSprak må brukes innenfor SprakGiver')
  return verdi
}

/** De to små språkknappene (NO | RO). */
export function SprakVelger() {
  const { sprak, sett, t } = useSprak()
  return (
    <div className="adm-sprak" role="group" aria-label={t('sprak.bytt')}>
      {(['no', 'ro'] as const).map((s) => (
        <button
          key={s}
          type="button"
          className={sprak === s ? 'adm-aktiv' : undefined}
          aria-pressed={sprak === s}
          onClick={() => sett(s)}
        >
          {s.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
