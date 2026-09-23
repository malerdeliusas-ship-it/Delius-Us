import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import sider from './seo-sider.json'

/**
 * Faste ruter får metadata i HTML-en under bygging (seo-html.mjs). Her
 * oppdateres de samme verdiene når besøkeren bytter rute i nettleseren.
 */

const BASE = 'https://www.malerdelius.no'

const SIDER: Record<string, { tittel: string; beskrivelse: string }> = sider

/**
 * Ber søkemotorene la denne visningen være. Brukes når en bloggadresse ikke
 * finnes: siden svarer teknisk sett «alt i orden» (nettstedet er en SPA), og
 * uten dette ville hver skrivefeil blitt liggende som en egen tom side i
 * søkeresultatene.
 */
export function useIkkeIndekser(aktiv: boolean) {
  useEffect(() => {
    if (!aktiv) return
    const merke = document.createElement('meta')
    merke.name = 'robots'
    merke.content = 'noindex'
    document.head.appendChild(merke)
    return () => merke.remove()
  }, [aktiv])
}

/** Setter tittel og beskrivelse for ett blogginnlegg. */
export function useInnleggSeo(tittel?: string, beskrivelse?: string) {
  useEffect(() => {
    if (!tittel) return
    document.title = `${tittel} – Maler Delius AS`
    if (beskrivelse) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', beskrivelse.slice(0, 300))
    }
  }, [tittel, beskrivelse])
}

export default function useSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    // admin-panelet og sporingslenkene setter sine egne titler
    if (pathname.startsWith('/admin') || pathname.startsWith('/l/')) return

    // enkeltinnlegg starter med bloggens tittel; innlegget bytter den
    // selv når det er lastet
    const side =
      SIDER[pathname] ?? (pathname.startsWith('/blogg') ? SIDER['/blogg'] : SIDER['/'])

    document.title = side.tittel

    const beskrivelse = document.querySelector('meta[name="description"]')
    beskrivelse?.setAttribute('content', side.beskrivelse)

    let kanonisk = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!kanonisk) {
      kanonisk = document.createElement('link')
      kanonisk.rel = 'canonical'
      document.head.appendChild(kanonisk)
    }
    kanonisk.href = pathname === '/' ? `${BASE}/` : `${BASE}${pathname}`
  }, [pathname])
}
