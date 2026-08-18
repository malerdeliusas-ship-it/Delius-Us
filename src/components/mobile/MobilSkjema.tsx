import { C } from '../../lib/theme'
import { useKontaktSkjema } from '../../lib/kontakt'
import SkjemaStatus from '../SkjemaStatus'

/** Kontaktskjemaet på mobil. Meldingen går til `/api/kontakt` og videre på e-post. */
export default function MobilSkjema({ knappFarge = C.goldAlt }: { knappFarge?: string }) {
  const { status, feil, feilFelt, send, merk, knappetekst } = useKontaktSkjema()

  const klasse = (navn: 'navn' | 'epost' | 'melding', ekstra = '') =>
    `m-felt ${ekstra} field${feilFelt === navn ? ' felt-feil' : ''}`

  return (
    <form style={{ display: 'grid', gap: 16 }} onSubmit={send} onInput={merk} noValidate>
      <input
        className={klasse('navn')}
        style={{ '--ph': 'rgba(2,3,105,0.46)' } as React.CSSProperties}
        type="text"
        name="navn"
        autoComplete="name"
        aria-label="Navn, etternavn"
        placeholder="Navn, etternavn"
      />
      <input
        className={klasse('epost')}
        style={{ '--ph': C.placeholder } as React.CSSProperties}
        type="email"
        name="epost"
        autoComplete="email"
        aria-label="E-mail"
        placeholder="E-mail"
      />
      <textarea
        className={klasse('melding', 'm-felt--stor')}
        style={{ '--ph': C.placeholder } as React.CSSProperties}
        name="melding"
        aria-label="Melding"
        placeholder="Melding..."
      />

      {/* Honningkrukke: usynlig for folk, fylt ut av roboter. Navnet må
          ikke ligne på et ekte felt, ellers fyller autofyllen det for
          kunden – og da hadde meldingen blitt stemplet som robot. */}
      <input
        className="honning"
        type="text"
        name="tilleggsinfo"
        tabIndex={-1}
        autoComplete="new-password"
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

      {status === 'sendt' && <SkjemaStatus type="ok" />}
      {status === 'feil' && feil && <SkjemaStatus type="feil" tekst={feil} />}
    </form>
  )
}
