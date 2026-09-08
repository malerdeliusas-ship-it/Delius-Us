import MobilSide from '../../components/mobile/Shell'
import TilbudSkjema from '../../components/TilbudSkjema'
import Fordeler from '../../components/mobile/Fordeler'
import Kart from '../../components/Kart'
import { C, G, BEDRIFT } from '../../lib/theme'
import type { TilbudSkjemaTilstand } from '../../lib/tilbud'

import splash from '../../assets/figma/splash-mobil.webp'
import logo from '../../assets/figma/logo.png'
import icMarker from '../../assets/figma/ic-marker.webp'
import icWeb from '../../assets/figma/ic-web.webp'
import icMail from '../../assets/figma/ic-mail.webp'

/**
 * Kontakt-siden på telefon. Følger den nye Figma-utgaven fra 7. september
 * 2026: det lange tilbudsskjemaet i stedet for det korte kontaktskjemaet.
 * Designeren har ikke tegnet en mobilutgave, så siden bygges som én
 * kolonne med de samme tekstene, fargene og ikonene som på desktop.
 */

const RAD = [
  { ikon: icMarker, tekst: BEDRIFT.adresse, href: BEDRIFT.kart, alt: 'Adresse' },
  { ikon: icWeb, tekst: BEDRIFT.nettsted, href: `https://${BEDRIFT.nettsted}`, alt: 'Nettsted' },
  { ikon: icMail, tekst: BEDRIFT.epost, href: `mailto:${BEDRIFT.epost}`, alt: 'E-post' },
]

/** Dempet blå, som i designet: #022269 med 62 % dekkevne. */
const DEMPET = 'rgba(2,34,105,0.62)'

export default function KontaktMobil({ s }: { s: TilbudSkjemaTilstand }) {
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
          <h2 className="m-balanse" style={{ color: '#fff' }}>
            Få et uforpliktende tilbud
          </h2>
          <p style={{ marginTop: 14, color: DEMPET, textAlign: 'center', fontWeight: 700 }}>
            En kort vei fra mobilbesøk til et riktig pristilbud
          </p>

          <h3 style={{ marginTop: 34, textAlign: 'center' }}>Det jeg faktisk sikter til</h3>
          <p style={{ marginTop: 12, color: DEMPET, fontWeight: 700 }}>
            Nettsiden har allerede et kontaktskjema. Det jeg ville endret er informasjonen dere får
            inn. I dag spør skjemaet bare etter navn, e-post og en åpen melding. Kunden må selv
            gjette hva som er nyttig å skrive.
          </p>

          <img
            src={logo}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ width: 200, height: 69, objectFit: 'contain', margin: '28px auto 0' }}
          />
          <p style={{ marginTop: 10, textAlign: 'center', fontWeight: 700, color: C.navy }}>
            Forslag: «Be om gratis befaring eller tilbud»
          </p>

          <div style={{ marginTop: 30 }}>
            <TilbudSkjema s={s} />
          </div>

          <Fordeler />

          <div style={{ display: 'grid', gap: 18, marginTop: 36 }}>
            {RAD.map((r) => (
              <a
                key={r.tekst}
                href={r.href}
                target={r.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <img
                  src={r.ikon}
                  alt={r.alt}
                  style={{ width: 44, height: 32, objectFit: 'contain', flexShrink: 0 }}
                  loading="lazy"
                  decoding="async"
                />
                <span style={{ fontWeight: 800, fontSize: 17, color: C.black }}>{r.tekst}</span>
              </a>
            ))}
          </div>

          <div style={{ marginTop: 28, borderRadius: 28, overflow: 'hidden', height: 320 }}>
            <Kart />
          </div>
        </section>
      </div>
    </MobilSide>
  )
}
