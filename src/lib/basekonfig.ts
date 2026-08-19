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
const fraMiljo = (verdi: unknown) =>
  typeof verdi === 'string' && verdi.trim() ? verdi.trim() : undefined

export const BASE_URL =
  fraMiljo(import.meta.env.VITE_SUPABASE_URL) ?? 'https://fufzioaqnbbiyzhswjab.supabase.co'

export const BASE_NOKKEL =
  fraMiljo(import.meta.env.VITE_SUPABASE_ANON_KEY) ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Znppb2FxbmJiaXl6aHN3amFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MTMwNDQsImV4cCI6MjEwMjQ4OTA0NH0.ig6ViCf1C4S9BuG2ufHcd8BPNBwLhEYr_JNWiejCvQ8'
