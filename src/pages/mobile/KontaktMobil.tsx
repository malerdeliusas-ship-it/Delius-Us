import { Link } from 'react-router-dom'
import MobilSide from '../../components/mobile/Shell'
import MobilSkjema from '../../components/mobile/MobilSkjema'
import { C, G, BEDRIFT } from '../../lib/theme'

import splash from '../../assets/figma/splash.webp'
import icMarker from '../../assets/figma/ic-marker.webp'
import icWeb from '../../assets/figma/ic-web.webp'
import icMail from '../../assets/figma/ic-mail.webp'

const RAD = [
  { ikon: icMarker, tekst: BEDRIFT.adresse, href: BEDRIFT.kart, alt: 'Adresse' },
  { ikon: icWeb, tekst: BEDRIFT.nettsted, href: `https://${BEDRIFT.nettsted}`, alt: 'Nettsted' },
  { ikon: icMail, tekst: BEDRIFT.epost, href: `mailto:${BEDRIFT.epost}`, alt: 'E-post' },
]

const KART_EMBED = `https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1s${encodeURIComponent(
  BEDRIFT.adresse
)}`

export default function KontaktMobil() {
  return (
    <MobilSide>
      <div style={{ background: G.kontakt }}>
        <img
          loading="lazy"
          decoding="async"
          src={splash}
          alt=""
          style={{ display: 'block', width: '100%', height: 90, objectFit: 'cover', objectPosition: 'top' }}
        />

        <section className="m-seksjon m-inn">
          <h2 style={{ color: '#fff' }}>Kontakt oss</h2>
          <p style={{ marginTop: 16, color: '#fff', textAlign: 'center' }}>
            Har du spørsmål eller ønsker du et tilbud? Send oss en melding, så tar vi kontakt med
            deg.
          </p>
          <div style={{ marginTop: 24 }}>
            <MobilSkjema />
          </div>

          <div className="m-kort m-kort--hvit" style={{ marginTop: 32, textAlign: 'center' }}>
            <h3 style={{ fontSize: 21 }}>Derfor velger kundene oss</h3>
            <p style={{ marginTop: 14, color: C.brown, fontSize: 18, lineHeight: '28px' }}>
              Erfarne fagfolk, kvalitetsmaterialer og ryddig gjennomføring – fra første samtale til
              ferdig resultat.
            </p>
            <Link to="/om-oss" className="m-merke btn-press" style={{ marginTop: 18 }}>
              OM OSS
            </Link>
          </div>

          <div style={{ display: 'grid', gap: 18, marginTop: 36 }}>
            {RAD.map((r) => (
              <a
                key={r.tekst}
                href={r.href}
                target={r.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <img src={r.ikon} alt={r.alt} style={{ width: 44, height: 32, objectFit: 'contain', flexShrink: 0 }} loading="lazy" decoding="async" />
                <span style={{ fontWeight: 800, fontSize: 17, color: C.black }}>{r.tekst}</span>
              </a>
            ))}
          </div>

          <div style={{ marginTop: 28, borderRadius: 28, overflow: 'hidden', background: '#e8ecf4', minHeight: 320 }}>
            <iframe
              title="Maler Delius AS på kartet"
              src={KART_EMBED}
              style={{ border: 0, display: 'block', width: '100%', height: 320 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      </div>
    </MobilSide>
  )
}
