import { Link } from 'react-router-dom'
import MobilSide from '../../components/mobile/Shell'
import { C, G } from '../../lib/theme'
import { TJENESTER } from '../../lib/site'
import { TRINN } from '../Malertjenester'

import splash from '../../assets/figma/splash.webp'

export default function MalertjenesterMobil() {
  return (
    <MobilSide>
      <img
        src={splash}
        alt=""
        style={{ display: 'block', width: '100%', height: 90, objectFit: 'cover', objectPosition: 'top' }}
      />

      <div style={{ background: G.malertjenester }}>
        <section className="m-seksjon m-inn">
          <h2>Våre tjenester</h2>
          <div style={{ display: 'grid', gap: 20, marginTop: 28 }}>
            {TJENESTER.map((s) => (
              <div key={s.id} className="m-kort">
                <img src={s.ikon} alt="" loading="lazy" decoding="async" style={{ height: 64, width: 'auto' }} />
                <h3 style={{ marginTop: 16 }}>{s.tittel}</h3>
                <p style={{ marginTop: 12, color: C.brown, whiteSpace: 'pre-line' }}>{s.brod}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="m-seksjon m-inn">
          <h2 style={{ color: C.black, fontWeight: 600 }}>Arbeidstrinn med Maler Delius AS</h2>
          <div style={{ display: 'grid', gap: 20, marginTop: 28 }}>
            {TRINN.map((tr) => (
              <div key={tr.merke.tekst} className="m-kort">
                <h3>{tr.tittel.tekst}</h3>
                <ul style={{ marginTop: 14, display: 'grid', gap: 10, listStyle: 'none' }}>
                  {tr.punkter.map((p) => (
                    <li key={p.tekst} style={{ fontSize: 16, lineHeight: '26px' }}>
                      {p.tekst}
                    </li>
                  ))}
                </ul>
                <div
                  style={{
                    marginTop: 20,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 28px',
                    borderRadius: 34,
                    background: C.panelBlue,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 18,
                  }}
                >
                  {tr.merke.tekst}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="m-seksjon m-inn" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontWeight: 700 }}>Få en gratis befaring</h2>
          <Link to="/kontakt" className="m-knapp btn-press" style={{ marginTop: 20, color: C.brown }}>
            Kontakt oss
          </Link>
        </section>
      </div>
    </MobilSide>
  )
}
