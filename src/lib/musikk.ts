import { useEffect, useState } from 'react'
import lydM4a from '../assets/lyd/piano-jazz.m4a'
import lydMp3 from '../assets/lyd/piano-jazz.mp3'

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
  // AAC først (mindre fil), MP3 for nettlesere som ikke spiller AAC
  for (const [src, type] of [
    [lydM4a, 'audio/mp4'],
    [lydMp3, 'audio/mpeg'],
  ]) {
    const kilde = document.createElement('source')
    kilde.src = src
    kilde.type = type
    audio.appendChild(kilde)
  }
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

/**
 * Kobler lydelementet gjennom en GainNode som står på 0, før avspillingen
 * starter. Gjøres bare én gang: et element kan bare kobles til én kontekst,
 * og etterpå går all lyd fra det gjennom grafen.
 */
function kobleGraf() {
  const k = lydKontekst()
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
 * Ber konteksten starte og svarer om den faktisk kjører. resume() svarer
 * først når nettleseren gir lov, og det kan ta evig, så vi venter høyst
 * litt over ett sekund.
 */
async function kontekstKjorer() {
  const k = ctx
  if (!k) return false
  if (k.state !== 'running') {
    try {
      await Promise.race([k.resume(), new Promise((r) => setTimeout(r, 1200))])
    } catch {
      /* ikke lov ennå */
    }
  }
  return k.state === 'running'
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
 * Starter avspillingen og glir inn. Alt som må skje inne i berøringen,
 * skjer synkront her: konteksten lages og bes starte, grafen kobles, og
 * play() kalles. Svarer false når nettleseren nekter, eller når forsøket
 * ble uaktuelt underveis (besøkeren skrudde av, fanen ble skjult).
 */
function start(innSek: number): Promise<boolean> {
  const nr = ++startNr
  const el = element()
  clearTimeout(pauseTimer)

  const k = lydKontekst()
  if (k && k.state !== 'running') void k.resume().catch(() => undefined)
  kobleGraf()

  let løfte: Promise<void>
  try {
    løfte = el.play()
  } catch (e) {
    løfte = Promise.reject(e)
  }

  const gyldig = () => nr === startNr && aktiv && tilstand !== 'av' && !document.hidden

  return løfte
    .then(async () => {
      if (!gyldig()) {
        el.pause()
        return false
      }
      // Går elementet gjennom en kontekst som ikke får kjøre ennå, er vi
      // like langt som før berøringen. Da venter vi på den neste.
      if (gain && !(await kontekstKjorer())) {
        el.pause()
        return false
      }
      if (!gyldig()) {
        el.pause()
        return false
      }
      gli(MAAL_VOLUM, innSek, 'inn')
      sett('spiller')
      return true
    })
    .catch(() => false)
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
    // Hent filen nå som resten av siden er på plass, og prøv å starte
    forhaandslast()
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
