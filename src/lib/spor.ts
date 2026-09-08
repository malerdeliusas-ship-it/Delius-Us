import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { harBase, rpcUtenSvar, settInn } from './rest'

/**
 * Egen, personvernvennlig besøksteller: én rad i Supabase per sidevisning.
 * Ingen informasjonskapsler, ingen IP, og ingenting lagres i nettleseren:
 * bare sti, kilde (hvor besøket kom fra), enhetstype og en tilfeldig økt-id.
 *
 * Økt-id-en lever bare i minnet til denne fanen mens siden er åpen. Den lå
 * tidligere i nettleserens øktlager, men ekomloven § 3-15 krever samtykke
 * for alt som lagres i besøkerens utstyr uten å være strengt nødvendig, og
 * en besøksteller er ikke det. Prisen er at en oppfrisking av siden teller
 * som en ny økt. Det tåler vi: tellingen er til for å se hva folk leser,
 * ikke for å følge enkeltpersoner.
 *
 * Kommer noen inn via en sporingslenke (/l/kode eller ?ref=kode), henger
 * koden ved alle sidevisningene så lenge fanen er åpen, så admin-panelet
 * kan vise hvor mye trafikk hver lenke ga.
 */

/** Admin-panelet setter dette flagget så egne besøk ikke telles med. */
export const IKKE_SPOR = 'md-ikke-spor'

let okt: string | null = null
let lenkekode: string | null = null
let forsteVisning = true

function nyId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  // eldre nettlesere uten randomUUID: samme form, tilfeldige tegn
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function oktId(): string {
  okt ??= nyId()
  return okt
}

/** Husk sporingskoden så lenge fanen er åpen (kalles fra /l/-ruta og ved ?ref=). */
export function huskLenkekode(kode: string) {
  const ren = kode.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60)
  if (ren) lenkekode = ren
}

function lagretLenkekode(): string | null {
  return lenkekode
}

/**
 * Hvor kom besøket fra? Bare interessant på den første sidevisningen – innad
 * på nettstedet er «kilden» oss selv. Vi lagrer kun vertsnavnet (google.com,
 * facebook.com …), aldri hele adressen.
 */
function kilde(): string | null {
  if (!forsteVisning) return null
  forsteVisning = false
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

/**
 * Bare nettstedets egne sider telles. En adresse med skrivefeil sendes hjem
 * av ruteren, og uten denne sjefen ville både skrivefeilen og forsiden blitt
 * registrert – ett besøk hadde blitt to visninger. Admin-sidene og
 * sporingslenkene faller også utenfor listen, som de skal.
 */
const KJENTE_SIDER = new Set([
  '/',
  '/om-oss',
  '/portefolje',
  '/malertjenester',
  '/kontakt',
  '/blogg',
  '/personvern',
  '/informasjonskapsler',
  '/vilkar',
  '/angrerett',
])

function erEgenSide(sti: string): boolean {
  return KJENTE_SIDER.has(sti) || /^\/blogg\/[a-z0-9-]{1,120}$/.test(sti)
}

function registrer(sti: string) {
  if (!harBase) return
  if (!erEgenSide(sti)) return
  // egne besøk (admin-maskinen) skal ikke inn i statistikken
  try {
    if (localStorage.getItem(IKKE_SPOR)) return
  } catch {
    /* uten localStorage sporer vi som vanlig */
  }

  const rad = {
    p_sti: sti.slice(0, 200),
    p_kilde: kilde(),
    p_lenke_kode: lagretLenkekode(),
    p_enhet: window.innerWidth < 1000 ? 'mobil' : 'desktop',
    p_okt: oktId(),
  }

  // Registreringen går gjennom databasefunksjonen registrer_visning, som
  // kontrollerer at stien er en av våre egne sider og setter et tak per økt.
  // Skrev nettleseren rett i tabellen, kunne hvem som helst med den
  // offentlige nøkkelen fylle statistikken med oppdiktede besøk.
  //
  // Er funksjonen ennå ikke lagt inn (supabase/oppsett.sql ikke kjørt på
  // nytt), faller vi tilbake til den gamle måten, så tellingen ikke stopper
  // i mellomtiden. Etter at skriptet er kjørt, er den veien stengt uansett.
  void rpcUtenSvar('registrer_visning', rad).then((ok) => {
    if (ok) return
    void settInn('sidevisninger', {
      sti: rad.p_sti,
      kilde: rad.p_kilde,
      lenke_kode: rad.p_lenke_kode,
      enhet: rad.p_enhet,
      okt_id: rad.p_okt,
    })
  })
}

/**
 * Kjør `cb` når nettleseren ikke har noe viktigere å gjøre.
 *
 * Tellingen er ikke noe besøkeren venter på, men den koster en CORS-runde
 * («preflight») som ellers legger seg midt i lastingen av selve siden og
 * spiser av forbindelsene. Derfor: vent til siden er lastet, og så til
 * nettleseren har et ledig øyeblikk.
 */
function naarLedig(cb: () => void) {
  const idle = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void })
    .requestIdleCallback
  const kjor = () => (idle ? idle(cb, { timeout: 4000 }) : setTimeout(cb, 1200))
  if (document.readyState === 'complete') kjor()
  else window.addEventListener('load', kjor, { once: true })
}

/** Kobles på i App: teller hver sidevisning ved rutebytte. */
export function useSporing() {
  const { pathname, search } = useLocation()
  const sistTalt = useRef<string | null>(null)

  useEffect(() => {
    // ?ref=kode fra f.eks. delte adresser – husk koden for resten av økta
    const ref = new URLSearchParams(search).get('ref')
    if (ref) huskLenkekode(ref)

    // React kjører effekter to ganger i utviklingsmodus (StrictMode). Uten
    // denne sperren telles hver sidevisning dobbelt når vi jobber lokalt.
    // To visninger av samme side på rad kan ellers ikke skje: klikk på en
    // lenke til siden man alt står på endrer ikke pathname, og en ny
    // sidelasting starter komponenten – og dermed sperren – på nytt.
    if (sistTalt.current === pathname) return
    sistTalt.current = pathname

    const sti = pathname
    naarLedig(() => registrer(sti))
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
}
