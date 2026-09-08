import { useEffect, useRef, useState } from 'react'

/**
 * Logikken bak tilbudsskjemaet: validering, krymping av bildene i
 * nettleseren, og sending til `/api/kontakt` med `skjema: 'tilbud'`.
 *
 * Skjemaet står på Kontakt-siden og nederst på forsiden, tegnet i Figma som
 * seks nummererte spørsmål. Den syvende bolken, kontaktopplysningene, er
 * ikke tegnet, men uten den kan ikke Delius svare kunden i det hele tatt.
 *
 * Bildene fra en telefon er gjerne 3 til 8 MB hver. Serverfunksjonen hos
 * Vercel tar imot høyst 4,5 MB per innsending, så bildene tegnes om på et
 * lerret her i nettleseren og lagres som JPEG på rundt en halv megabyte
 * før de sendes. Kunden merker ingenting, annet enn at det går fort.
 */

export const MAKS_BILDER = 6
/** Lengste side etter krymping, i piksler. Nok til å se sprekker og farger. */
const MAKS_SIDE = 1600
/** Mål for hvert bilde etter krymping. Prøves i flere trinn (se `komprimer`). */
const MAKS_BYTES_BILDE = 500_000
/** Summen av alle bildene (6 x 500 KB). Base64 legger på en tredjedel, og Vercel stopper på 4,5 MB. */
const MAKS_BYTES_TOTALT = 3_000_000
/** Absolutt tak per bilde; serveren avviser alt over dette. */
const ABSOLUTT_TAK_BILDE = 740_000

export type Bilde = { id: number; navn: string; url: string; blob: Blob }
export type Status = 'klar' | 'sender' | 'sendt' | 'feil'
export type Felt =
  | 'jobbtype'
  | 'adresse'
  | 'areal'
  | 'tidspunkt'
  | 'bilder'
  | 'melding'
  | 'navn'
  | 'telefon'
  | 'epost'
  | 'samtykke'
  | null

const EPOST_MONSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Feilmeldingene brukeren ser. På norsk, som resten av siden. */
const FEIL = {
  navn: 'Skriv inn navnet ditt.',
  kontakt: 'Oppgi et telefonnummer eller en e-postadresse, så vi kan svare deg.',
  telefon: 'Telefonnummeret ser ikke riktig ut. Sjekk sifrene, eller oppgi e-post i stedet.',
  epost: 'E-postadressen ser ikke riktig ut. Sjekk den, eller oppgi telefon i stedet.',
  samtykke: 'Kryss av for at du har lest personvernerklæringen før du sender.',
  adresse: 'Skriv inn hvor jobben er, postnummer eller adresse.',
  jobbtype: 'Skriv hva slags jobb det gjelder.',
  bilderVenter: 'Vent litt til bildene er klare, og prøv igjen.',
  forMangeBilder: `Du kan legge ved inntil ${MAKS_BILDER} bilder.`,
  forStort: 'Bildene er for store til sammen. Fjern ett og prøv igjen.',
  forStortSum: 'Det siste bildet ble ikke lagt til: bildene blir for store til sammen.',
  kanIkkeLese: (navn: string) => `Bildet «${navn}» kunne ikke leses. Prøv JPG eller PNG.`,
  forStortBilde: (navn: string) =>
    `Bildet «${navn}» er for stort selv etter krymping. Prøv et annet bilde.`,
  forMange:
    'Det er sendt mange meldinger herfra på kort tid. Vent noen minutter og prøv igjen.',
  server:
    'Forespørselen kunne ikke sendes akkurat nå. Prøv igjen, eller ring oss på 966 93 780.',
}

let teller = 0

/** Bildet lot seg ikke krympe nok til å sendes. */
class ForStort extends Error {}

/**
 * Leser bildet via et <img>-element. Nettleseren snur det da riktig vei
 * etter EXIF-dataene (telefoner lagrer ofte bildet liggende og noterer bare
 * at det skal stå), noe `createImageBitmap` ikke gjør likt overalt.
 */
function dekod(fil: File): Promise<{ bilde: HTMLImageElement; rydd: () => void }> {
  const url = URL.createObjectURL(fil)
  return new Promise((ok, nei) => {
    const bilde = new Image()
    bilde.onload = () => ok({ bilde, rydd: () => URL.revokeObjectURL(url) })
    bilde.onerror = () => {
      URL.revokeObjectURL(url)
      nei(new Error('kunne ikke lese bildet'))
    }
    bilde.src = url
  })
}

/**
 * Tegner bildet om i mindre størrelse og lagrer som JPEG. Er resultatet
 * fortsatt for stort, prøves et mindre format og lavere kvalitet.
 * Gjennomsiktige PNG-er får hvit bakgrunn, ellers hadde de blitt svarte.
 */
async function komprimer(fil: File): Promise<Blob> {
  const { bilde, rydd } = await dekod(fil)
  try {
    const w = bilde.naturalWidth
    const h = bilde.naturalHeight
    if (!w || !h) throw new Error('tomt bilde')

    const trinn: Array<[number, number]> = [
      [MAKS_SIDE, 0.82],
      [1280, 0.74],
      [1024, 0.66],
      [800, 0.6],
    ]
    let siste: Blob | null = null
    for (const [side, kvalitet] of trinn) {
      const skala = Math.min(1, side / Math.max(w, h))
      const lerret = document.createElement('canvas')
      lerret.width = Math.max(1, Math.round(w * skala))
      lerret.height = Math.max(1, Math.round(h * skala))
      const g = lerret.getContext('2d')
      if (!g) throw new Error('ingen canvas')
      g.fillStyle = '#ffffff'
      g.fillRect(0, 0, lerret.width, lerret.height)
      g.drawImage(bilde, 0, 0, lerret.width, lerret.height)
      const blob = await new Promise<Blob | null>((r) => lerret.toBlob(r, 'image/jpeg', kvalitet))
      if (!blob) throw new Error('kunne ikke lage jpeg')
      siste = blob
      if (blob.size <= MAKS_BYTES_BILDE) break
    }
    if (!siste) throw new Error('ingen utdata')
    // Serveren avviser bilder over taket; da er det bedre å si fra her
    if (siste.size > ABSOLUTT_TAK_BILDE) throw new ForStort()
    return siste
  } finally {
    rydd()
  }
}

function tilBase64(blob: Blob): Promise<string> {
  return new Promise((ok, nei) => {
    const leser = new FileReader()
    leser.onload = () => ok(String(leser.result).split(',')[1] ?? '')
    leser.onerror = () => nei(leser.error)
    leser.readAsDataURL(blob)
  })
}

export function useTilbudSkjema() {
  const [status, setStatus] = useState<Status>('klar')
  const [feil, setFeil] = useState('')
  const [feilFelt, setFeilFelt] = useState<Felt>(null)
  const [bilder, setBilder] = useState<Bilde[]>([])
  const [bildeFeil, setBildeFeil] = useState('')
  /** Antall bilder som er under krymping akkurat nå. */
  const [behandler, setBehandler] = useState(0)

  // Bildene leses også fra asynkrone løp (krymping, sending), så den ferske
  // listen ligger i en ref ved siden av state.
  const bilderRef = useRef<Bilde[]>([])
  const behandlerRef = useRef(0)
  const forsteTast = useRef<number | null>(null)
  const statusRef = useRef<Status>('klar')
  statusRef.current = status
  /** Økes når listen tømmes, så bilder som var under krymping da, kastes. */
  const generasjon = useRef(0)
  /**
   * Det som er skrevet i tekstfeltene. Feltene er ukontrollerte, men bytter
   * siden mellom mobil- og desktop-utgaven (et nettbrett som snus), monteres
   * skjemaet på nytt, og da fylles feltene fra dette igjen.
   */
  const utkast = useRef<Record<string, string>>({})

  // Miniatyrene er object-URL-er; de må slippes når skjemaet forsvinner
  useEffect(
    () => () => {
      for (const b of bilderRef.current) URL.revokeObjectURL(b.url)
    },
    [],
  )

  function oppdaterBilder(liste: Bilde[]) {
    bilderRef.current = liste
    setBilder(liste)
  }

  function settBehandler(endring: number) {
    behandlerRef.current += endring
    setBehandler(behandlerRef.current)
  }

  /** Første tastetrykk, utkastet, og rydding av en gammel feilmelding når man retter. */
  function merk(e?: { target?: EventTarget | null }) {
    forsteTast.current ??= Date.now()
    const el = e?.target as { name?: string; value?: unknown } | null | undefined
    if (el?.name && typeof el.value === 'string') utkast.current[el.name] = el.value
    if (status === 'feil') {
      setStatus('klar')
      setFeil('')
      setFeilFelt(null)
    }
  }

  async function leggTil(filer: FileList | File[]) {
    if (statusRef.current === 'sender') return
    merk()
    const liste = Array.from(filer).filter(
      (f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name),
    )
    if (!liste.length) return

    const plass = MAKS_BILDER - bilderRef.current.length - behandlerRef.current
    if (plass <= 0) {
      setBildeFeil(FEIL.forMangeBilder)
      return
    }
    const tas = liste.slice(0, plass)
    setBildeFeil(liste.length > plass ? FEIL.forMangeBilder : '')

    settBehandler(tas.length)
    const runde = generasjon.current
    for (const fil of tas) {
      try {
        const blob = await komprimer(fil)
        // Skjemaet ble sendt og tømt mens bildet var under krymping
        if (runde !== generasjon.current) continue
        const sum = bilderRef.current.reduce((s, b) => s + b.blob.size, 0) + blob.size
        if (sum > MAKS_BYTES_TOTALT) {
          setBildeFeil(FEIL.forStortSum)
          continue
        }
        oppdaterBilder([
          ...bilderRef.current,
          { id: ++teller, navn: fil.name, url: URL.createObjectURL(blob), blob },
        ])
      } catch (e) {
        if (runde === generasjon.current) {
          setBildeFeil(e instanceof ForStort ? FEIL.forStortBilde(fil.name) : FEIL.kanIkkeLese(fil.name))
        }
      } finally {
        settBehandler(-1)
      }
    }
  }

  function fjern(id: number) {
    merk()
    const bilde = bilderRef.current.find((b) => b.id === id)
    if (bilde) URL.revokeObjectURL(bilde.url)
    oppdaterBilder(bilderRef.current.filter((b) => b.id !== id))
    setBildeFeil('')
  }

  function tomBilder() {
    generasjon.current++
    for (const b of bilderRef.current) URL.revokeObjectURL(b.url)
    oppdaterBilder([])
  }

  function vis(melding: string, felt: Felt = null) {
    setStatus('feil')
    setFeil(melding)
    setFeilFelt(felt)
  }

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sender') return

    const skjema = e.currentTarget
    const data = new FormData(skjema)
    const hent = (navn: string) => String(data.get(navn) ?? '').trim()
    const jobbtype = hent('jobbtype')
    const adresse = hent('adresse')
    const areal = hent('areal')
    const tidspunkt = hent('tidspunkt')
    const melding = hent('melding')
    const navn = hent('navn')
    const telefon = hent('telefon')
    const epost = hent('epost')
    const samtykke = data.get('samtykke') === 'ja'
    const krukke = String(data.get('tilleggsinfo') ?? '')

    // Rekkefølgen følger spørsmålene i skjemaet, så den første feilen som
    // vises er den øverste som mangler. Areal og tidspunkt er ikke krav:
    // designet spør «omtrent» og «når ønsker du», og et svar vi ikke fikk
    // er bedre enn en henvendelse kunden ga opp.
    if (jobbtype.length < 2) return vis(FEIL.jobbtype, 'jobbtype')
    if (adresse.length < 3) return vis(FEIL.adresse, 'adresse')
    if (behandlerRef.current > 0) return vis(FEIL.bilderVenter, 'bilder')
    if (!navn) return vis(FEIL.navn, 'navn')
    // Én måte å nå kunden på er nok. Vi ber ikke om mer enn vi trenger
    // (personvernforordningen artikkel 5 nr. 1 bokstav c), og det som er
    // fylt ut må se riktig ut.
    if (!telefon && !epost) return vis(FEIL.kontakt, 'telefon')
    if (telefon && !/^\+?\d{8,15}$/.test(telefon.replace(/[\s().-]/g, ''))) return vis(FEIL.telefon, 'telefon')
    if (epost && !EPOST_MONSTER.test(epost)) return vis(FEIL.epost, 'epost')
    if (!samtykke) return vis(FEIL.samtykke, 'samtykke')

    setFeil('')
    setFeilFelt(null)
    setStatus('sender')

    try {
      const vedlegg = await Promise.all(
        bilderRef.current.map(async (b, i) => ({
          navn: `bilde-${i + 1}.jpg`,
          type: 'image/jpeg',
          data: await tilBase64(b.blob),
        })),
      )

      const svar = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skjema: 'tilbud',
          navn,
          telefon,
          epost,
          adresse,
          // Serverfunksjonen skriver ut en liste; nå er det ett fritt svar.
          jobbtyper: [jobbtype],
          areal,
          tidspunkt,
          melding,
          bilder: vedlegg,
          // Dokumentasjon på at personvernerklæringen ble godtatt, og når
          samtykke: true,
          samtykkeTid: new Date().toISOString(),
          tilleggsinfo: krukke,
          apnet: forsteTast.current ? Date.now() - forsteTast.current : 0,
          side: window.location.pathname,
        }),
      })

      if (svar.status === 429) return vis(FEIL.forMange)
      if (svar.status === 413) return vis(FEIL.forStort, 'bilder')
      if (svar.status === 400) {
        // Serveren sier hva som var galt; gjelder det bildene, pekes det dit
        const kropp = (await svar.json().catch(() => null)) as { feil?: string } | null
        if (/bild/i.test(kropp?.feil ?? '')) return vis(FEIL.forStort, 'bilder')
        throw new Error('400')
      }
      if (!svar.ok) throw new Error(String(svar.status))

      skjema.reset()
      utkast.current = {}
      tomBilder()
      setBildeFeil('')
      setStatus('sendt')
    } catch {
      setStatus('feil')
      setFeil(FEIL.server)
    }
  }

  // Store bokstaver og pil, som knappen er tegnet i Figma
  const knappetekst =
    status === 'sender' ? 'SENDER …' : status === 'sendt' ? 'TAKK!' : 'SEND FORESPØRSEL →'

  return {
    status,
    feil,
    feilFelt,
    send,
    merk,
    knappetekst,
    bilder,
    bildeFeil,
    behandler,
    leggTil,
    fjern,
    utkast,
  }
}

export type TilbudSkjemaTilstand = ReturnType<typeof useTilbudSkjema>
