import type { Nokkel, Oversetter } from './sprak'

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

/** Kort dato for tabeller: «17. aug. 2026» / «17 aug. 2026». */
export function datoKort(iso: string | null, locale = 'nb-NO'): string {
  if (!iso) return '–'
  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Feilmeldinger fra Supabase på folkelig språk der vi kjenner dem igjen.
 * Ukjente meldinger vises som de er – da er de i det minste ærlige.
 */
const KJENTE_FEIL: [RegExp, Nokkel][] = [
  [/invalid login credentials/i, 'feil.innlogging'],
  [/email not confirmed/i, 'feil.ikkeBekreftet'],
  [/duplicate key.*slug/i, 'feil.slugOpptatt'],
  [/duplicate key.*kode/i, 'feil.kodeOpptatt'],
  [/violates check constraint/i, 'feil.ugyldigVerdi'],
  [/Failed to fetch|NetworkError|fetch failed/i, 'feil.nett'],
  [/bucket not found|Bildelageret/i, 'feil.botteMangler'],
  [/schema cache|does not exist/i, 'feil.tabellerMangler'],
  [/Ingen admin-tilgang/i, 'feil.ikkeAdmin'],
  [/row-level security/i, 'feil.rls'],
  [/ikke et bilde/i, 'feil.ikkeBilde'],
  [/Supabase er ikke satt opp/i, 'feil.tabellerMangler'],
]

export function folkeligFeil(melding: string, t: Oversetter): string {
  for (const [monster, nokkel] of KJENTE_FEIL) {
    if (monster.test(melding)) return t(nokkel)
  }
  return melding
}
