import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from './supabase'

/**
 * Egen, personvernvennlig besøksteller: én rad i Supabase per sidevisning.
 * Ingen informasjonskapsler, ingen IP – bare sti, kilde (hvor besøket kom
 * fra), enhetstype og en tilfeldig økt-id som dør når fanen lukkes.
 *
 * Kommer noen inn via en sporingslenke (/l/kode eller ?ref=kode), henger
 * koden ved alle sidevisningene i økta, så admin-panelet kan vise hvor mye
 * trafikk hver lenke ga.
 */

const OKT = 'md-okt'
const KODE = 'md-lenkekode'
const FORSTE = 'md-forste-visning'

/** Admin-panelet setter dette flagget så egne besøk ikke telles med. */
export const IKKE_SPOR = 'md-ikke-spor'

function oktId(): string {
  try {
    let id = sessionStorage.getItem(OKT)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(OKT, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

/** Husk sporingskoden ut økta (kalles fra /l/-ruta og ved ?ref=). */
export function huskLenkekode(kode: string) {
  const ren = kode.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60)
  if (!ren) return
  try {
    sessionStorage.setItem(KODE, ren)
  } catch {
    /* privat modus uten lagring – da mister vi bare koden */
  }
}

function lagretLenkekode(): string | null {
  try {
    return sessionStorage.getItem(KODE)
  } catch {
    return null
  }
}

/**
 * Hvor kom besøket fra? Bare interessant på øktas første sidevisning – innad
 * på nettstedet er «kilden» oss selv. Vi lagrer kun vertsnavnet (google.com,
 * facebook.com …), aldri hele adressen.
 */
function kilde(): string | null {
  try {
    if (sessionStorage.getItem(FORSTE)) return null
    sessionStorage.setItem(FORSTE, '1')
  } catch {
    return null
  }
  if (!document.referrer) return null
  try {
    const vert = new URL(document.referrer).hostname.replace(/^www\./, '')
    return vert && vert !== location.hostname.replace(/^www\./, '')
      ? vert.slice(0, 120)
      : null
  } catch {
    return null
  }
}

function registrer(sti: string) {
  if (!supabase) return
  // egne besøk (admin) og admin-sidene selv skal ikke inn i statistikken
  try {
    if (localStorage.getItem(IKKE_SPOR)) return
  } catch {
    /* uten localStorage sporer vi som vanlig */
  }
  if (sti.startsWith('/admin') || sti.startsWith('/l/')) return

  void supabase
    .from('sidevisninger')
    .insert({
      sti: sti.slice(0, 200),
      kilde: kilde(),
      lenke_kode: lagretLenkekode(),
      enhet: window.innerWidth < 1000 ? 'mobil' : 'desktop',
      okt_id: oktId(),
    })
    .then(({ error }) => {
      // statistikk skal aldri forstyrre nettstedet – logg og gå videre
      if (error) console.warn('sporing:', error.message)
    })
}

/** Kobles på i App: teller hver sidevisning ved rutebytte. */
export function useSporing() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // ?ref=kode fra f.eks. delte adresser – husk koden for resten av økta
    const ref = new URLSearchParams(search).get('ref')
    if (ref) huskLenkekode(ref)
    registrer(pathname)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
}
