import { supabase } from '../lib/supabase'
import type { Punkt } from './diagram'

/**
 * Besøkstallene. Alt regnestykket – inkludert hvilke dager perioden dekker –
 * gjøres i databasen, i norsk tid. Her gjør vi bare om datomerkene til
 * lesbare etiketter. Grunnen står i supabase/oppsett.sql: regnet nettleseren
 * ut dagene selv, ville en maskin i en annen tidssone lete etter datoer som
 * ikke finnes i svaret, og trafikk ville forsvunnet ut av grafen.
 */

export type Statistikk = {
  totalt: { visninger: number; unike: number }
  /** ferdig utfylt serie, ett punkt per dag (eller måned) i perioden */
  serie: { merke: string; visninger: number; unike: number }[]
  sider: { sti: string; visninger: number }[]
  kilder: { kilde: string; okter: number }[]
  enheter: { enhet: string; okter: number }[]
  lenker: { kode: string; visninger: number; okter: number }[]
}

const TOM: Statistikk = {
  totalt: { visninger: 0, unike: 0 },
  serie: [],
  sider: [],
  kilder: [],
  enheter: [],
  lenker: [],
}

/** Dagsoppløsning: siste `dager` dager til og med i dag. */
export async function hentStatistikk(dager: number): Promise<Statistikk> {
  if (!supabase) return TOM
  const { data, error } = await supabase.rpc('hent_statistikk', { dager })
  if (error) throw new Error(error.message)
  return { ...TOM, ...((data ?? {}) as Partial<Statistikk>) }
}

/** Månedsoppløsning: hele kalendermåneder, `maneder` av dem. */
export async function hentStatistikkManeder(maneder: number): Promise<Statistikk> {
  if (!supabase) return TOM
  const { data, error } = await supabase.rpc('hent_statistikk_maneder', { maneder })
  if (error) throw new Error(error.message)
  return { ...TOM, ...((data ?? {}) as Partial<Statistikk>) }
}

/** Klikktall per sporingslenke, hele historikken. */
export async function hentLenkeklikk(): Promise<Statistikk['lenker']> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('lenke_klikk')
  if (error) throw new Error(error.message)
  return (data ?? []) as Statistikk['lenker']
}

/**
 * «2026-08-17» → Date, lest som en ren kalenderdato. Vi setter den sammen
 * felt for felt i stedet for `new Date(tekst)`, som ville tolket den som
 * midnatt UTC og dermed vist dagen før for alle vest for Greenwich.
 */
function tilDato(merke: string): Date {
  const [aar, mnd, dag] = merke.split('-').map(Number)
  return new Date(aar, (mnd ?? 1) - 1, dag ?? 1)
}

/** Serien fra databasen med norske etiketter, klar for diagrammet. */
export function serieTilPunkter(stat: Statistikk, oppløsning: 'dag' | 'maned'): Punkt[] {
  return stat.serie.map((p) => {
    const d = tilDato(p.merke)
    return {
      etikett:
        oppløsning === 'dag'
          ? d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
          : d.toLocaleDateString('nb-NO', { month: 'short', year: '2-digit' }),
      visninger: p.visninger,
      unike: p.unike,
    }
  })
}

/** Stinavn → lesbart sidenavn i listene. */
export function sideNavn(sti: string): string {
  const kjent: Record<string, string> = {
    '/': 'Forsiden',
    '/om-oss': 'Om oss',
    '/portefolje': 'Portefølje',
    '/malertjenester': 'Malertjenester',
    '/kontakt': 'Kontakt',
    '/blogg': 'Blogg',
  }
  if (kjent[sti]) return kjent[sti]
  if (sti.startsWith('/blogg/')) return `Blogg: ${sti.slice(7)}`
  return sti
}
