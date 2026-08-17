/** Små hjelpere for admin-panelet. */

/** «Slik blir tittelen» → «slik-blir-tittelen» (norske tegn ivaretatt). */
export function slugifiser(tekst: string): string {
  return tekst
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** 2026-08-17T… → «17. august 2026 kl. 14:03» */
export function datoTid(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })} kl. ${d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`
}

/** Kort dato for tabeller: «17. aug 2026». */
export function datoKort(iso: string | null): string {
  if (!iso) return '–'
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Feilmeldinger fra Supabase på folkelig norsk der vi kan. */
export function folkeligFeil(melding: string): string {
  const kjent: [RegExp, string][] = [
    [/invalid login credentials/i, 'Feil e-post eller passord.'],
    [/email not confirmed/i, 'E-postadressen er ikke bekreftet ennå.'],
    [/duplicate key.*slug/i, 'Det finnes alt et innlegg med denne adressen (slug). Velg en annen.'],
    [/duplicate key.*kode/i, 'Det finnes alt en lenke med denne koden. Velg en annen.'],
    [/violates check constraint/i, 'Ett av feltene har en verdi som ikke godtas. Sjekk lengde og tegn.'],
    [/Failed to fetch|NetworkError|fetch failed/i, 'Fikk ikke kontakt med databasen. Sjekk nettforbindelsen.'],
    [/bucket not found/i, 'Bildelageret «bilder» finnes ikke ennå – kjør oppsettet i Supabase først.'],
    [/schema cache|does not exist/i, 'Databasetabellene er ikke laget ennå – kjør supabase/oppsett.sql i Supabase først.'],
    [/row-level security/i, 'Ingen tilgang. Logg inn på nytt og prøv igjen.'],
  ]
  for (const [monster, svar] of kjent) if (monster.test(melding)) return svar
  return melding
}
