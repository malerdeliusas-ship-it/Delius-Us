/**
 * Nettstedskartet, satt sammen når det spørres etter.
 *
 * De faste sidene endrer seg sjelden, men blogginnleggene ligger i databasen
 * og kommer til etter hvert. Et kart som ligger som en ferdig fil på disk vil
 * derfor alltid mangle de nyeste innleggene, og da finner søkemotorene dem
 * bare hvis de tilfeldigvis følger en lenke. Her hentes innleggene i stedet
 * idet kartet spørres etter.
 *
 * Går databasen ned, svarer vi med de faste sidene i stedet for en feil:
 * et kart uten blogginnlegg er mye bedre enn ingen kart.
 */

type Req = { method?: string }
type Res = {
  status: (kode: number) => Res
  send: (kropp: string) => void
  setHeader: (navn: string, verdi: string) => void
}

const BASE = 'https://www.malerdelius.no'

const FASTE: Array<[sti: string, prioritet: string]> = [
  ['/', '1.0'],
  ['/malertjenester', '0.9'],
  ['/portefolje', '0.8'],
  ['/om-oss', '0.7'],
  ['/kontakt', '0.7'],
  ['/blogg', '0.6'],
  ['/personvern', '0.2'],
]

/** &, <, > og hermetegn må kodes, ellers blir XML-en ugyldig. */
function xml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function hentInnlegg(): Promise<Array<{ slug: string; endret: string | null }>> {
  const base = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const nokkel = process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !nokkel) return []

  const avbryt = new AbortController()
  const frist = setTimeout(() => avbryt.abort(), 4000)
  try {
    const svar = await fetch(
      `${base}/rest/v1/blogg_innlegg?select=slug,oppdatert&publisert=eq.true&order=publisert_dato.desc.nullslast`,
      {
        headers: { apikey: nokkel, Authorization: `Bearer ${nokkel}` },
        signal: avbryt.signal,
      },
    )
    if (!svar.ok) return []
    const rader = (await svar.json()) as Array<{ slug?: unknown; oppdatert?: unknown }>
    return rader
      .filter((r) => typeof r.slug === 'string' && /^[a-z0-9-]{1,120}$/.test(r.slug))
      .map((r) => ({
        slug: r.slug as string,
        endret: typeof r.oppdatert === 'string' ? r.oppdatert.slice(0, 10) : null,
      }))
  } catch {
    return []
  } finally {
    clearTimeout(frist)
  }
}

export default async function handler(_req: Req, res: Res) {
  const innlegg = await hentInnlegg()

  const linjer = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...FASTE.map(
      ([sti, pri]) => `  <url><loc>${BASE}${sti}</loc><priority>${pri}</priority></url>`,
    ),
    ...innlegg.map(
      (i) =>
        `  <url><loc>${BASE}/blogg/${xml(i.slug)}</loc>` +
        (i.endret ? `<lastmod>${xml(i.endret)}</lastmod>` : '') +
        '<priority>0.5</priority></url>',
    ),
    '</urlset>',
  ]

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  // Ett døgn i kanten: søkemotorer henter kartet ofte, og innleggene haster ikke.
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800')
  return res.status(200).send(linjer.join('\n'))
}
