import { useEffect } from 'react'
import { aktiver, deaktiver, useMusikk, veksle } from '../lib/musikk'

/**
 * Den lille runde knappen nede i hjørnet som skrur bakgrunnsmusikken av og
 * på. Tre små stolper danser når musikken faktisk spiller, står stille mens
 * vi venter på første berøring, og høyttaleren får en strek over seg når
 * besøkeren har skrudd den av. Logikken ligger i `src/lib/musikk.ts`.
 */
export default function Musikk() {
  const tilstand = useMusikk()

  useEffect(() => {
    aktiver()
    return deaktiver
  }, [])

  const paa = tilstand !== 'av'
  const klasse = ['musikk', tilstand === 'spiller' && 'musikk--spiller', !paa && 'musikk--av']
    .filter(Boolean)
    .join(' ')
  // Mens vi venter på første berøring, starter et trykk på knappen musikken
  const tekst =
    tilstand === 'spiller'
      ? 'Skru av musikken'
      : tilstand === 'venter'
        ? 'Start musikken'
        : 'Skru på musikken'

  return (
    <button
      type="button"
      className={klasse}
      onClick={veksle}
      aria-pressed={tilstand === 'spiller'}
      aria-label={tekst}
      title={tekst}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        {/* høyttaleren */}
        <path d="M3.5 9.2v5.6h3.4l4.3 3.6V5.6L6.9 9.2H3.5z" fill="currentColor" />
        {paa ? (
          <g fill="currentColor">
            <rect className="musikk-stolpe" x="14" y="6" width="2" height="12" rx="1" />
            <rect className="musikk-stolpe musikk-stolpe--2" x="17.4" y="6" width="2" height="12" rx="1" />
            <rect className="musikk-stolpe musikk-stolpe--3" x="20.8" y="6" width="2" height="12" rx="1" />
          </g>
        ) : (
          <path
            d="M15 9.5l5 5m0-5l-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </button>
  )
}
