/**
 * Lager ferdige HTML-filer for hver side, kjøres etter `vite build` og
 * `tools/etterbygg.mjs`.
 *
 * Problemet: nettstedet bygges i nettleseren. Bildet øverst er lastet ned
 * etter et par hundredeler, men kan ikke tegnes før JavaScript har kjørt
 * ferdig, og det er nesten hele ventetiden en besøkende på mobil opplever.
 *
 * Løsningen: her rendres hver side én gang i en usynlig nettleser på 390
 * piksler bredde, og det som er synlig i det første skjermbildet legges rett
 * inn i HTML-en, inne i `#root`. Telefonen har da tekst og bilde å tegne med
 * én gang. Når React starter, tømmer `createRoot` beholderen og setter inn
 * den ekte siden – skallet forsvinner av seg selv.
 *
 * Bare mobilutgaven lages. Desktop bygger sin egen side ut fra skjermbredden,
 * og skallet skjules der med en mediespørring (se `#skall` i index.css).
 * Desktopsidene er uansett raske nok.
 *
 * Titler, beskrivelser og kanoniske adresser hentes fra den rendrede siden,
 * så de står ferdig i HTML-en for søkemotorer som ikke kjører JavaScript.
 */
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const PORT = 4199
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// Hos Vercel (Linux) finnes ikke Chrome på denne stien. Da hoppes
// forhåndsrendringen over: nettstedet virker akkurat like godt uten, det
// tar bare noen tideler lenger før mobilen får tegnet første skjermbilde.
// Uten denne sjekken ville hele byggingen stoppet der.
if (!existsSync(CHROME)) {
  console.log('forhaandsrender: fant ikke Chrome, hopper over (nettstedet bygges uten skall)')
  process.exit(0)
}
const CDP = 9450
/** Hvor langt ned vi tar med. Litt mer enn en skjermhøyde, med margin. */
const KUTT = 1200

/**
 * Rutene som får sin egen fil. Bloggartikler er dynamiske og står utenfor.
 *
 * Filene legges som `<rute>/index.html`. Både `vite preview` og Vercel
 * serverer dem da rett på adressen, uten at det trengs en eneste linje
 * oppsett: Vercel sjekker filene før rewrite-regelen i vercel.json.
 */
const RUTER = [
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
]

const TYPER = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.m4a': 'audio/mp4',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
}

const mal = readFileSync(join(DIST, 'index.html'), 'utf8')

const tjener = createServer((req, res) => {
  const sti = decodeURIComponent((req.url || '/').split('?')[0])
  let fil = join(DIST, sti)
  if (!existsSync(fil) || statSync(fil).isDirectory()) fil = join(DIST, 'index.html')
  res.setHeader('Content-Type', TYPER[extname(fil)] || 'application/octet-stream')
  res.end(readFileSync(fil))
})
await new Promise((r) => tjener.listen(PORT, r))

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${CDP}`,
    '--window-size=800,1000',
    '--user-data-dir=/tmp/md-forhaandsrender',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

const sov = (ms) => new Promise((r) => setTimeout(r, ms))
let liste
for (let i = 0; i < 80; i++) {
  try {
    liste = await (await fetch(`http://127.0.0.1:${CDP}/json/list`)).json()
    break
  } catch {
    await sov(250)
  }
}
const ws = new WebSocket(liste.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))

let nr = 0
const venter = new Map()
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && venter.has(m.id)) {
    venter.get(m.id)(m)
    venter.delete(m.id)
  }
})
const send = (metode, params = {}) =>
  new Promise((r) => {
    const n = ++nr
    venter.set(n, r)
    ws.send(JSON.stringify({ id: n, method: metode, params }))
  })
const kjor = async (uttrykk) => {
  const r = await send('Runtime.evaluate', {
    expression: uttrykk,
    awaitPromise: true,
    returnByValue: true,
  })
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400))
  return r.result.result.value
}

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 900,
  deviceScaleFactor: 1,
  mobile: true,
})

/**
 * Kjøres inne i siden: fjern alt som ligger under første skjermbilde, og alt
 * som ikke hører hjemme i et skall (rammer, lyd, skjulte felt), og gi
 * tilbake det som er igjen.
 */
const HENT_SKALL = (kutt) => `(() => {
  const rot = document.getElementById('root')
  if (!rot) return null
  for (const el of [...rot.querySelectorAll('iframe, audio, script, .musikk, .honning, .samtykke')]) el.remove()
  const fjern = []
  const gaa = (n) => {
    for (const b of [...n.children]) {
      const r = b.getBoundingClientRect()
      if (r.top > ${kutt}) { fjern.push(b); continue }
      if (r.bottom > ${kutt}) gaa(b)
    }
  }
  gaa(rot)
  for (const el of fjern) el.remove()
  // Skjemafelt i et skall skal ikke kunne skrives i før React tar over
  for (const el of [...rot.querySelectorAll('input, textarea, button, select')]) {
    el.setAttribute('tabindex', '-1')
    el.setAttribute('aria-hidden', 'true')
  }
  return {
    html: rot.innerHTML,
    tittel: document.title,
    beskrivelse: document.querySelector('meta[name=description]')?.content || '',
    kanonisk: document.querySelector('link[rel=canonical]')?.href || '',
  }
})()`

const rapport = []
for (const rute of RUTER) {
  await send('Page.navigate', { url: `http://localhost:${PORT}${rute}` })
  await sov(2600)
  await kjor(`(async () => { try { await document.fonts.ready } catch {} ; return 1 })()`)
  await sov(400)
  const data = await kjor(HENT_SKALL(KUTT))
  if (!data || !data.html) {
    console.warn(`forhaandsrender: ${rute} ga ingenting, hopper over`)
    continue
  }

  let html = mal
  // Skallet inn i #root. `display: contents` gjør at wrapperen ikke endrer
  // noe layoutmessig; mediespørringen i index.css skjuler den på desktop.
  html = html.replace('<div id="root"></div>', `<div id="root"><div id="skall">${data.html}</div></div>`)
  if (data.tittel) html = html.replace(/<title>[^<]*<\/title>/, `<title>${data.tittel}</title>`)
  if (data.beskrivelse) {
    // Taggen står over flere linjer i index.html, derfor [\s\S]
    html = html.replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${data.beskrivelse.replace(/"/g, '&quot;')}" />`,
    )
  }
  if (data.kanonisk) {
    const kanon = `<link rel="canonical" href="${data.kanonisk}" />`
    html = html.replace('</head>', `    ${kanon}\n  </head>`)
  }
  const mappe = rute === '/' ? DIST : join(DIST, rute)
  if (rute !== '/') mkdirSync(mappe, { recursive: true })
  writeFileSync(join(mappe, 'index.html'), html)
  rapport.push(`${rute} (${Math.round(data.html.length / 1024)} kB)`)
}

console.log('forhaandsrender:', rapport.join(', '))

ws.close()
chrome.kill()
tjener.close()
process.exit(0)
