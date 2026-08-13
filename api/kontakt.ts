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

/** Enkel bremse per IP. Lever bare så lenge instansen lever, men stopper de verste. */
const TAK = 5
const VINDU_MS = 10 * 60 * 1000
const sett = new Map<string, number[]>()

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ feil: 'Bruk POST' })
  }

  const kropp = (typeof req.body === 'string' ? tryggParse(req.body) : req.body) as
    | Record<string, unknown>
    | undefined

  const navn = tekst(kropp?.navn, 120)
  const epost = tekst(kropp?.epost, 200)
  const melding = tekst(kropp?.melding, 5000)
  const firma = tekst(kropp?.firma, 200)
  const apnet = Number(kropp?.apnet ?? 0)
  const side = tekst(kropp?.side, 100) || '/'

  // Honningkrukka er fylt ut, eller skjemaet ble sendt under to sekunder etter
  // at det ble tegnet. Begge deler betyr robot. Vi svarer OK og sender ingenting,
  // slik at roboten ikke lærer noe av svaret.
  if (firma || (apnet > 0 && apnet < 2000)) return res.status(200).json({ ok: true })

  if (!navn) return res.status(400).json({ feil: 'Navn mangler' })
  if (!EPOST_MONSTER.test(epost)) return res.status(400).json({ feil: 'Ugyldig e-post' })
  if (melding.length < 5) return res.status(400).json({ feil: 'Meldingen er for kort' })

  const ip = forsteVerdi(req.headers['x-forwarded-for']) ?? 'ukjent'
  if (forMange(ip)) return res.status(429).json({ feil: 'For mange forsøk. Prøv igjen senere.' })

  const nokkel = process.env.RESEND_API_KEY
  const til = (process.env.KONTAKT_TIL ?? '').split(',').map((a) => a.trim()).filter(Boolean)
  const fra = process.env.KONTAKT_FRA ?? 'Maler Delius <skjema@send.malerdelius.no>'

  if (!nokkel || til.length === 0) {
    console.error('Mangler RESEND_API_KEY eller KONTAKT_TIL')
    return res.status(500).json({ feil: 'Skjemaet er ikke ferdig satt opp' })
  }

  const emne = `Ny melding fra malerdelius.no – ${navn}`

  try {
    const svar = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${nokkel}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fra,
        to: til,
        // Svar-knappen i e-postklienten går rett til kunden.
        reply_to: epost,
        subject: emne,
        text: ren(navn, epost, melding, side),
        html: html(navn, epost, melding, side),
      }),
    })

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
  nylige.push(na)
  sett.set(ip, nylige)
  return nylige.length > TAK
}

function ren(navn: string, epost: string, melding: string, side: string) {
  return [
    `Navn:    ${navn}`,
    `E-post:  ${epost}`,
    `Side:    ${side}`,
    '',
    melding,
  ].join('\n')
}

function html(navn: string, epost: string, melding: string, side: string) {
  const e = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#022269">
  <h2 style="margin:0 0 16px;font-size:18px;color:#022269">Ny melding fra nettsiden</h2>
  <table cellpadding="0" cellspacing="0" style="margin-bottom:16px">
    <tr><td style="padding:2px 16px 2px 0;color:#6b7280">Navn</td><td><strong>${e(navn)}</strong></td></tr>
    <tr><td style="padding:2px 16px 2px 0;color:#6b7280">E-post</td><td><a href="mailto:${e(epost)}" style="color:#0051ff">${e(epost)}</a></td></tr>
    <tr><td style="padding:2px 16px 2px 0;color:#6b7280">Side</td><td>${e(side)}</td></tr>
  </table>
  <div style="white-space:pre-wrap;padding:16px;background:#fef5e9;border-radius:12px">${e(melding)}</div>
  <p style="margin-top:20px;font-size:13px;color:#6b7280">Svar på denne e-posten for å svare kunden direkte.</p>
</div>`
}
