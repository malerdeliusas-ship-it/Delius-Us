import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { DESIGN_WIDTH } from '../lib/theme'

/**
 * Skalerer 1430px-designet slik at det passer skjermbredden.
 * Bruker CSS `zoom` slik at layout/scroll flyter naturlig og siden
 * blir pikselidentisk med Figma-designet på alle skjermer.
 *
 * Startverdien regnes ut synkront og korrigeres i useLayoutEffect,
 * slik at aller første frame allerede er riktig skalert (ingen
 * blink/hopp ved lasting eller sidebytte).
 */
export default function Stage({ height, children }: { height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(() =>
    typeof document === 'undefined'
      ? 1
      : document.documentElement.clientWidth / DESIGN_WIDTH
  )

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // fyll alltid hele bredden (skaler opp/ned) slik at det ikke blir hvit marg
    const update = () => setZoom(el.clientWidth / DESIGN_WIDTH)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div ref={ref} className="stage-viewport">
      <div className="stage" style={{ height, zoom }}>
        {children}
      </div>
    </div>
  )
}
