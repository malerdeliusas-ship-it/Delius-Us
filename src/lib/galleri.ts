import { useEffect, useState } from 'react'
import { supabase } from './supabase'

import f06530 from '../assets/figma/portefolje-dsc06530-1.jpg'
import f06515 from '../assets/figma/portefolje-dsc06515-1.jpg'
import f06535 from '../assets/figma/portefolje-dsc06535-1.jpg'
import f05791 from '../assets/figma/portefolje-dsc05791-1.jpg'
import f07386 from '../assets/figma/portefolje-dsc07386-1.jpg'
import f07295 from '../assets/figma/portefolje-dsc07295-1.jpg'
import f05793 from '../assets/figma/portefolje-dsc05793-1.jpg'
import f05812 from '../assets/figma/portefolje-dsc05812-1.jpg'
import f05797 from '../assets/figma/portefolje-dsc05797-1.jpg'
import f02723 from '../assets/figma/portefolje-dsc02723-1.jpg'
import f02756 from '../assets/figma/portefolje-dsc02756-1.jpg'
import f02672 from '../assets/figma/portefolje-dsc02672-1.jpg'
import f02620 from '../assets/figma/portefolje-dsc02620-1.jpg'

/**
 * Galleriet på Portefølje-siden: tretten faste bildeplasser. Originalbildene
 * fra designet er bygd inn i nettstedet; admin-panelet kan bytte ut hvert
 * enkelt av dem, og da lagres en rad i galleri_bilder med plass-nøkkelen og
 * adressen til det nye bildet. Uten rad vises originalen – databasen nede
 * eller tom betyr bare at nettstedet ser ut som før.
 *
 * `pos` er plassen bildet har på desktopsiden (1430px-designet). Selve siden
 * bruker sine egne, håndskrevne koordinater i Portefolje.tsx; disse tallene
 * er de samme, og brukes av admin-panelet til å tegne siden i miniatyr så
 * man ser nøyaktig hvilket bilde man bytter.
 */
export type GalleriPlass = {
  plass: string
  navn: string
  original: string
  pos: { l: number; t: number; w: number; h: number; r: number }
}

export const GALLERI: GalleriPlass[] = [
  { plass: 'pf-1', navn: 'Rom klart til maling', original: f06530, pos: { l: 119, t: 454, w: 315, h: 472, r: 67 } },
  { plass: 'pf-2', navn: 'Malt rom med lyst tak', original: f06515, pos: { l: 495, t: 454, w: 440, h: 227, r: 67 } },
  { plass: 'pf-3', navn: 'Nymalt rom', original: f06535, pos: { l: 495, t: 717, w: 391, h: 209, r: 67 } },
  { plass: 'pf-4', navn: 'Rom under oppussing', original: f05791, pos: { l: 598, t: 1086, w: 305, h: 453, r: 67 } },
  { plass: 'pf-5', navn: 'Ferdig malt rom', original: f07386, pos: { l: 935, t: 1022, w: 375, h: 556, r: 57 } },
  { plass: 'pf-6', navn: 'Malt stue', original: f07295, pos: { l: 119, t: 1648, w: 510, h: 287, r: 67 } },
  { plass: 'pf-7', navn: 'Restaurert murvegg', original: f05793, pos: { l: 659, t: 1648, w: 219, h: 324, r: 67 } },
  { plass: 'pf-8', navn: 'Takdetalj etter restaurering', original: f05812, pos: { l: 119, t: 1954, w: 412, h: 232, r: 67 } },
  { plass: 'pf-9', navn: 'Detalj av takliste', original: f05797, pos: { l: 552, t: 2025, w: 326, h: 159, r: 67 } },
  { plass: 'pf-10', navn: 'Malingsprøver på vegg', original: f02723, pos: { l: 699, t: 2310, w: 204, h: 306, r: 67 } },
  { plass: 'pf-11', navn: 'Malerarbeid i gang', original: f02756, pos: { l: 936, t: 2287, w: 375, h: 563, r: 67 } },
  { plass: 'pf-12', navn: 'Malingsspann og verktøy', original: f02672, pos: { l: 597, t: 2650, w: 306, h: 186, r: 67 } },
  { plass: 'pf-13', navn: 'Skilt på byggeplass', original: f02620, pos: { l: 119, t: 2985, w: 536, h: 326, r: 67 } },
]

/* Overstyringene hentes én gang og deles av alle sidene. */
let hentet: Record<string, string> | null = null
let henting: Promise<Record<string, string>> | null = null

async function hentOverstyringer(): Promise<Record<string, string>> {
  if (hentet) return hentet
  if (!henting) {
    henting = (async () => {
      const kart: Record<string, string> = {}
      if (!supabase) {
        hentet = kart
        return kart
      }
      try {
        const { data, error } = await supabase.from('galleri_bilder').select('plass, bilde_url')
        if (error) {
          // Et mislykket forsøk skal ikke huskes: da ville originalbildene
          // blitt låst for resten av besøket, også etter at nettet er
          // tilbake. Neste side som spør, prøver på nytt.
          henting = null
          return kart
        }
        for (const rad of data ?? []) kart[rad.plass] = rad.bilde_url
      } catch {
        henting = null
        return kart
      }
      hentet = kart
      return kart
    })()
  }
  return henting
}

/** Admin-panelet kaller denne etter endringer, så sidene henter på nytt. */
export function glemGalleriBufferen() {
  hentet = null
  henting = null
}

/**
 * Gir en oppslagsfunksjon: overstyrt bildeadresse for plassen, eller null
 * når originalen skal brukes. Før svaret fra databasen er inne vises
 * originalene – de ligger jo allerede klare i bunten.
 */
export function useGalleri(): (plass: string) => string | null {
  const [kart, setKart] = useState<Record<string, string>>(hentet ?? {})

  useEffect(() => {
    let aktiv = true
    void hentOverstyringer().then((k) => {
      if (aktiv) setKart(k)
    })
    return () => {
      aktiv = false
    }
  }, [])

  return (plass) => kart[plass] ?? null
}
