import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { tilToppen } from '../lib/mykScroll'

/** Ruller til toppen ved hvert sidebytte. */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    tilToppen()
  }, [pathname])
  return null
}
