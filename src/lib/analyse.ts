import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { GA_ID } from './basekonfig'
import { useSamtykke } from './samtykke'

/**
 * Google Analytics 4 og Googles samtykkemodus v2.
 *
 * Selve taggen (gtag.js) står statisk i index.html, fordi Google Ads leser
 * kildekoden for å finne den. public/analyse-start.js setter samtykkemodusen
 * til «nei» på alt før taggen kjører. Her åpnes det besøkeren har sagt ja
 * til i banneret:
 *
 *   statistikk     → analytics_storage: kapslene _ga/_ga_…, ekte besøkstall
 *   markedsforing  → ad_storage + ad_user_data: Google Ads kan se om et
 *                    besøk kom fra en annonse og om det førte til en
 *                    henvendelse. ad_personalization står ALLTID på nei:
 *                    ingen personlig tilpassede annonser, ingen remarketing.
 *
 * Før besøkeren har svart, sender taggen bare Googles «samtykkeløse ping»
 * (ingen kapsler, ingen lagring, ingen identifikator), som Google bruker
 * til å anslå tall. Har besøkeren svart «Bare nødvendige», slås målingen
 * helt av for denne ID-en (ga-disable), så ikke engang det sendes, og
 * kapslene _ga/_gcl som måtte finnes slettes.
 *
 * Sidevisningene teller Googles «forbedrede måling» selv (PÅ som standard i
 * alle nye eiendommer, også den Ads laget for kunden). Sett
 * MANUELL_SIDEVISNING = true bare hvis den skrus av i Analytics-admin.
 */

const MANUELL_SIDEVISNING = false

type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }
}

/** Er Analytics satt opp i det hele tatt (målings-ID finnes)? */
export const harAnalyse = Boolean(GA_ID)

function gtag(...args: unknown[]) {
  if (window.gtag) {
    window.gtag(...args)
    return
  }
  window.dataLayer = window.dataLayer || []
  // gtag.js leser `arguments`-objektet, ikke en vanlig array
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments)
  void args
}

function settAvslaatt(av: boolean) {
  ;(window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = av
}

/** Sletter en informasjonskapsel på alle domenevariantene Google kan ha satt den på. */
function slettKapsel(navn: string) {
  const vert = location.hostname
  const domener = ['', vert, `.${vert}`, `.${vert.replace(/^www\./, '')}`]
  for (const d of domener) {
    document.cookie = `${navn}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`
  }
}

function slettGoogleKapsler() {
  for (const bit of document.cookie.split(';')) {
    const n = bit.trim().split('=')[0]
    if (n === '_ga' || n.startsWith('_ga_') || n === '_gid' || n.startsWith('_gcl_')) slettKapsel(n)
  }
}

/** Besøkeren har svart: åpne det som er godtatt, steng resten. */
function oppdater(statistikk: boolean, markedsforing: boolean) {
  if (!GA_ID) return
  const noe = statistikk || markedsforing
  settAvslaatt(!noe)
  gtag('consent', 'update', {
    analytics_storage: statistikk ? 'granted' : 'denied',
    ad_storage: markedsforing ? 'granted' : 'denied',
    ad_user_data: markedsforing ? 'granted' : 'denied',
    ad_personalization: 'denied',
  })
  if (!statistikk) {
    for (const bit of document.cookie.split(';')) {
      const n = bit.trim().split('=')[0]
      if (n === '_ga' || n.startsWith('_ga_') || n === '_gid') slettKapsel(n)
    }
  }
  if (!markedsforing) {
    for (const bit of document.cookie.split(';')) {
      const n = bit.trim().split('=')[0]
      if (n.startsWith('_gcl_')) slettKapsel(n)
    }
  }
}

/** Samtykket er trukket helt tilbake: som «Bare nødvendige». */
function stopp() {
  if (!GA_ID) return
  settAvslaatt(true)
  gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  slettGoogleKapsler()
}

function sidevisning(sti: string) {
  if (!MANUELL_SIDEVISNING || !GA_ID) return
  gtag('event', 'page_view', {
    page_path: sti,
    page_location: location.href,
    page_title: document.title,
  })
}

/**
 * Kobles på i App. Følger samtykket og rutebyttene. Admin-panelet og
 * sporingslenkene måles ikke: det ene er vårt eget, det andre er bare en
 * omvei til en side som telles selv.
 */
export function useAnalyse() {
  const samtykke = useSamtykke()
  const { pathname } = useLocation()
  const statistikk = samtykke?.statistikk === true
  const markedsforing = samtykke?.markedsforing === true
  const svart = samtykke !== null
  const harSvart = useRef(false)

  useEffect(() => {
    if (!svart) {
      // Ikke svart ennå: taggen står på «nei» fra analyse-start.js. Men er
      // svaret trukket tilbake etter å ha vært gitt, skal målingen av.
      if (harSvart.current) stopp()
      return
    }
    harSvart.current = true
    if (statistikk || markedsforing) oppdater(statistikk, markedsforing)
    else stopp()
  }, [svart, statistikk, markedsforing])

  useEffect(() => {
    if (!statistikk) return
    if (pathname.startsWith('/admin') || pathname.startsWith('/l/')) return
    // Tittelen settes av useSeo i samme omgang; vent til den er på plass
    const t = setTimeout(() => sidevisning(pathname), 0)
    return () => clearTimeout(t)
  }, [statistikk, pathname])
}
