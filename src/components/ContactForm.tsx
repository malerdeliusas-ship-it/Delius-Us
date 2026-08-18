import type { CSSProperties } from 'react'
import { C, FONT } from '../lib/theme'
import { useKontaktSkjema } from '../lib/kontakt'
import SkjemaStatus from './SkjemaStatus'

/**
 * Kontaktskjemaet slik det er tegnet i Figma. Det står to steder med identisk
 * rytme: forsiden (578px bredt) og Kontakt-siden (718px bredt). Feltene ligger
 * 94px fra hverandre, og knappen 383px under det første feltet.
 *
 * Meldingen går til `/api/kontakt`, som sender den videre på e-post.
 * Kvitteringen og feilene står absolutt plassert under knappen, så resten
 * av siden ikke flytter seg når de dukker opp. Feltet som stoppet
 * innsendingen får rød ring (`felt-feil`).
 */
export default function ContactForm({
  l,
  t,
  w,
  btnL,
  btnW,
}: {
  l: number
  t: number
  w: number
  btnL: number
  btnW: number
}) {
  const { status, feil, feilFelt, send, merk, knappetekst } = useKontaktSkjema()

  const felt = (top: number, h: number, phFarge: string): CSSProperties =>
    ({
      position: 'absolute',
      left: l,
      top,
      width: w,
      height: h,
      borderRadius: 43,
      background: C.white,
      border: 'none',
      outline: 'none',
      padding: '16px 66px 16px 32px',
      fontFamily: FONT,
      fontSize: 20,
      fontWeight: 400,
      lineHeight: '30px',
      color: C.navy,
      resize: 'none',
      '--ph': phFarge,
    }) as CSSProperties

  const klasse = (navn: 'navn' | 'epost' | 'melding') =>
    feilFelt === navn ? 'field felt-feil' : 'field'

  const statusBoks: CSSProperties = {
    position: 'absolute',
    left: l,
    top: t + 383 + 74,
    width: w,
    fontFamily: FONT,
  }

  return (
    <form onSubmit={send} onInput={merk} noValidate>
      <input
        className={klasse('navn')}
        type="text"
        name="navn"
        autoComplete="name"
        aria-label="Navn, etternavn"
        placeholder="Navn, etternavn"
        style={felt(t, 62, 'rgba(2,3,105,0.46)')}
      />
      <input
        className={klasse('epost')}
        type="email"
        name="epost"
        autoComplete="email"
        aria-label="E-mail"
        placeholder="E-mail"
        style={felt(t + 94, 62, C.placeholder)}
      />
      <textarea
        className={klasse('melding')}
        name="melding"
        aria-label="Melding"
        placeholder="Melding..."
        style={felt(t + 188, 163, C.placeholder)}
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
        className="btn-press"
        disabled={status === 'sender'}
        style={{
          position: 'absolute',
          left: btnL,
          top: t + 383,
          width: btnW,
          height: 58,
          borderRadius: 65,
          background: C.goldAlt,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 18,
          color: C.formText,
          cursor: status === 'sender' ? 'progress' : 'pointer',
          opacity: status === 'sender' ? 0.75 : 1,
        }}
      >
        {knappetekst}
      </button>

      {status === 'sendt' && (
        <div style={statusBoks}>
          <SkjemaStatus type="ok" />
        </div>
      )}
      {status === 'feil' && feil && (
        <div style={statusBoks}>
          <SkjemaStatus type="feil" tekst={feil} />
        </div>
      )}
    </form>
  )
}
