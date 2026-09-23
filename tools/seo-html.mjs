/**
 * Gir hver fast rute egen tittel, beskrivelse og kanonisk adresse i HTML-en.
 * Kjøres også på Vercel, der Chrome ikke finnes og mobilskallet ikke kan lages.
 * Ingen synlige elementer eller stiler endres.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const BASE = 'https://www.malerdelius.no'
const sider = JSON.parse(readFileSync(new URL('../src/lib/seo-sider.json', import.meta.url), 'utf8'))
const mal = readFileSync(join(DIST, 'index.html'), 'utf8')

const kod = (tekst) => String(tekst).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function bytt(html, uttrykk, verdi) {
  if (!uttrykk.test(html)) throw new Error(`SEO-tag mangler i index.html: ${uttrykk}`)
  return html.replace(uttrykk, verdi)
}

for (const [rute, side] of Object.entries(sider)) {
  const url = `${BASE}${rute}`
  let html = bytt(mal, /<title>[\s\S]*?<\/title>/, `<title>${kod(side.tittel)}</title>`)
  html = bytt(html, /<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${kod(side.beskrivelse)}" />`)
  html = bytt(html, /<meta\s+property="og:title"[^>]*\/>/, `<meta property="og:title" content="${kod(side.tittel)}" />`)
  html = bytt(html, /<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${kod(side.beskrivelse)}" />`)
  html = bytt(html, /<meta\s+property="og:url"[^>]*\/>/, `<meta property="og:url" content="${kod(url)}" />`)
  html = bytt(html, /<meta\s+name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${kod(side.tittel)}" />`)

  // Ukjente og dynamiske ruter får forsiden som SPA-fallback. En kanonisk
  // forsideadresse der ville feilaktig peke blogginnlegg tilbake til forsiden.
  if (rute !== '/') {
    html = html.replace('</head>', `    <link rel="canonical" href="${kod(url)}" />\n  </head>`)
  }

  const mappe = rute === '/' ? DIST : join(DIST, rute.slice(1))
  mkdirSync(mappe, { recursive: true })
  writeFileSync(join(mappe, 'index.html'), html)
}

console.log(`seo-html: metadata for ${Object.keys(sider).length} sider`)
