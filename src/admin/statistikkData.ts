import { supabase } from '../lib/supabase'
import type { Punkt } from './diagram'

/** Henting og tilrettelegging av besøkstallene for admin-sidene. */

export type Statistikk = {
  totalt: { visninger: number; unike: number }
  dager: { dag: string; visninger: number; unike: number }[]
  sider: { sti: string; visninger: number }[]
  kilder: { kilde: string; okter: number }[]
  enheter: { enhet: string; okter: number }[]
  lenker: { kode: string; visninger: number; okter: number }[]
}

const TOM: Statistikk = {
  totalt: { visninger: 0, unike: 0 },
  dager: [],
  sider: [],
  kilder: [],
  enheter: [],
  lenker: [],
}

/** Spør databasen om alt på én gang (funksjonen hent_statistikk). */
export async function hentStatistikk(fra: Date, til: Date): Promise<Statistikk> {
  if (!supabase) return TOM
  const { data, error } = await supabase.rpc('hent_statistikk', {
    fra: fra.toISOString(),
    til: til.toISOString(),
  })
  if (error) throw new Error(error.message)
  return { ...TOM, ...((data ?? {}) as Partial<Statistikk>) }
}

/** Midnatt lokal tid, `dagerSiden` dager tilbake. */
export function dagStart(dagerSiden: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - dagerSiden)
  return d
}

function nokkel(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Fyller hullene: databasen har bare rader for dager med besøk, diagrammet
 * trenger alle dagene i perioden – stille dager som 0.
 */
export function dagSerie(stat: Statistikk, antallDager: number): Punkt[] {
  const kart = new Map(stat.dager.map((d) => [d.dag, d]))
  const ut: Punkt[] = []
  for (let i = antallDager - 1; i >= 0; i--) {
    const dato = dagStart(i)
    const rad = kart.get(nokkel(dato))
    ut.push({
      etikett: dato.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' }),
      visninger: rad?.visninger ?? 0,
      unike: rad?.unike ?? 0,
    })
  }
  return ut
}

/**
 * Tolv måneder som tolv punkter. Bare sidevisninger – å summere «unike per
 * dag» over en måned ville talt samme besøkende flere ganger og gitt et
 * tall som ser riktig ut, men lyver.
 */
export function manedSerie(stat: Statistikk): Punkt[] {
  const kart = new Map<string, number>()
  for (const d of stat.dager) {
    const mnd = d.dag.slice(0, 7)
    kart.set(mnd, (kart.get(mnd) ?? 0) + d.visninger)
  }
  const ut: Punkt[] = []
  const naa = new Date()
  for (let i = 11; i >= 0; i--) {
    const dato = new Date(naa.getFullYear(), naa.getMonth() - i, 1)
    const k = `${dato.getFullYear()}-${String(dato.getMonth() + 1).padStart(2, '0')}`
    ut.push({
      etikett: dato.toLocaleDateString('nb-NO', { month: 'short' }),
      visninger: kart.get(k) ?? 0,
      unike: 0,
    })
  }
  return ut
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
