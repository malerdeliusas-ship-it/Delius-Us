import { useEffect } from 'react'
import type Lenis from 'lenis'

/**
 * Myk rulling. Mushjul i Chrome på macOS/Windows hopper i harde trinn;
 * Lenis glatter det ut med en kort interpolering, så siden glir i stedet
 * for å rykke. Pekeplate og berøring røres ikke – de er allerede myke og
 * beholder sin native fysikk. Slås helt av for folk som har bedt om
 * mindre bevegelse.
 *
 * To ting for farten:
 *
 * - Biblioteket hentes med `import()` først når det skal brukes. Da ligger
 *   det ikke i hovedbunten, og ingen laster ned eller kjører kode for en
 *   finesse de ikke får.
 * - På berøringsskjerm hoppes det helt over. Der er rullingen native myk
 *   fra før, og Lenis rører uansett ikke berøring – den ville bare kostet
 *   oppstartstid på den enheten som har minst av den.
 */

let lenis: Lenis | null = null

/** Kjør `cb` når nettleseren har et ledig øyeblikk etter at siden er lastet. */
function naarLedig(cb: () => void) {
  const idle = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void })
    .requestIdleCallback
  const start = () => (idle ? idle(cb, { timeout: 3000 }) : setTimeout(cb, 800))
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}

export function useMykScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Ingen mus, ingen grunn: berøringsskjermer ruller mykt selv.
    if (window.matchMedia('(pointer: coarse)').matches) return

    let avbrutt = false
    naarLedig(() => {
      if (avbrutt) return
      void import('lenis').then(({ default: Lenis }) => {
        if (avbrutt) return
        // kort og lett: glir, men henger ikke etter hjulet
        lenis = new Lenis({ autoRaf: true, lerp: 0.14 })
      })
    })

    return () => {
      avbrutt = true
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
