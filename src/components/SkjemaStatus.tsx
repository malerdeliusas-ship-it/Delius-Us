/**
 * Beskjeden under kontaktskjemaet: grønn kvittering med tegnet hake når
 * meldingen er sendt, rød boks når noe må rettes. Animasjonene ligger i
 * index.css (skjema-inn, hake-sirkel, hake-strek).
 */
export default function SkjemaStatus({
  type,
  tekst,
}: {
  type: 'ok' | 'feil'
  tekst?: string
}) {
  if (type === 'ok') {
    return (
      <div className="skjema-status skjema-status--ok" role="status">
        <svg className="skjema-hake" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
          <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path
            d="M8.5 14.5l3.6 3.6 7-7.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <strong>Meldingen ble sendt!</strong>
          Takk for henvendelsen. Vi kommer tilbake til deg så snart som mulig.
        </div>
      </div>
    )
  }

  return (
    <div className="skjema-status skjema-status--feil" role="alert">
      <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
        <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M14 8.5v7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="14" cy="19.2" r="1.5" fill="currentColor" />
      </svg>
      <div>{tekst}</div>
    </div>
  )
}
