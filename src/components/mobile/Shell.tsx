import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BEDRIFT } from '../../lib/theme'
import logo from '../../assets/figma/logo.png'

const LENKER = [
  { til: '/om-oss', tekst: 'Om oss' },
  { til: '/portefolje', tekst: 'Portefølje' },
  { til: '/malertjenester', tekst: 'Malertjenester' },
  { til: '/kontakt', tekst: 'Kontakt oss' },
]

function MobilHeader() {
  const [apen, setApen] = useState(false)
  const sted = useLocation()

  // lukk menyen når man bytter side
  useEffect(() => setApen(false), [sted.pathname])

  // ikke la siden bak scrolle mens menyen er åpen
  useEffect(() => {
    document.body.style.overflow = apen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [apen])

  return (
    <>
      <header className="m-header">
        <Link to="/" aria-label="Maler Delius AS – til forsiden">
          <img className="m-logo" src={logo} alt="Maler Delius AS" />
        </Link>
        <button
          className="m-burger"
          aria-label={apen ? 'Lukk menyen' : 'Åpne menyen'}
          aria-expanded={apen}
          onClick={() => setApen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {apen && (
        <nav className="m-meny">
          {/* lukk også når lenken peker på siden man allerede står på –
              da endres ikke pathname og effekten over kjører ikke */}
          {LENKER.map((l) => (
            <Link key={l.til} to={l.til} onClick={() => setApen(false)}>
              {l.tekst}
            </Link>
          ))}
          <a className="m-knapp m-knapp--blokk" style={{ marginTop: 20 }} href={BEDRIFT.telefonLenke}>
            Ring {BEDRIFT.telefon}
          </a>
        </nav>
      )}
    </>
  )
}

function MobilFooter() {
  return (
    <footer className="m-footer">
      <div>
        <div style={{ marginBottom: 6 }}>Kontakt</div>
        <div>{BEDRIFT.adresse}</div>
        <div>
          <a href={BEDRIFT.telefonLenke}>{BEDRIFT.telefon}</a>
        </div>
        <div>
          <a href={`mailto:${BEDRIFT.epost}`}>{BEDRIFT.epost}</a>
        </div>
        <div>{BEDRIFT.orgnr}</div>
      </div>

      <div>
        <div style={{ marginBottom: 6 }}>Hurtiglenker</div>
        {LENKER.map((l) => (
          <div key={l.til}>
            <Link to={l.til}>{l.tekst}</Link>
          </div>
        ))}
      </div>

      <div>
        <div style={{ marginBottom: 6 }}>Følg oss</div>
        <div>
          <a href={BEDRIFT.facebook} target="_blank" rel="noreferrer">
            FACEBOOK
          </a>
        </div>
        <div>
          <a href={BEDRIFT.instagram} target="_blank" rel="noreferrer">
            INSTAGRAM
          </a>
        </div>
      </div>
    </footer>
  )
}

/** Rammen rundt alle mobilsidene: header, innhold, footer. */
export default function MobilSide({ children }: { children: ReactNode }) {
  return (
    <div className="m">
      <MobilHeader />
      {children}
      <MobilFooter />
    </div>
  )
}
