import { useEffect, useState } from 'react'
import lydFil from '../assets/lyd/piano-jazz.m4a'

/**
 * Bakgrunnsmusikk på nettstedet.
 *
 * Ett rolig jazzspor (valgt av kunden) som starter fra stille og glir opp
 * til et lavt nivå over fem sekunder, går i sløyfe, og kan skrus av med
 * knappen nede i hjørnet (`Musikk.tsx`). Skrur besøkeren den av, huskes det
 * i nettleseren, så musikken holder seg borte ved neste besøk også.
 *
 * To ting nettleserne bestemmer, ikke vi:
 *
 *  1. Lyd får ikke starte før besøkeren har trykket eller tastet noe på
 *     siden. Vi prøver når siden er lastet, og lykkes det ikke, venter vi
 *     på den første berøringen og starter da. Det er den samme regelen i
 *     alle nettlesere, og den kan ikke omgås.
 *  2. På iPhone er `audio.volume` låst til 1. Volumet styres derfor gjennom
 *     Web Audio: elementet kobles gjennom en GainNode som står på 0 FØR
 *     avspillingen starter, så ikke en eneste tone slipper ut før
 *     innglidningen begynner. Uten Web Audio brukes `audio.volume`.
 *
 * Lyden lastes først når resten av siden er ferdig, så den aldri forsinker
 * bilder og tekst. Skjules fanen, settes musikken på pause, og den fortsetter
 * når fanen er tilbake.
 */

/** Nivået musikken ender på. 1 er fullt volum; 0.07 er en svak bakgrunn. */
export const MAAL_VOLUM = 0.07
/** Innglidning ved første start, i sekunder. */
const INN_SEK = 5
/** Kortere innglidning når besøkeren selv skrur musikken på igjen. */
const INN_KORT_SEK = 1.5
const UT_SEK = 0.8
const NOKKEL = 'md-musikk'

export type Tilstand = 'venter' | 'spiller' | 'av'

type Lytter = (t: Tilstand) => void

let audio: HTMLAudioElement | null = null
let ctx: AudioContext | null = null
let gain: GainNode | null = null
let tilstand: Tilstand = 'venter'
/** Om Musikk-komponenten er montert (den er borte i admin-panelet). */
let aktiv = false
/** Musikken ble satt på pause fordi fanen ble skjult, ikke av besøkeren. */
let pausetAvFane = false
let starter = false
let gesterArmert = false
/** Løpenummer for start(): et forsøk som blir ferdig for sent, får ikke bestemme. */
let startNr = 0
let raf = 0
let pauseTimer: ReturnType<typeof setTimeout> | undefined
const lytterne = new Set<Lytter>()

function sett(t: Tilstand) {
  if (tilstand === t) return
  tilstand = t
  lytterne.forEach((l) => l(t))
}

function lagret(): string | null {
  try {
    return localStorage.getItem(NOKKEL)
  } catch {
    return null
  }
}

function lagre(verdi: 'av' | 'paa') {
  try {
    localStorage.setItem(NOKKEL, verdi)
  } catch {
    /* privat modus uten lagring: da glemmes valget ved neste besøk */
  }
}

function element(): HTMLAudioElement {
  if (audio) return audio
  audio = document.createElement('audio')
  audio.loop = true
  audio.preload = 'none'
  // Én fil: AAC-LC i MP4, som alle nettlesere med <audio> spiller. Sporet er
  // klippet til én runde av sløyfa på 72 sekunder, mono, 48 kbit/s – 442 kB
  // mot 2,8 MB før. Kildepunktet er valgt der bølgeformen møter seg selv, med
  // en kort krysstoning, så gjentakelsen ikke høres.
  const kilde = document.createElement('source')
  kilde.src = lydFil
  kilde.type = 'audio/mp4'
  audio.appendChild(kilde)
  audio.volume = 0
  // Legges i dokumentet, så elementet er lett å finne ved feilsøking.
  document.body.appendChild(audio)
  return audio
}

function lydKontekst(): AudioContext | null {
  if (ctx) return ctx
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  try {
    ctx = new AC()
  } catch {
    ctx = null
  }
  return ctx
}

const vent = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Er lydkonteksten i gang på ordentlig? `state` sier «running» også i
 * tilfeller der klokka står stille (nettleseren har ikke fått lov ennå,
 * eller lydenheten er opptatt). Vi måler derfor at klokka faktisk går.
 * Dette er viktig: et element som kobles til en kontekst som står stille,
 * slutter å spille, og da blir det stille uten at noe ser galt ut.
 */
async function kontekstKlar() {
  const k = lydKontekst()
  if (!k) return false
  if (k.state !== 'running') {
    try {
      await Promise.race([k.resume(), vent(1200)])
    } catch {
      /* ikke lov ennå */
    }
  }
  if (k.state !== 'running') return false
  const for0 = k.currentTime
  await vent(120)
  return k.currentTime > for0
}

/**
 * Kobler lydelementet gjennom en GainNode. Gjøres bare én gang, og bare når
 * konteksten er i gang: et element kan bare kobles til én kontekst, og
 * koblingen kan ikke angres.
 */
function kobleGraf() {
  const k = ctx
  if (!k || gain) return
  try {
    const el = element()
    const kilde = k.createMediaElementSource(el)
    const g = k.createGain()
    g.gain.value = 0
    kilde.connect(g).connect(k.destination)
    el.volume = 1
    gain = g
  } catch {
    /* faller tilbake til audio.volume */
  }
}

/**
 * Sørger for at vi kan styre nivået, og setter det til null. Svarer false
 * hvis vi ikke kan det: da skal musikken bli værende stum heller enn å
 * brake ut på fullt volum. (På iPhone er `audio.volume` låst til 1, så der
 * er GainNode-veien den eneste som duger.)
 */
async function nivaaNull() {
  if (gain) {
    gli(0, 0, 'ut')
    return true
  }
  if (await kontekstKlar()) {
    kobleGraf()
    if (gain) return true
  }
  const el = element()
  el.volume = 0
  return el.volume === 0
}

/** Glir volumet fra der det er til `til` over `sek` sekunder. */
function gli(til: number, sek: number, kurve: 'inn' | 'ut') {
  cancelAnimationFrame(raf)
  const form = (t: number) => (kurve === 'inn' ? t * t : 1 - (1 - t) * (1 - t))

  if (gain && ctx) {
    const g = gain.gain
    const na = ctx.currentTime
    const fra = g.value
    g.cancelScheduledValues(na)
    g.setValueAtTime(fra, na)
    if (sek <= 0) {
      g.setValueAtTime(til, na)
      return
    }
    try {
      const n = 64
      const kurven = new Float32Array(n)
      for (let i = 0; i < n; i++) kurven[i] = fra + (til - fra) * form(i / (n - 1))
      g.setValueCurveAtTime(kurven, na, sek)
    } catch {
      g.linearRampToValueAtTime(til, na + sek)
    }
    return
  }

  // Uten Web Audio styres audio.volume. I en skjult fane står animasjonen
  // stille, så der settes nivået rett.
  const el = element()
  const fra = el.volume
  if (sek <= 0 || document.hidden) {
    el.volume = til
    return
  }
  const t0 = performance.now()
  const steg = (nu: number) => {
    const t = Math.min(1, (nu - t0) / (sek * 1000))
    el.volume = fra + (til - fra) * form(t)
    if (t < 1) raf = requestAnimationFrame(steg)
  }
  raf = requestAnimationFrame(steg)
}

/**
 * Starter avspillingen og glir inn.
 *
 * Elementet starter alltid stumt (`muted`), og lyden slippes først på når
 * vi vet at vi kan styre nivået. Slik hører ingen et brak i det musikken
 * begynner, heller ikke på iPhone, der volumet ellers står låst på fullt.
 * `muted` lar seg sette overalt.
 *
 * Konteksten bes starte synkront her, mens berøringen fortsatt gjelder.
 * Selve koblingen skjer først etter at avspillingen er i gang, og bare hvis
 * konteksten virkelig kjører.
 *
 * Svarer false når nettleseren nekter, når vi ikke kan styre nivået, eller
 * når forsøket ble uaktuelt underveis (besøkeren skrudde av, fanen ble
 * skjult). Svarer play() aldri, gir vi opp etter fem sekunder, så knappen
 * ikke blir stående og påstå at noe er på vei.
 */
function start(innSek: number): Promise<boolean> {
  const nr = ++startNr
  const el = element()
  clearTimeout(pauseTimer)
  el.muted = true

  const k = lydKontekst()
  if (k && k.state !== 'running') void k.resume().catch(() => undefined)

  let løfte: Promise<unknown>
  try {
    løfte = el.play() ?? Promise.resolve()
  } catch (e) {
    løfte = Promise.reject(e)
  }

  const gyldig = () => nr === startNr && aktiv && tilstand !== 'av' && !document.hidden
  const gi_opp = () => {
    el.pause()
    el.muted = false
    return false
  }

  return Promise.race([løfte, vent(5000).then(() => Promise.reject(new Error('tidsavbrudd')))])
    .then(async () => {
      if (!gyldig()) return gi_opp()
      if (!(await nivaaNull())) return gi_opp()
      if (!gyldig()) return gi_opp()
      el.muted = false
      gli(MAAL_VOLUM, innSek, 'inn')
      sett('spiller')
      return true
    })
    .catch(() => {
      el.pause()
      el.muted = false
      return false
    })
}

/** Glir ut og setter på pause når det er stille. */
function stopp(utSek: number) {
  const el = element()
  clearTimeout(pauseTimer)
  gli(0, utSek, 'ut')
  pauseTimer = setTimeout(() => el.pause(), utSek * 1000 + 60)
}

/** Begynn å hente lydfilen i bakgrunnen, så den er klar ved første trykk. */
function forhaandslast() {
  const el = element()
  if (el.preload === 'auto' || !el.paused) return
  el.preload = 'auto'
  try {
    el.load()
  } catch {
    /* ikke noe å gjøre */
  }
}

const GESTER = ['pointerdown', 'touchend', 'keydown', 'click'] as const

function vedGest(e: Event) {
  if (starter || !aktiv || tilstand !== 'venter') return
  // Et pointerdown fra finger eller penn regnes ikke som berøring av
  // nettleserne (det gjør touchend); med mus teller det.
  if (e.type === 'pointerdown' && (e as PointerEvent).pointerType !== 'mouse') return
  // Musikk-knappen bestemmer selv (se veksle).
  const mål = e.target as Element | null
  if (mål?.closest?.('.musikk')) return
  // Første berøring: nå er avspilling tillatt, så det er nå filen skal hentes.
  forhaandslast()
  starter = true
  void start(INN_SEK).then((ok) => {
    starter = false
    if (ok) avarmer()
  })
}

function armer() {
  if (gesterArmert) return
  gesterArmert = true
  for (const g of GESTER) window.addEventListener(g, vedGest, { capture: true, passive: true })
}

function avarmer() {
  if (!gesterArmert) return
  gesterArmert = false
  for (const g of GESTER) window.removeEventListener(g, vedGest, { capture: true })
}

function vedSynlighet() {
  if (document.hidden) {
    // et forsøk som er i gang, skal ikke ende i lyd i en skjult fane
    startNr++
    if (tilstand !== 'spiller') return
    pausetAvFane = true
    stopp(0.5)
    sett('venter')
    return
  }
  if (!pausetAvFane || !aktiv || tilstand !== 'venter' || starter) return
  pausetAvFane = false
  starter = true
  void start(2).then((ok) => {
    starter = false
    if (!ok) armer()
  })
}

/** Kjør `cb` når siden er ferdig lastet, pluss et lite pusterom. */
function naarLastet(cb: () => void) {
  const senere = () => setTimeout(cb, 700)
  if (document.readyState === 'complete') senere()
  else window.addEventListener('load', senere, { once: true })
}

function sparerData() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  return Boolean(nav.connection?.saveData)
}

/** Kalles når Musikk-komponenten monteres. Trygg å kalle flere ganger. */
export function aktiver() {
  aktiv = true
  document.addEventListener('visibilitychange', vedSynlighet)

  if (lagret() === 'av' || (lagret() !== 'paa' && sparerData())) {
    sett('av')
    return
  }
  if (tilstand === 'spiller') return

  sett('venter')
  // Lytterne står klare med én gang, så den aller første berøringen teller,
  // også før siden er ferdig lastet.
  armer()
  naarLastet(() => {
    if (!aktiv || tilstand !== 'venter' || starter) return
    // Vi henter IKKE filen på forhånd her. Nettleseren nekter uansett å spille
    // lyd før besøkeren har trykket et sted, så en forhåndshenting ville i de
    // aller fleste tilfellene lastet ned en fil ingen får høre. `start()`
    // henter den selv i det øyeblikket avspilling faktisk er tillatt, og
    // `vedGest` varmer den opp ved første berøring.
    starter = true
    void start(INN_SEK).then((ok) => {
      starter = false
      if (ok) avarmer()
    })
  })
}

/** Kalles når komponenten forsvinner (admin-panelet). Musikken stilner. */
export function deaktiver() {
  aktiv = false
  startNr++
  avarmer()
  document.removeEventListener('visibilitychange', vedSynlighet)
  if (tilstand === 'spiller') {
    stopp(0.4)
    sett('venter')
  }
}

/**
 * Knappen. Spiller musikken, skrus den av. Er den av, skrus den på. Venter
 * vi fortsatt på en berøring (nettleseren sa nei til å starte selv), er
 * trykket på knappen nettopp den berøringen: da starter musikken, i stedet
 * for å bli skrudd av før besøkeren har hørt noe.
 */
export function veksle() {
  if (tilstand === 'av' || tilstand === 'venter') {
    lagre('paa')
    sett('venter')
    if (starter) return
    starter = true
    void start(INN_KORT_SEK).then((ok) => {
      starter = false
      if (ok) avarmer()
      else if (aktiv && tilstand === 'venter') armer()
    })
    return
  }
  lagre('av')
  startNr++
  avarmer()
  pausetAvFane = false
  stopp(UT_SEK)
  sett('av')
}

/** Tilstanden, som React-state. */
export function useMusikk(): Tilstand {
  const [t, setT] = useState<Tilstand>(tilstand)
  useEffect(() => {
    lytterne.add(setT)
    setT(tilstand)
    return () => {
      lytterne.delete(setT)
    }
  }, [])
  return t
}
