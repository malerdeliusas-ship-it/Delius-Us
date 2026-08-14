import { Link } from 'react-router-dom'
import MobilSide from '../../components/mobile/Shell'
import MobilSkjema from '../../components/mobile/MobilSkjema'
import { C, G } from '../../lib/theme'
import { TEAM, TJENESTER } from '../../lib/site'
import { BADGES, GRUNNER } from '../Home'

import heroBilde from '../../assets/figma/hero-echipa.jpg'
import omOssBilde from '../../assets/figma/omoss-team.jpg'

export default function HomeMobil() {
  return (
    <MobilSide>
      {/* ---------- Hero ---------- */}
      {/* Midtstilt komposisjon: tittel, ingress og knapp på én akse gir ro */}
      <section className="m-seksjon m-inn" style={{ background: C.cream, textAlign: 'center' }}>
        <h1>Profesjonell maling for hjem og bedrifter i Oslo</h1>
        <p style={{ marginTop: 18, color: 'rgba(2,34,105,0.65)', fontWeight: 600 }}>
          Vi holder til i Oslo og spesialiserer oss på å levere førsteklasses maler- og
          reparasjonstjenester. Vår misjon er å forvandle rom ved å tilføre komfort og trivsel i
          hvert hjem og kontor.
        </p>
        <Link to="/kontakt" className="m-knapp m-knapp--senter btn-press" style={{ marginTop: 24 }}>
          Bestill gratis befaring
        </Link>
        <img
          className="m-bilde"
          src={heroBilde}
          alt="Malere fra Maler Delius AS i arbeid"
          style={{ marginTop: 28 }}
        />
      </section>

      {/* ---------- Tre løfter ---------- */}
      <section style={{ display: 'grid' }}>
        {BADGES.map((b) => (
          <div
            key={b.l}
            style={{
              background: b.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              padding: '20px var(--kant)',
            }}
          >
            <img src={b.ic} alt="" width={64} height={64} style={{ opacity: b.op, flexShrink: 0 }} />
            <div style={{ fontSize: 22, lineHeight: '28px', fontWeight: 600, color: b.farge }}>
              {b.tekst.replace(/\n/g, ' ')}
            </div>
          </div>
        ))}
      </section>

      {/* ---------- Velkommen ---------- */}
      <section className="m-seksjon m-inn">
        {/* Firmanavnet er inline-block: bryter det, bryter det som ett stykke */}
        <div className="m-balanse" style={{ fontSize: 24, lineHeight: '32px', fontStyle: 'italic', textAlign: 'center' }}>
          Velkommen til{' '}
          <span style={{ fontWeight: 700, fontStyle: 'normal', display: 'inline-block' }}>
            MALER DELIUS AS
          </span>
        </div>
        <img className="m-bilde" src={omOssBilde} alt="Teamet i Maler Delius AS" style={{ marginTop: 20 }} />
        <p style={{ marginTop: 20, fontStyle: 'italic' }}>
          Vi er Maler Delius AS, et team av profesjonelle med over 5 års erfaring, som tilbyr
          høykvalitets maler- og reparasjonstjenester i Oslo. Vårt mål er å gjøre ditt rom mer
          hyggelig, moderne og behagelig for både liv og arbeid.
        </p>

        <h3 style={{ marginTop: 36, fontStyle: 'italic', fontWeight: 600 }}>Hvorfor velge oss?</h3>
        <div style={{ display: 'grid', gap: 24, marginTop: 20 }}>
          {GRUNNER.map((g) => (
            <div key={g.tittel}>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 18, lineHeight: '26px' }}>
                {g.tittel}
              </div>
              <p style={{ marginTop: 6, color: g.farge }}>{g.brod}</p>
            </div>
          ))}
        </div>
        <Link to="/kontakt" className="m-knapp m-knapp--senter btn-press" style={{ marginTop: 28, color: C.brown }}>
          Kontakt oss
        </Link>
      </section>

      {/* ---------- Vårt team ---------- */}
      <section className="m-seksjon m-inn" style={{ background: G.team }}>
        <h2>Vårt team</h2>
        <div className="m-rutenett m-rutenett--2" style={{ marginTop: 28 }}>
          {TEAM.map((p) => (
            <div key={p.navn} style={{ textAlign: 'center' }}>
              <img
                src={p.bilde}
                alt={p.navn.trim() + ', maler hos Maler Delius AS i Oslo'}
                style={{
                  width: '100%',
                  aspectRatio: '271 / 406',
                  objectFit: 'cover',
                  borderRadius: 999,
                  display: 'block',
                }}
              />
              <div style={{ marginTop: 12, fontWeight: 800, fontSize: 19 }}>{p.navn.trim()}</div>
              <div style={{ color: C.teamMeta, fontWeight: 700, fontSize: 15, lineHeight: '22px', whiteSpace: 'pre-line' }}>
                {p.meta.trim()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Våre tjenester ---------- */}
      <section className="m-seksjon m-inn" style={{ background: G.tjenester }}>
        <h2>Våre tjenester</h2>
        <div style={{ display: 'grid', gap: 20, marginTop: 28 }}>
          {TJENESTER.map((s) => (
            <div key={s.id} className="m-kort">
              <img src={s.ikon} alt="" loading="lazy" decoding="async" style={{ height: 64, width: 'auto' }} />
              <h3 style={{ marginTop: 16 }}>{s.tittel}</h3>
              <ul className="m-liste" style={{ marginTop: 12, color: C.brown, fontSize: 16, lineHeight: '26px' }}>
                {s.brod.split('\n').map((linje) => (
                  <li key={linje}>{linje}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Kontakt ---------- */}
      <section className="m-seksjon m-inn" style={{ background: C.contactBlue, color: '#fff' }}>
        <h2 style={{ color: '#fff' }}>Kontakt oss!</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <span className="m-merke">GRATIS BEFARING</span>
        </div>
        <p style={{ marginTop: 16, textAlign: 'center' }}>
          Vi skaper en atmosfære du vil vende tilbake til, med Maler Delius AS
        </p>
        <div style={{ marginTop: 24 }}>
          <MobilSkjema />
        </div>
      </section>
    </MobilSide>
  )
}
