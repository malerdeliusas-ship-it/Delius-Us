import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import Stage from './Stage'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import { Txt, CropImg } from './prim'
import { C } from '../lib/theme'
import splash from '../assets/figma/splash.webp'

/**
 * Ramme for bloggsidene på desktop. Bloggen har innhold med ukjent høyde
 * (Figma-sidene er tegnet med fast høyde), så her måles innholdet og
 * footeren legges der innholdet slutter. Alt annet – header, akvarellsølet
 * bak tittelen, footer – er nøyaktig de samme delene som på de andre sidene.
 */

/** Samme utsnitt av akvarellsølet som på Portefølje-siden. */
const TF_SPRUT: [[number, number, number], [number, number, number]] =
  [[0.9999397993087769, 0, 0.00003007479062944185], [0, 0.4989980161190033, 0]]

export default function BloggStage({
  tittel,
  children,
}: {
  tittel?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hoyde, setHoyde] = useState(1200)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const oppdater = () => setHoyde(Math.max(700, Math.ceil(el.scrollHeight)))
    oppdater()
    const ro = new ResizeObserver(oppdater)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <Stage height={hoyde + 244}>
      <div ref={ref} style={{ position: 'absolute', left: 0, top: 0, width: 1430 }}>
        <div style={{ position: 'relative', height: 345 }}>
          <CropImg
            src={splash}
            l={-6}
            t={96}
            w={1441}
            h={249}
            r={25}
            tf={TF_SPRUT}
            loading="eager"
          />
          {tittel && (
            <Txt as="h1" l={0} t={286} w={1430} size={40} weight={800} lh={60} color={C.navy} align="center">
              {tittel}
            </Txt>
          )}
        </div>
        {children}
      </div>
      <SiteHeader />
      <SiteFooter t={hoyde} />
    </Stage>
  )
}
