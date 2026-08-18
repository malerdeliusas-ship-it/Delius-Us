import { Component, type ReactNode } from 'react'
import { BEDRIFT } from '../lib/theme'

/**
 * Sikkerhetsnett rundt hele nettstedet.
 *
 * Uten dette gjør React som React gjør: kaster én komponent en feil, rives
 * hele treet ned og den besøkende sitter igjen med en blank, hvit side. Det
 * er en dårlig måte å møte en kunde på. Her fanges feilen i stedet opp, og
 * siden viser en kort beskjed med telefonnummeret og e-postadressen, så
 * henvendelsen kommer fram selv om noe teknisk har gått i stykker.
 */
type Props = { children: ReactNode }
type State = { feil: boolean }

export default class Feilgrense extends Component<Props, State> {
  state: State = { feil: false }

  static getDerivedStateFromError(): State {
    return { feil: true }
  }

  componentDidCatch(feil: unknown) {
    console.error('Uventet feil på siden:', feil)
  }

  render() {
    if (!this.state.feil) return this.props.children

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          fontFamily: "'Montserrat', system-ui, sans-serif",
          color: '#0d2a5c',
          background: '#fffdf7',
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Noe gikk galt</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>
            Vi klarte ikke å vise siden akkurat nå. Prøv å laste den inn på nytt.
            Haster det, er det bare å ta direkte kontakt.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8 }}>
            <a href={BEDRIFT.telefonLenke} style={{ color: '#0d2a5c', fontWeight: 600 }}>
              {BEDRIFT.telefon}
            </a>
            <br />
            <a href={`mailto:${BEDRIFT.epost}`} style={{ color: '#0d2a5c', fontWeight: 600 }}>
              {BEDRIFT.epost}
            </a>
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              padding: '12px 28px',
              border: 'none',
              borderRadius: 999,
              background: '#ffc300',
              color: '#0d2a5c',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Last siden på nytt
          </button>
        </div>
      </div>
    )
  }
}
