import { C } from '../../lib/theme'
import { useKontaktSkjema, KVITTERING } from '../../lib/kontakt'

/** Kontaktskjemaet på mobil. Meldingen går til `/api/kontakt` og videre på e-post. */
export default function MobilSkjema({ knappFarge = C.goldAlt }: { knappFarge?: string }) {
  const { status, feil, send, merk, knappetekst } = useKontaktSkjema()

  return (
    <form style={{ display: 'grid', gap: 16 }} onSubmit={send} onInput={merk} noValidate>
      <input
        className="m-felt field"
        style={{ '--ph': 'rgba(2,3,105,0.46)' } as React.CSSProperties}
        type="text"
        name="navn"
        autoComplete="name"
        aria-label="Navn, etternavn"
        placeholder="Navn, etternavn"
      />
      <input
        className="m-felt field"
        style={{ '--ph': C.placeholder } as React.CSSProperties}
        type="email"
        name="epost"
        autoComplete="email"
        aria-label="E-mail"
        placeholder="E-mail"
      />
      <textarea
        className="m-felt m-felt--stor field"
        style={{ '--ph': C.placeholder } as React.CSSProperties}
        name="melding"
        aria-label="Melding"
        placeholder="Melding..."
      />

      {/* Honningkrukke: usynlig for folk, fylt ut av roboter. */}
      <input
        className="honning"
        type="text"
        name="firma"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <button
        type="submit"
        className="m-knapp m-knapp--blokk btn-press"
        disabled={status === 'sender'}
        style={{
          background: knappFarge,
          color: C.formText,
          opacity: status === 'sender' ? 0.75 : 1,
        }}
      >
        {knappetekst}
      </button>

      {status === 'sendt' && (
        <p className="m-skjemabeskjed" style={{ color: C.navy }} role="status">
          {KVITTERING}
        </p>
      )}
      {status === 'feil' && feil && (
        <p className="m-skjemabeskjed" style={{ color: '#b3261e' }} role="alert">
          {feil}
        </p>
      )}
    </form>
  )
}
