/**
 * Adressen og den offentlige nøkkelen til Supabase-prosjektet.
 *
 * Verdiene hentes fra miljøvariablene når de finnes, ellers brukes verdiene
 * under. Rekkefølgen er med vilje: skulle prosjektet en dag bytte nøkkel,
 * holder det å sette VITE_SUPABASE_ANON_KEY i Vercel – da vinner den over
 * det som står her, uten at koden må endres.
 *
 * HVORFOR STÅR NØKKELEN I KODEN?
 * Fordi den ikke er en hemmelighet. «anon»-nøkkelen er laget for å ligge
 * åpent i nettleseren – hver eneste besøkende laster den ned som en del av
 * JavaScript-fila, og den har ligget i .env.example i dette kodelageret
 * siden 14. august. Det som beskytter dataene er Row Level Security i
 * databasen (supabase/oppsett.sql), ikke at nøkkelen er skjult: en
 * anonym besøkende får verken lese eller skrive noe som helst, og
 * admin-tilgang avgjøres av tabellen admin_epost.
 *
 * Med verdiene her virker bloggen, galleriet og besøksstatistikken selv om
 * miljøvariablene i Vercel skulle mangle eller bli tomme – noe som skjedde,
 * og som ellers stopper hele panelet uten at noe ser ut til å være galt.
 *
 * Den ekte hemmeligheten, RESEND_API_KEY, står IKKE her og skal aldri gjøre
 * det. Den brukes bare på serversiden, i api/kontakt.ts.
 */
/**
 * En miljøvariabel brukes bare når den ser riktig ut.
 *
 * Grunnen er en felle vi gikk i: i Vercel vises verdien delvis maskert med
 * kulepunkter, og kopierer man den fra skjermen får man «eyJhbGci••••••••»
 * i stedet for nøkkelen. Den strengen er ikke tom, så den ville blitt brukt
 * – og kulepunktet (U+2022) er ikke lovlig i en HTTP-header, så hver eneste
 * forespørsel døde med «String contains non ISO-8859-1 code point».
 *
 * Derfor: passer ikke verdien mønsteret, later vi som den ikke finnes.
 */
const fraMiljo = (verdi: unknown, monster: RegExp) => {
  if (typeof verdi !== 'string') return undefined
  const ren = verdi.trim()
  return ren && monster.test(ren) ? ren : undefined
}

export const BASE_URL =
  fraMiljo(import.meta.env.VITE_SUPABASE_URL, /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i) ??
  'https://fufzioaqnbbiyzhswjab.supabase.co'

export const BASE_NOKKEL =
  fraMiljo(import.meta.env.VITE_SUPABASE_ANON_KEY, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/) ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Znppb2FxbmJiaXl6aHN3amFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MTMwNDQsImV4cCI6MjEwMjQ4OTA0NH0.ig6ViCf1C4S9BuG2ufHcd8BPNBwLhEYr_JNWiejCvQ8'

/**
 * Målings-ID-en til Google Analytics 4 (formen G-XXXXXXXXXX).
 *
 * Kilden er tag-elementet i index.html (Google Ads sjekker kildekoden for
 * det, så taggen må stå statisk der). Her leses ID-en fra det elementet, så
 * den bare står ett sted; miljøvariabelen VITE_GA_ID kan overstyre.
 *
 * G-82M65MEYRW er eiendommen Google Ads laget for kunden da han satte opp en
 * lokal annonsekampanje (sendt til Artiom 8. september 2026 kl. 21:30). Den
 * ligger på kundens egen Google-konto, og Ads-kontoen er knyttet til den.
 * Eiendommen «malerdelius.no» (G-F8F8B1R8N8, datastrøm 15741881042) som ble
 * opprettet samme kveld på malerdeliusas@gmail.com er overflødig og kan
 * slettes; den får ingen data.
 *
 * En tom streng betyr at Analytics ikke er i bruk: banneret nevner det da
 * ikke. Se src/lib/analyse.ts for hva som skjer før og etter samtykke.
 */
function idFraTaggen(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const tag = document.querySelector<HTMLScriptElement>(
    'script[src^="https://www.googletagmanager.com/gtag/js?id="]',
  )
  const treff = tag && /[?&]id=(G-[A-Z0-9]{6,14})/.exec(tag.getAttribute('src') ?? '')
  return treff?.[1]
}

export const GA_ID =
  fraMiljo(import.meta.env.VITE_GA_ID, /^G-[A-Z0-9]{6,14}$/) ?? idFraTaggen() ?? ''
