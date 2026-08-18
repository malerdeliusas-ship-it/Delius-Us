/**
 * Serverfunksjon for kontaktskjemaene på malerdelius.no.
 *
 * Tar imot POST fra `src/lib/kontakt.ts` og sender meldingen videre på e-post
 * gjennom Resend (https://resend.com). Funksjonen kjører på Vercel; nøkler og
 * adresser står i miljøvariabler, ikke i koden:
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

const EPOST_MONSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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

/** Hvor lenge vi venter på Resend før vi gir opp. */
const SENDE_FRIST_MS = 10_000

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ feil: 'Bruk POST' })
  }

  // Skjemaet vårt sender alltid Origin, fordi det er en fetch fra samme
  // nettsted. Kommer det noe fra et annet opphav, er det en fremmed side som
  // sender på vegne av en besøkende, og da er det ikke en kunde som skriver.
  const opphav = forsteVerdi(req.headers.origin)
  if (opphav && !OPPHAV.some((m) => m.test(opphav))) {
    return res.status(403).json({ feil: 'Ugyldig opphav' })
  }

  const kropp = (typeof req.body === 'string' ? tryggParse(req.body) : req.body) as
    | Record<string, unknown>
    | undefined

  // Navn og side skal være én linje: kontrolltegn (deriblant \r\n) byttes med
  // mellomrom, så ingen kan smugle egne linjer inn i emnefeltet eller e-posten.
  const navn = enLinje(tekst(kropp?.navn, 120))
  const epost = tekst(kropp?.epost, 200)
  const melding = tekst(kropp?.melding, 5000)
  const krukke = tekst(kropp?.tilleggsinfo, 200)
  const apnet = Number(kropp?.apnet ?? 0)
  const side = enLinje(tekst(kropp?.side, 100)) || '/'

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
  if (!EPOST_MONSTER.test(epost)) return res.status(400).json({ feil: 'Ugyldig e-post' })
  if (melding.length < 5) return res.status(400).json({ feil: 'Meldingen er for kort' })

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
        // Svar-knappen i e-postklienten går rett til kunden.
        reply_to: epost,
        subject: `${mistenkt ? '[Mistenkt robot] ' : ''}Ny melding fra malerdelius.no – ${navn}`,
        text: epostTekst(navn, epost, melding, side),
        html: epostHtml(navn, epost, melding, side),
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

/** Bytter kontrolltegn (linjeskift, tab, osv.) med mellomrom. */
function enLinje(s: string) {
  return s.replace(/[\u0000-\u001f\u007f]/g, ' ').trim()
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

function epostTekst(navn: string, epost: string, melding: string, side: string) {
  return [
    'Ny melding fra kontaktskjemaet på malerdelius.no',
    '',
    `Navn:    ${navn}`,
    `E-post:  ${epost}`,
    `Side:    ${sidenavn(side)}`,
    '',
    melding,
    '',
    'Svar på denne e-posten for å svare kunden direkte.',
  ].join('\n')
}

/**
 * Selve e-posten. Tabell-layout med all stil rett på elementene, slik
 * e-postklienter vil ha det. Fargene er designets egne: marineblå #022269,
 * gull #ffc717, krem #fef5e9 (se `src/lib/theme.ts`).
 */
export function epostHtml(navn: string, epost: string, melding: string, side: string) {
  const base = bildeBase()
  const fornavn = esc(navn.split(/\s+/)[0] || navn)
  const svarEmne = encodeURIComponent('Sv: Henvendelsen din til Maler Delius')
  // RFC 6068 tillater prosentkodet adresse i mailto, og kodingen hindrer at
  // tegn som ?/&/% i adressen tolkes som egne parametre i lenken.
  const epostHref = encodeURIComponent(epost)
  const skrift = "'Montserrat', Helvetica, Arial, sans-serif"
  // Forhåndsvisningen kuttes på hele tegn (ikke midt i et emoji-par).
  const smakebit = esc([...melding].slice(0, 140).join(''))
  // Outlook for Windows forstår ikke white-space:pre-wrap, så linjeskiftene
  // legges inn som <br> etter at teksten er escapet.
  const meldingHtml = esc(melding).replace(/\r?\n/g, '<br>')

  const rad = (etikett: string, verdi: string) => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #eef1f9;font-family:${skrift};font-size:11px;letter-spacing:1.5px;color:#8b93b8;text-transform:uppercase;white-space:nowrap;vertical-align:top;">${etikett}</td>
      <td align="right" style="padding:11px 0 11px 24px;border-bottom:1px solid #eef1f9;font-family:${skrift};font-size:15px;font-weight:600;color:#022269;word-break:break-word;">${verdi}</td>
    </tr>`

  return `<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Ny melding fra malerdelius.no</title>
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
                    Ny melding fra nettsiden
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 48px 26px;font-family:${skrift};font-size:14px;line-height:21px;color:#8b93b8;">
                    Sendt fra kontaktskjemaet på malerdelius.no
                  </td>
                </tr>

                <!-- Hvem det er fra -->
                <tr>
                  <td style="padding:0 48px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #eef1f9;">
                      ${rad('Navn', esc(navn))}
                      ${rad('E-post', `<a href="mailto:${epostHref}" style="color:#0051ff;text-decoration:none;">${esc(epost)}</a>`)}
                      ${rad('Side', esc(sidenavn(side)))}
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
                          <a href="mailto:${epostHref}?subject=${svarEmne}"
                             style="display:inline-block;padding:17px 46px;font-family:${skrift};font-size:16px;font-weight:700;color:#002f96;text-decoration:none;border-radius:65px;">
                            Svar til ${fornavn}
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
              Mottatt ${mottatt()} &nbsp;·&nbsp; Trykk «Svar» i e-posten for å svare ${fornavn} direkte.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
