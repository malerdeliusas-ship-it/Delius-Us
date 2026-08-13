import { useEffect, useState } from 'react'

/**
 * Designet fra Figma er tegnet for desktop (1430px). Over MOBILE_MAX vises
 * det 1:1 (skalert av `Stage`), under vises en egen mobil-layout med samme
 * farger, fonter, bilder og tekster.
 */
export const MOBILE_MAX = 1000

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isMobile
}
