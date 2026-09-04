import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
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
 *
 * `tilbud` legger en linje under knappen som peker til tilbudsskjemaet
 * (/tilbud): «lys» er hvit tekst på den blå forsiden, «mork» er marineblå
 * tekst på den lyse Kontakt-siden, med en annen ordlyd fordi teksten over
 * skjemaet der alt nevner tilbud. Kvitteringen og feilmeldingen tar lenkens
 * plass når de vises, så ingenting skyves ned i footeren.
 */
export default function ContactForm({
  l,
  t,
  w,
  btnL,
  btnW,
  tilbud,
}: {
  l: number
  t: number
  w: number
  btnL: number
  btnW: number
  tilbud?: 'lys' | 'mork'
}) {
  const { status, feil, feilFelt, send, merk, knappetekst } = useKontaktSkjema()
  const lenkeTop = t + 383 + 74

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
    top: lenkeTop,
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

      {/* Lenken viker for kvitteringen og feilmeldingen, som står på samme plass */}
      {tilbud && status !== 'sendt' && status !== 'feil' && (
        <div
          style={{
            position: 'absolute',
            left: l,
            top: lenkeTop,
            width: w,
            textAlign: 'center',
            fontFamily: FONT,
            fontSize: 16,
            lineHeight: '24px',
            color: tilbud === 'lys' ? C.white : C.navy,
          }}
        >
          {tilbud === 'lys' ? 'Ønsker du et pristilbud?' : 'Vil du legge ved bilder og mål?'}{' '}
          <Link
            to="/tilbud"
            className="tilbud-lenke"
            style={{ color: tilbud === 'lys' ? C.gold : C.panelBlue }}
          >
            {tilbud === 'lys' ? 'Be om tilbud her' : 'Bruk tilbudsskjemaet'}
          </Link>
        </div>
      )}

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
