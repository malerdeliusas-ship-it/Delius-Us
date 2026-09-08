/**
 * Liten filtjener for `dist/`, til lokal kontroll. Den oppfører seg som
 * Vercel: `/kontakt` hentes fra `dist/kontakt/index.html` hvis den finnes,
 * ellers faller den tilbake til `dist/index.html` slik enkeltsideappen
 * krever. `vite preview` finner ikke mappene uten skråstrek på slutten, og
 * da blir ferdigrendringen usynlig når man måler.
 *
 *   node tools/vis.mjs [port]
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, brotliCompressSync, constants } from 'node:zlib'

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const PORT = Number(process.argv[2] || 4190)

const TYPER = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
}

const finnes = (p) => existsSync(p) && statSync(p).isFile()

/** Det Vercel komprimerer. Bilder, lyd og skrift er komprimert fra før. */
const KOMPRIMERES = new Set(['.html', '.js', '.css', '.json', '.xml', '.txt', '.svg'])

createServer((req, res) => {
  const sti = decodeURIComponent((req.url || '/').split('?')[0])
  const kandidater = [join(DIST, sti), join(DIST, sti, 'index.html'), join(DIST, sti + '.html')]
  const fil = kandidater.find(finnes) || join(DIST, 'index.html')
  const type = TYPER[extname(fil)] || 'application/octet-stream'
  res.setHeader('Content-Type', type)
  if (fil.includes('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

  let kropp = readFileSync(fil)
  // Uten dette måler man noe helt annet enn det Vercel faktisk sender.
  if (KOMPRIMERES.has(extname(fil))) {
    const godtar = String(req.headers['accept-encoding'] || '')
    if (godtar.includes('br')) {
      kropp = brotliCompressSync(kropp, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
      res.setHeader('Content-Encoding', 'br')
    } else if (godtar.includes('gzip')) {
      kropp = gzipSync(kropp)
      res.setHeader('Content-Encoding', 'gzip')
    }
    res.setHeader('Vary', 'Accept-Encoding')
  }
  res.end(kropp)
}).listen(PORT, () => console.log(`dist/ ligger på http://localhost:${PORT}`))
