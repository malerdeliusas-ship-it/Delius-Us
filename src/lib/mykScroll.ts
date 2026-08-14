import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Myk rulling. Mushjul i Chrome på macOS/Windows hopper i harde trinn;
 * Lenis glatter det ut med en kort interpolering, så siden glir i stedet
 * for å rykke. Pekeplate og berøring røres ikke – de er allerede myke og
 * beholder sin native fysikk. Slås helt av for folk som har bedt om
 * mindre bevegelse.
 */

let lenis: Lenis | null = null

export function useMykScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    lenis = new Lenis({
      autoRaf: true,
      // kort og lett: glir, men henger ikke etter hjulet
      lerp: 0.14,
    })

    return () => {
      lenis?.destroy()
      lenis = null
    }
  }, [])
}

/** Hopp rett til toppen (ved sidebytte), uten animasjon og uten drakamp. */
export function tilToppen() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
}
