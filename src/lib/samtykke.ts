import { useSyncExternalStore } from 'react'

/**
 * Samtykke til informasjonskapsler og lignende lagring i nettleseren.
 *
 * Ekomloven § 3-15 (fra 1. januar 2025) krever et samtykke etter
 * personvernforordningens standard før noe lagres i eller hentes fra
 * besøkerens utstyr, med mindre det er strengt nødvendig for tjenesten
 * besøkeren selv har bedt om. Her holder vi rede på hva besøkeren har sagt
 * ja til, og hvor lenge svaret gjelder.
 *
 * Tre formål kan skrus av og på hver for seg:
 *   statistikk      Google Analytics (informasjonskapslene _ga og _ga_…)
 *   markedsforing   måling av Google Ads-annonsene (ad_storage og
 *                   ad_user_data i Googles samtykkemodus, kapslene _gcl_…);
 *                   aldri personlig tilpassede annonser (ad_personalization
 *                   står alltid på nei)
 *   eksternt        innhold fra andre nettsteder, i praksis kartet fra
 *                   Google Maps på Kontakt-siden, som setter Googles kapsler
 *
 * Selve svaret lagres i localStorage under nøkkelen md-samtykke. Den
 * lagringen er unntatt kravet om samtykke: uten den måtte vi spurt på nytt
 * på hver eneste side. Svaret gjelder i tolv måneder, så spør vi igjen.
 * Endres listen over formål, økes VERSJON, og alle må svare på nytt.
 */

export type Valg = { statistikk: boolean; markedsforing: boolean; eksternt: boolean }
export type Samtykke = Valg & { dato: string; versjon: number }

export const NOKKEL = 'md-samtykke'
export const VERSJON = 1
const GYLDIG_DAGER = 365

/** Sendes på window når besøkeren vil endre valgene sine (fra cookie-siden). */
export const APNE_HENDELSE = 'md-samtykke-apne'

const lytterne = new Set<() => void>()
let lest = false
let gjeldende: Samtykke | null = null

function varsle() {
  lytterne.forEach((l) => l())
}

function lesFraLager(): Samtykke | null {
  try {
    const raa = localStorage.getItem(NOKKEL)
    if (!raa) return null
    const s = JSON.parse(raa) as Partial<Samtykke>
    if (s.versjon !== VERSJON) return null
    if (typeof s.dato !== 'string') return null
    const alder = Date.now() - Date.parse(s.dato)
    if (!Number.isFinite(alder) || alder < 0 || alder > GYLDIG_DAGER * 86_400_000) return null
    return {
      statistikk: s.statistikk === true,
      markedsforing: s.markedsforing === true,
      eksternt: s.eksternt === true,
      dato: s.dato,
      versjon: VERSJON,
    }
  } catch {
    return null
  }
}

/** Det besøkeren har svart, eller null når det ikke er svart ennå. */
export function lesSamtykke(): Samtykke | null {
  if (!lest) {
    gjeldende = lesFraLager()
    lest = true
  }
  return gjeldende
}

export function harSamtykke(formaal: keyof Valg): boolean {
  return lesSamtykke()?.[formaal] === true
}

/** Lagrer svaret og sier fra til alle som lytter (analyse, kart, banner). */
export function settSamtykke(valg: Valg) {
  gjeldende = { ...valg, dato: new Date().toISOString(), versjon: VERSJON }
  lest = true
  try {
    localStorage.setItem(NOKKEL, JSON.stringify(gjeldende))
  } catch {
    /* privat modus uten lagring: valget gjelder da bare denne siden */
  }
  varsle()
}

/** Trekker alt tilbake. Banneret spør på nytt ved neste sidevisning. */
export function trekkSamtykke() {
  gjeldende = null
  lest = true
  try {
    localStorage.removeItem(NOKKEL)
  } catch {
    /* ingenting å slette */
  }
  varsle()
}

/** Be banneret åpne seg igjen, med valgene synlige. */
export function apneValg() {
  window.dispatchEvent(new Event(APNE_HENDELSE))
}

function abonner(l: () => void) {
  lytterne.add(l)
  // Et annet vindu eller en annen fane kan ha endret svaret
  const paaLager = (e: StorageEvent) => {
    if (e.key === NOKKEL || e.key === null) {
      lest = false
      l()
    }
  }
  window.addEventListener('storage', paaLager)
  return () => {
    lytterne.delete(l)
    window.removeEventListener('storage', paaLager)
  }
}

/** React-krok: svaret slik det er nå, oppdatert når det endres. */
export function useSamtykke(): Samtykke | null {
  return useSyncExternalStore(abonner, lesSamtykke, () => null)
}
