import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Ruller til toppen ved hvert sidebytte. */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}
