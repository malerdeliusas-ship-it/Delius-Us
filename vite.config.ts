import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/**
 * I produksjon kjører `api/kontakt.ts` som serverfunksjon hos Vercel.
 * Vite-utviklingsserveren kjenner ikke til `/api`, så her kobles den samme
 * funksjonen inn som mellomvare. Da oppfører skjemaet seg likt lokalt.
 * Legg nøklene i en `.env`-fil (se `.env.example`) før du prøver lokalt.
 */
function apiIUtvikling(): Plugin {
  return {
    name: 'malerdelius-api-i-utvikling',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/sitemap.xml', async (_req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/sitemap.ts')
        await handler(
          {},
          {
            setHeader: (navn: string, verdi: string) => res.setHeader(navn, verdi),
            status(kode: number) {
              res.statusCode = kode
              return this
            },
            send(kropp: string) {
              res.end(kropp)
            },
          },
        )
      })

      server.middlewares.use('/api/kontakt', async (req, res) => {
        const biter: Buffer[] = []
        for await (const bit of req) biter.push(bit as Buffer)

        const { default: handler } = await server.ssrLoadModule('/api/kontakt.ts')

        await handler(
          { method: req.method, headers: req.headers, body: Buffer.concat(biter).toString() },
          {
            setHeader: (navn: string, verdi: string) => res.setHeader(navn, verdi),
            status(kode: number) {
              res.statusCode = kode
              return this
            },
            json(kropp: unknown) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(kropp))
            },
          },
        )
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiIUtvikling()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
