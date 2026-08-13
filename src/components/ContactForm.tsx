import type { CSSProperties } from 'react'
import { C, FONT } from '../lib/theme'
import { useKontaktSkjema, KVITTERING } from '../lib/kontakt'

/**
 * Kontaktskjemaet slik det er tegnet i Figma. Det står to steder med identisk
 * rytme: forsiden (578px bredt) og Kontakt-siden (718px bredt). Feltene ligger
 * 94px fra hverandre, og knappen 383px under det første feltet.
 *
 * Meldingen går til `/api/kontakt`, som sender den videre på e-post.
 * Beskjeder til brukeren står absolutt plassert under knappen, slik at
 * resten av siden ikke flytter seg når de dukker opp.
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
  const { status, feil, send, merk, knappetekst } = useKontaktSkjema()

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

  const beskjed: CSSProperties = {
    position: 'absolute',
    left: l,
    top: t + 383 + 66,
    width: w,
    fontFamily: FONT,
    fontSize: 16,
    lineHeight: '24px',
    fontWeight: 500,
  }

  return (
    <form onSubmit={send} onInput={merk} noValidate>
      <input
        className="field"
        type="text"
        name="navn"
        autoComplete="name"
        aria-label="Navn, etternavn"
        placeholder="Navn, etternavn"
        style={felt(t, 62, 'rgba(2,3,105,0.46)')}
      />
      <input
        className="field"
        type="email"
        name="epost"
        autoComplete="email"
        aria-label="E-mail"
        placeholder="E-mail"
        style={felt(t + 94, 62, C.placeholder)}
      />
      <textarea
        className="field"
        name="melding"
        aria-label="Melding"
        placeholder="Melding..."
        style={felt(t + 188, 163, C.placeholder)}
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
        <p style={{ ...beskjed, color: C.navy }} role="status">
          {KVITTERING}
        </p>
      )}
      {status === 'feil' && feil && (
        <p style={{ ...beskjed, color: '#b3261e' }} role="alert">
          {feil}
        </p>
      )}
    </form>
  )
}
