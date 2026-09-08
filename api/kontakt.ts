/**
 * Serverfunksjon for skjemaene på malerdelius.no.
 *
 * Tar imot POST fra `src/lib/kontakt.ts` (det korte kontaktskjemaet) og fra
 * `src/lib/tilbud.ts` (tilbudsskjemaet med telefon, adresse, areal og bilder)
 * og sender innholdet videre på e-post gjennom Resend (https://resend.com).
 * Bildene fra tilbudsskjemaet følger med som vedlegg. Funksjonen kjører på
 * Vercel; nøkler og adresser står i miljøvariabler, ikke i koden:
 *
 *   RESEND_API_KEY   nøkkelen fra Resend
 *   KONTAKT_TIL      adressen meldingene skal til (kan være flere, komma mellom)
 *   KONTAKT_FRA      avsenderen, på et domene som er verifisert i Resend
 *   SITE_URL         (valgfri) adressen bildene i e-posten hentes fra
 *
 * E-posten er tegnet i designets stil: akvarellsølet fra hero-en, logoen,
 * marineblå tekst og den gule, runde knappen. Bildene ligger i `public/epost/`
 * og hentes fra nettsiden, så e-posten selv holder seg liten.
 */

type Req = {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}

type Res = {
  status: (kode: number) => Res
  json: (kropp: unknown) => void
  setHeader: (navn: string, verdi: string) => void
}

/** Én linje i e-posten: etikett til venstre, verdi til høyre. */
type Rad = { etikett: string; tekst: string; html?: string }

type Vedlegg = { filename: string; content: string }

const EPOST_MONSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Kontrolltegn (linjeskift, tab, osv.), byttes med mellomrom i enlinjefelt. */
const KONTROLLTEGN = /[\x00-\x1f\x7f]/g

/**
 * Enkel bremse per IP. Den lever bare så lenge instansen lever, så den er
 * ingen garanti mot en fordelt flom – men den stopper det som faktisk skjer:
 * én og samme avsender som trykker igjen og igjen. Et ekte tak på tvers av
 * alle instanser krever delt lagring (Vercel KV eller en tabell i Supabase).
 */
const TAK = 3
const VINDU_MS = 10 * 60 * 1000
const sett = new Map<string, number[]>()

/**
 * Nettstedene skjemaet har lov til å komme fra: det ekte nettstedet, Vercels
 * forhåndsvisninger (så et utkast kan prøves før det legges ut) og maskinen
 * til den som utvikler. Alt annet er en fremmed side som sender på vegne av
 * en besøkende.
 */
const OPPHAV = [
  /^https:\/\/(www\.)?malerdelius\.no$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
]

/**
 * Hvor lenge vi venter på Resend før vi gir opp. Serverfunksjonen hos Vercel
 * får høyst ti sekunder, så vår egen frist ligger under den: da får kunden
 * en ordentlig feilmelding i stedet for et avbrutt svar.
 */
const SENDE_FRIST_MS = 9_000

/**
 * Bildene fra tilbudsskjemaet. Nettleseren krymper dem før sending (se
 * `src/lib/tilbud.ts`), og her settes taket en gang til, så ingen kan sende
 * oss noe annet enn små bilder. Vercel avviser uansett alt over 4,5 MB.
 */
const MAKS_BILDER = 6
const MAKS_BASE64_PER_BILDE = 1_000_000
const MAKS_BASE64_TOTALT = 4_200_000

/**
 * Hva slags fil det egentlig er, lest av de første bytene. Typen nettleseren
 * oppgir er bare et ord i en JSON og kan si hva som helst; bytene lyver ikke.
 */
function bildetype(b: Uint8Array): 'jpg' | 'png' | 'webp' | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg'
  if (
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  )
    return 'png'
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return 'webp'
  return null
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ feil: 'Bruk POST' })
  }

  // Nettlesere sender alltid Origin på en POST, også fra samme nettsted.
  // Mangler den, eller peker den på et annet opphav, er det ikke skjemaet
  // vårt som sender, og da er det ikke en kunde som skriver.
  const opphav = forsteVerdi(req.headers.origin)
  if (!opphav || !OPPHAV.some((m) => m.test(opphav))) {
    return res.status(403).json({ feil: 'Ugyldig opphav' })
  }

  const kropp = (typeof req.body === 'string' ? tryggParse(req.body) : req.body) as
    | Record<string, unknown>
    | undefined

  const skjema: 'kontakt' | 'tilbud' = kropp?.skjema === 'tilbud' ? 'tilbud' : 'kontakt'

  // Navn og side skal være én linje: kontrolltegn (deriblant \r\n) byttes med
  // mellomrom, så ingen kan smugle egne linjer inn i emnefeltet eller e-posten.
  const navn = enLinje(tekst(kropp?.navn, 120))
  const epost = tekst(kropp?.epost, 200)
  // Avkryssingen for personvernerklæringen, med tidspunktet nettleseren
  // oppga. Begge skrives inn i e-posten, så bedriften kan dokumentere at
  // kunden fikk informasjonen før opplysningene ble samlet inn.
  const samtykke = kropp?.samtykke === true
  const samtykkeTid = enLinje(tekst(kropp?.samtykkeTid, 40))
  const melding = tekst(kropp?.melding, 5000)
  const krukke = tekst(kropp?.tilleggsinfo, 200)
  const apnet = Number(kropp?.apnet ?? 0)
  const side = enLinje(tekst(kropp?.side, 100)) || '/'

  // Feltene som bare tilbudsskjemaet har
  const telefon = enLinje(tekst(kropp?.telefon, 40))
  const adresse = enLinje(tekst(kropp?.adresse, 200))
  // Areal og tidspunkt er frie tekstfelt etter at skjemaet ble tegnet om
  // («f.eks. 80 m²», «Skriv ønsket tidspunkt eller periode»), så de siles
  // bare for lengde og linjeskift, ikke for siffer.
  const areal = enLinje(tekst(kropp?.areal, 40))
  const tidspunkt = enLinje(tekst(kropp?.tidspunkt, 120))
  const jobbtyper = liste(kropp?.jobbtyper, 8, 120)

  // To uavhengige robottegn: det skjulte feltet er fylt ut, og skrivetiden
  // mangler eller er under to sekunder. Hver for seg tar de av og til feil –
  // en nettleser kan finne på å fylle ut skjulte felt automatisk, og et
  // menneske kan lime inn en ferdigskrevet melding. Derfor slukes ingenting
  // med mindre BEGGE slår ut. Ett tegn alene gir en merket e-post i stedet,
  // så en ekte kunde aldri forsvinner i stillhet.
  const krukkeSlo = Boolean(krukke)
  const fortSlo = !Number.isFinite(apnet) || apnet <= 0 || apnet < 2000

  if (krukkeSlo && fortSlo) {
    console.log('Droppet innsending: robot (skjult felt + ingen skrivetid)')
    return res.status(200).json({ ok: true })
  }

  const mistenkt = krukkeSlo || fortSlo
  if (mistenkt) console.log('Mistenkt robot, sender merket', { krukkeSlo, apnet })

  if (!navn) return res.status(400).json({ feil: 'Navn mangler' })

  if (skjema === 'tilbud') {
    // Telefon eller e-post: minst én, og den som er oppgitt må være gyldig
    if (!telefon && !epost) return res.status(400).json({ feil: 'Telefon eller e-post mangler' })
    if (telefon && !gyldigTelefon(telefon)) return res.status(400).json({ feil: 'Ugyldig telefonnummer' })
    if (epost && !EPOST_MONSTER.test(epost)) return res.status(400).json({ feil: 'Ugyldig e-post' })
    if (adresse.length < 3) return res.status(400).json({ feil: 'Adresse mangler' })
    if (!samtykke) return res.status(400).json({ feil: 'Personvernerklæringen må godtas' })
  } else {
    if (!EPOST_MONSTER.test(epost)) return res.status(400).json({ feil: 'Ugyldig e-post' })
    if (melding.length < 5) return res.status(400).json({ feil: 'Meldingen er for kort' })
  }

  const bilder = skjema === 'tilbud' ? lesBilder(kropp?.bilder) : { vedlegg: [] as Vedlegg[] }
  if ('feil' in bilder && bilder.feil) return res.status(400).json({ feil: bilder.feil })

  const ip =
    forsteVerdi(req.headers['x-real-ip']) ??
    forsteVerdi(req.headers['x-forwarded-for']) ??
    'ukjent'
  if (forMange(ip)) return res.status(429).json({ feil: 'For mange forsøk. Prøv igjen senere.' })

  const nokkel = process.env.RESEND_API_KEY
  const til = (process.env.KONTAKT_TIL ?? '').split(',').map((a) => a.trim()).filter(Boolean)
  const fra = process.env.KONTAKT_FRA ?? 'Maler Delius <skjema@send.malerdelius.no>'

  if (!nokkel || til.length === 0) {
    console.error('Mangler RESEND_API_KEY eller KONTAKT_TIL')
    return res.status(500).json({ feil: 'Skjemaet er ikke ferdig satt opp' })
  }

  const innhold =
    skjema === 'tilbud'
      ? tilbudEpost({
          navn,
          epost,
          telefon,
          adresse,
          areal,
          tidspunkt,
          jobbtyper,
          melding,
          antallBilder: bilder.vedlegg.length,
          samtykkeTid,
        })
      : kontaktEpost({ navn, epost, melding, side })

  try {
    const avbryt = new AbortController()
    const frist = setTimeout(() => avbryt.abort(), SENDE_FRIST_MS)
    const svar = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: avbryt.signal,
      headers: {
        Authorization: `Bearer ${nokkel}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fra,
        to: til,
        // Svar-knappen i e-postklienten går rett til kunden, når vi har e-posten
        ...(epost ? { reply_to: epost } : {}),
        subject: `${mistenkt ? '[Mistenkt robot] ' : ''}${innhold.emne}`,
        text: innhold.tekst,
        html: innhold.html,
        ...(bilder.vedlegg.length ? { attachments: bilder.vedlegg } : {}),
      }),
    })

    clearTimeout(frist)

    if (!svar.ok) {
      console.error('Resend svarte', svar.status, await svar.text())
      return res.status(502).json({ feil: 'E-posten kunne ikke sendes' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Sending feilet', e)
    return res.status(500).json({ feil: 'E-posten kunne ikke sendes' })
  }
}

function tekst(verdi: unknown, maks: number) {
  return typeof verdi === 'string' ? verdi.trim().slice(0, maks) : ''
}

/** En liste av korte tekster (valgene i tilbudsskjemaet). Alt annet forkastes. */
function liste(verdi: unknown, maksAntall: number, maksLengde: number): string[] {
  if (!Array.isArray(verdi)) return []
  return verdi
    .slice(0, maksAntall)
    .map((v) => enLinje(tekst(v, maksLengde)))
    .filter(Boolean)
}

/** Bytter kontrolltegn (linjeskift, tab, osv.) med mellomrom. */
function enLinje(s: string) {
  return s.replace(KONTROLLTEGN, ' ').trim()
}

/** Norske og utenlandske numre: 8 til 15 sifre, eventuelt med + foran. */
function gyldigTelefon(s: string) {
  const sifre = s.replace(/[\s().-]/g, '')
  return /^\+?\d{8,15}$/.test(sifre)
}

/**
 * Bildene kommer som base64-tekst. Hvert bilde og summen av dem har et tak,
 * og bare JPEG, PNG og WebP slipper gjennom, avgjort av bytene i filen og
 * ikke av hva nettleseren påstår. Filnavnet lages her, så det aldri kommer
 * noe rart fra nettleseren inn i vedlegget.
 */
function lesBilder(verdi: unknown): { vedlegg: Vedlegg[]; feil?: string } {
  if (verdi == null) return { vedlegg: [] }
  if (!Array.isArray(verdi)) return { vedlegg: [], feil: 'Ugyldige bilder' }
  if (verdi.length > MAKS_BILDER) return { vedlegg: [], feil: 'For mange bilder' }

  const vedlegg: Vedlegg[] = []
  let totalt = 0
  for (let i = 0; i < verdi.length; i++) {
    const bilde = (verdi[i] ?? {}) as Record<string, unknown>
    const data = typeof bilde.data === 'string' ? bilde.data : ''
    if (!data || data.length > MAKS_BASE64_PER_BILDE) return { vedlegg: [], feil: 'Bildet er for stort' }
    if (data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
      return { vedlegg: [], feil: 'Ugyldig bildedata' }
    }
    const endelse = bildetype(Buffer.from(data.slice(0, 64), 'base64'))
    if (!endelse) return { vedlegg: [], feil: 'Ukjent bildetype' }
    totalt += data.length
    if (totalt > MAKS_BASE64_TOTALT) return { vedlegg: [], feil: 'Bildene er for store til sammen' }
    vedlegg.push({ filename: `bilde-${i + 1}.${endelse}`, content: data })
  }
  return { vedlegg }
}

function tryggParse(s: string) {
  try {
    return JSON.parse(s)
  } catch {
    return undefined
  }
}

function forsteVerdi(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v
  return s ? s.split(',')[0].trim() : undefined
}

function forMange(ip: string) {
  const na = Date.now()
  const nylige = (sett.get(ip) ?? []).filter((t) => na - t < VINDU_MS)
  // Avviste forsøk telles ikke: da løper sperren ut av seg selv, i stedet for
  // at hvert nye forsøk holder den i live. Taket begrenser også minnebruken.
  if (nylige.length <= TAK) nylige.push(na)
  if (nylige.length === 0) sett.delete(ip)
  else sett.set(ip, nylige)
  return nylige.length > TAK
}

/** Hvilken side skjemaet sto på, med navnet fra menyen. */
function sidenavn(sti: string) {
  const navn: Record<string, string> = Object.assign(Object.create(null), {
    '/': 'Forsiden',
    '/kontakt': 'Kontakt oss',
    '/om-oss': 'Om oss',
    '/portefolje': 'Portefølje',
    '/malertjenester': 'Malertjenester',
    '/blogg': 'Blogg',
    '/tilbud': 'Be om tilbud',
  })
  return navn[sti] ?? sti
}

/** Bildene hentes fra nettsiden. Lokalt og på Vercel pekes det automatisk riktig. */
function bildeBase() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return 'https://malerdelius.no'
}

/** ISO-tidspunktet fra nettleseren, i norsk språkdrakt og Oslo-tid. Ugyldig dato gir tom streng. */
function samtykkeTidspunkt(iso: string) {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  try {
    return new Intl.DateTimeFormat('nb-NO', {
      timeZone: 'Europe/Oslo',
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(t))
  } catch {
    return ''
  }
}

/** Tidspunktet meldingen kom inn, i norsk språkdrakt og Oslo-tid. */
function mottatt() {
  try {
    return new Intl.DateTimeFormat('nb-NO', {
      timeZone: 'Europe/Oslo',
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date())
  } catch {
    return ''
  }
}

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** E-postadressen som lenke. Prosentkodet, så ?/&/% i adressen ikke blir parametre. */
function epostLenke(epost: string) {
  return `<a href="mailto:${encodeURIComponent(epost)}" style="color:#0051ff;text-decoration:none;">${esc(epost)}</a>`
}

/** Nummeret er alt kontrollert til +?sifre, og plusstegnet skal stå ukodet i tel: (RFC 3966). */
function telefonLenke(telefon: string) {
  const sifre = telefon.replace(/[\s().-]/g, '')
  if (!/^\+?\d{8,15}$/.test(sifre)) return esc(telefon)
  return `<a href="tel:${sifre}" style="color:#0051ff;text-decoration:none;">${esc(telefon)}</a>`
}

/** Det korte kontaktskjemaet (forsiden og Kontakt-siden). */
function kontaktEpost(d: { navn: string; epost: string; melding: string; side: string }) {
  const rader: Rad[] = [
    { etikett: 'Navn', tekst: d.navn },
    { etikett: 'E-post', tekst: d.epost, html: epostLenke(d.epost) },
    { etikett: 'Side', tekst: sidenavn(d.side) },
  ]
  return byggEpost({
    emne: `Ny melding fra malerdelius.no – ${d.navn}`,
    overskrift: 'Ny melding fra nettsiden',
    ingress: 'Sendt fra kontaktskjemaet på malerdelius.no',
    smakebit: d.melding,
    rader,
    melding: d.melding,
    navn: d.navn,
    epost: d.epost,
  })
}

/** Tilbudsskjemaet (/tilbud): flere felt, og bildene som vedlegg. */
function tilbudEpost(d: {
  navn: string
  epost: string
  telefon: string
  adresse: string
  areal: string
  tidspunkt: string
  jobbtyper: string[]
  melding: string
  antallBilder: number
  samtykkeTid: string
}) {
  const ikkeOppgitt = 'Ikke oppgitt'
  const bilder =
    d.antallBilder === 0
      ? 'Ingen'
      : d.antallBilder === 1
        ? '1 bilde vedlagt'
        : `${d.antallBilder} bilder vedlagt`
  const rader: Rad[] = [
    { etikett: 'Navn', tekst: d.navn },
    d.telefon
      ? { etikett: 'Telefon', tekst: d.telefon, html: telefonLenke(d.telefon) }
      : { etikett: 'Telefon', tekst: ikkeOppgitt },
    d.epost
      ? { etikett: 'E-post', tekst: d.epost, html: epostLenke(d.epost) }
      : { etikett: 'E-post', tekst: ikkeOppgitt },
    { etikett: 'Adresse', tekst: d.adresse },
    { etikett: 'Type jobb', tekst: d.jobbtyper.join(', ') || ikkeOppgitt },
    // Kunden skriver enheten selv i det nye skjemaet, så teksten står som den er
    { etikett: 'Areal', tekst: d.areal || ikkeOppgitt },
    { etikett: 'Ønsket oppstart', tekst: d.tidspunkt || ikkeOppgitt },
    { etikett: 'Bilder', tekst: bilder },
    // Dokumentasjon: kunden krysset av for personvernerklæringen før sending
    { etikett: 'Personvern', tekst: `Godtatt${d.samtykkeTid ? ` ${samtykkeTidspunkt(d.samtykkeTid)}` : ''}` },
  ]
  const smakebit = [d.jobbtyper.join(', '), d.adresse].filter(Boolean).join(' · ')
  return byggEpost({
    emne: `Ny tilbudsforespørsel fra malerdelius.no – ${d.navn}`,
    overskrift: 'Ny tilbudsforespørsel',
    ingress: 'Sendt fra tilbudsskjemaet på malerdelius.no',
    smakebit,
    rader,
    melding: d.melding || 'Kunden skrev ingen beskrivelse.',
    navn: d.navn,
    epost: d.epost,
    telefon: d.telefon,
  })
}

type Epost = {
  emne: string
  overskrift: string
  ingress: string
  smakebit: string
  rader: Rad[]
  melding: string
  navn: string
  /** Tom når kunden bare oppga telefon (tilbudsskjemaet). */
  epost: string
  telefon?: string
}

function byggEpost(d: Epost) {
  const tekst = [
    d.overskrift,
    d.ingress,
    '',
    ...d.rader.map((r) => `${r.etikett}: ${r.tekst}`),
    '',
    d.melding,
    '',
    d.epost
      ? 'Svar på denne e-posten for å svare kunden direkte.'
      : `Kunden oppga bare telefon: ring ${d.telefon ?? ''}.`,
  ].join('\n')

  return { emne: d.emne, tekst, html: epostHtml(d) }
}

/**
 * Selve e-posten. Tabell-layout med all stil rett på elementene, slik
 * e-postklienter vil ha det. Fargene er designets egne: marineblå #022269,
 * gull #ffc717, krem #fef5e9 (se `src/lib/theme.ts`).
 */
export function epostHtml(d: Omit<Epost, 'emne'>) {
  const base = bildeBase()
  const fornavn = esc(d.navn.split(/\s+/)[0] || d.navn)
  const svarEmne = encodeURIComponent('Sv: Henvendelsen din til Maler Delius')
  // RFC 6068 tillater prosentkodet adresse i mailto, og kodingen hindrer at
  // tegn som ?/&/% i adressen tolkes som egne parametre i lenken.
  const epostHref = encodeURIComponent(d.epost)
  // Uten e-post går knappen til telefonen i stedet (nummeret er alt kontrollert)
  const telSifre = (d.telefon ?? '').replace(/[\s().-]/g, '')
  const knappHref = d.epost
    ? `mailto:${epostHref}?subject=${svarEmne}`
    : /^\+?\d{8,15}$/.test(telSifre)
      ? `tel:${telSifre}`
      : ''
  const knappTekst = d.epost ? `Svar til ${fornavn}` : `Ring ${fornavn}`
  const bunntekst = d.epost
    ? `Trykk «Svar» i e-posten for å svare ${fornavn} direkte.`
    : `${fornavn} oppga bare telefon: ${esc(d.telefon ?? '')}.`
  const skrift = "'Montserrat', Helvetica, Arial, sans-serif"
  // Forhåndsvisningen kuttes på hele tegn (ikke midt i et emoji-par).
  const smakebit = esc([...d.smakebit].slice(0, 140).join(''))
  // Outlook for Windows forstår ikke white-space:pre-wrap, så linjeskiftene
  // legges inn som <br> etter at teksten er escapet.
  const meldingHtml = esc(d.melding).replace(/\r?\n/g, '<br>')

  const rad = (r: Rad) => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #eef1f9;font-family:${skrift};font-size:11px;letter-spacing:1.5px;color:#8b93b8;text-transform:uppercase;white-space:nowrap;vertical-align:top;">${esc(r.etikett)}</td>
      <td align="right" style="padding:11px 0 11px 24px;border-bottom:1px solid #eef1f9;font-family:${skrift};font-size:15px;font-weight:600;color:#022269;word-break:break-word;">${r.html ?? esc(r.tekst)}</td>
    </tr>`

  return `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(d.overskrift)}</title>
</head>
<body style="margin:0;padding:0;background-color:#fef5e9;">
  <!-- Forhåndsvisningen i innboksen: begynnelsen av meldingen, ikke overskriften -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${smakebit}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fef5e9;">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;">

          <!-- Kortet -->
          <tr>
            <td style="background-color:#ffffff;border-radius:28px;">

              <!-- Akvarellsølet fra designet -->
              <img src="${base}/epost/splash.jpg" width="600" alt=""
                   style="display:block;width:100%;height:auto;border:0;border-radius:28px 28px 0 0;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:6px 48px 0;">
                    <img src="${base}/epost/logo.png" width="230" alt="Maler Delius AS"
                         style="display:block;width:230px;height:auto;border:0;">
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:26px 48px 8px;font-family:${skrift};font-size:23px;line-height:30px;font-weight:700;color:#022269;">
                    ${esc(d.overskrift)}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 48px 26px;font-family:${skrift};font-size:14px;line-height:21px;color:#8b93b8;">
                    ${esc(d.ingress)}
                  </td>
                </tr>

                <!-- Hvem det er fra, og hva det gjelder -->
                <tr>
                  <td style="padding:0 48px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #eef1f9;">
                      ${d.rader.map(rad).join('')}
                    </table>
                  </td>
                </tr>

                <!-- Meldingen -->
                <tr>
                  <td style="padding:26px 48px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#fef5e9;border-radius:18px;padding:22px 26px;font-family:${skrift};font-size:15px;line-height:26px;color:#022269;word-break:break-word;">${meldingHtml}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Den gule knappen fra designet -->
                <tr>
                  <td align="center" style="padding:30px 48px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background-color:#ffc717;border-radius:65px;mso-padding-alt:17px 46px;">
                          <a href="${knappHref}"
                             style="display:inline-block;padding:17px 46px;font-family:${skrift};font-size:16px;font-weight:700;color:#002f96;text-decoration:none;border-radius:65px;">
                            ${knappTekst}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Marineblå bunn, som footeren på siden -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#022269;border-radius:0 0 28px 28px;padding:26px 48px;">
                    <div style="font-family:${skrift};font-size:15px;font-weight:700;color:#ffffff;padding-bottom:6px;">Maler Delius AS</div>
                    <div style="font-family:${skrift};font-size:12.5px;line-height:20px;color:#c6cfec;">
                      Ullevålsveien 76, 0454 Oslo &nbsp;·&nbsp; Org.nr. 934 409 256<br>
                      <a href="https://malerdelius.no" style="color:#ffc300;text-decoration:none;">malerdelius.no</a>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Under kortet -->
          <tr>
            <td align="center" style="padding:22px 12px 0;font-family:${skrift};font-size:12px;line-height:19px;color:#a9aec9;">
              Mottatt ${mottatt()} &nbsp;·&nbsp; ${bunntekst}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
