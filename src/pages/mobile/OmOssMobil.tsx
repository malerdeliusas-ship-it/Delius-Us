import { Link } from 'react-router-dom'
import MobilSide from '../../components/mobile/Shell'
import { C } from '../../lib/theme'
import { GRUNNER } from '../OmOss'

import splash from '../../assets/figma/splash-omoss.png'
import teamBilde from '../../assets/figma/omoss-team.jpg'
import foto1 from '../../assets/figma/omoss-dsc06303-1.jpg'
import foto2 from '../../assets/figma/omoss-dsc07360-1.jpg'
import foto3 from '../../assets/figma/omoss-1-119-1.jpg'
import foto4 from '../../assets/figma/omoss-dsc05502-1.jpg'

const GALLERI = [
  { src: foto1, alt: 'Maler ruller maling på vegg' },
  { src: foto2, alt: 'Maler arbeider rundt et vindu' },
  { src: foto3, alt: 'Maler på gulvet under arbeid' },
  { src: foto4, alt: 'Maler med hørselvern i arbeid' },
]

export default function OmOssMobil() {
  return (
    <MobilSide>
      <img
        src={splash}
        alt=""
        style={{ display: 'block', width: '100%', height: 90, objectFit: 'cover', objectPosition: 'top' }}
      />

      <section className="m-seksjon m-inn">
        <div style={{ fontSize: 24, lineHeight: '32px', fontStyle: 'italic' }}>
          Velkommen til{' '}
          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>MALER DELIUS AS</span>
        </div>
        <img className="m-bilde" src={teamBilde} alt="Teamet i Maler Delius AS" style={{ marginTop: 20 }} />
        <p style={{ marginTop: 20, fontWeight: 500, letterSpacing: '0.04em' }}>
          Vi er Maler Delius AS, et team av profesjonelle med over 5 års erfaring, som tilbyr
          høykvalitets maler- og reparasjonstjenester i Oslo. Vårt mål er å gjøre ditt rom mer
          hyggelig, moderne og behagelig for både liv og arbeid.
        </p>
      </section>

      <section className="m-seksjon m-inn" style={{ background: C.panelBlue, color: '#fff' }}>
        <h3 style={{ fontStyle: 'italic', fontWeight: 600 }}>Hvorfor velge oss?</h3>
        <div style={{ display: 'grid', gap: 24, marginTop: 20 }}>
          {GRUNNER.map((g) => (
            <div key={g.tittel}>
              <div style={{ color: g.farge, fontWeight: 700, fontSize: 18, lineHeight: '26px' }}>
                {g.tittel}
              </div>
              <p style={{ marginTop: 6 }}>{g.brod}</p>
            </div>
          ))}
        </div>
        <Link to="/kontakt" className="m-knapp btn-press" style={{ marginTop: 28, color: C.brown }}>
          Kontakt oss
        </Link>

        <div className="m-rutenett m-rutenett--2" style={{ marginTop: 36 }}>
          {GALLERI.map((f) => (
            <img
              key={f.alt}
              src={f.src}
              alt={f.alt}
              style={{
                width: '100%',
                aspectRatio: '249 / 374',
                objectFit: 'cover',
                borderRadius: 24,
                display: 'block',
              }}
            />
          ))}
        </div>
      </section>
    </MobilSide>
  )
}
