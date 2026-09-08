/**
 * Kjøres etter `vite build`.
 *
 * 1. Stilarket legges rett inn i HTML-en. Filen er rundt 18 kB (under 4 kB
 *    pakket), og å hente den er en egen tur til serveren som blokkerer den
 *    første tegningen av siden. Lagt inn i dokumentet er den der med én gang.
 * 2. Bildet som er størst øverst på mobilsiden hentes med `preload`, så
 *    nedlastingen starter før JavaScript i det hele tatt har kjørt.
 *
 * Skriptet endrer bare `dist/`. Kildekoden røres ikke.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath, ikke .pathname: mappa kan ha mellomrom i navnet, og da
// kommer stien tilbake med %20 og ingenting blir funnet.
const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const html0 = readFileSync(join(DIST, 'index.html'), 'utf8')
let html = html0

/* ---------- 1. Stilarket inn i dokumentet ---------- */
const stilLenke = /<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/
const treff = html.match(stilLenke)
if (!treff) {
  console.warn('etterbygg: fant ikke stilarket, hopper over innlegging')
} else {
  const css = readFileSync(join(DIST, treff[1].replace(/^\//, '')), 'utf8')
  html = html.replace(stilLenke, `<style>${css}</style>`)
  console.log(`etterbygg: la inn ${Math.round(css.length / 1024)} kB stil i HTML-en`)
}

/* ---------- 2. Forhåndshenting av mobilbildet øverst på forsiden ---------- */
const filer = readdirSync(join(DIST, 'assets'))
const hero = filer.find((f) => /^hero-echipa-mobil-.*\.webp$/.test(f))
if (hero) {
  // Bare på smale skjermer: på desktop er det et annet bilde, og det ligger
  // uansett bak en maske lenger nede i dokumentet.
  const lenke =
    `<link rel="preload" as="image" fetchpriority="high" ` +
    `media="(max-width: 999px)" href="/assets/${hero}" />`
  html = html.replace('</head>', `    ${lenke}\n  </head>`)
  console.log(`etterbygg: forhåndshenter ${hero} på mobil`)
}

if (html !== html0) writeFileSync(join(DIST, 'index.html'), html)
