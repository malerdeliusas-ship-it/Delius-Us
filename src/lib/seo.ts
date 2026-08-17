import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Tittel, beskrivelse og kanonisk adresse per rute. Siden er en SPA, så
 * verdiene settes i nettleseren ved rutebytte – Google kjører JavaScript og
 * plukker dem opp, og fanen viser riktig navn når man deler eller bokmerker.
 */

const BASE = 'https://www.malerdelius.no'

const SIDER: Record<string, { tittel: string; beskrivelse: string }> = {
  '/': {
    tittel: 'Maler Delius AS – Profesjonell maling i Oslo',
    beskrivelse:
      'Maler Delius AS – profesjonelle maler- og reparasjonstjenester for hjem og bedrifter i Oslo. Bestill gratis befaring.',
  },
  '/om-oss': {
    tittel: 'Om oss – Maler Delius AS',
    beskrivelse:
      'Bli kjent med teamet i Maler Delius AS – erfarne malere i Oslo med sans for kvalitet, ryddighet og detaljer.',
  },
  '/portefolje': {
    tittel: 'Portefølje – Maler Delius AS',
    beskrivelse:
      'Se et utvalg av prosjektene våre: nymalte rom, fasader og oppussing utført av Maler Delius AS i Oslo.',
  },
  '/malertjenester': {
    tittel: 'Malertjenester i Oslo – Maler Delius AS',
    beskrivelse:
      'Innvendig og utvendig maling, reparasjon og sparkling, dekorative teknikker og fargevalg – se alle tjenestene våre.',
  },
  '/kontakt': {
    tittel: 'Kontakt oss – Maler Delius AS',
    beskrivelse:
      'Ta kontakt med Maler Delius AS for et uforpliktende tilbud eller gratis befaring i Oslo. Ring 966 93 780 eller send skjemaet.',
  },
  '/blogg': {
    tittel: 'Blogg – Maler Delius AS',
    beskrivelse:
      'Nytt fra Maler Delius AS: maletips, ferdige prosjekter og små glimt fra hverdagen til malerne våre i Oslo.',
  },
}

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
