import { Link } from 'react-router-dom'
import Stage from '../components/Stage'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import ContactForm from '../components/ContactForm'
import { Abs, Txt, Rect, CropImg } from '../components/prim'
import { C, G, FONT, BEDRIFT } from '../lib/theme'

import splash from '../assets/figma/splash.webp'
import icMarker from '../assets/figma/ic-marker.png'
import icWeb from '../assets/figma/ic-web.png'
import icMail from '../assets/figma/ic-mail.png'

/** Kontaktraden nederst: ikon + tekst, tre grupper på rad. */
const RAD = [
  { ikon: icMarker, iL: 119, iW: 90, iH: 63, iT: 1081, tL: 216, tT: 1094.5, tW: 349, tekst: BEDRIFT.adresse, href: BEDRIFT.kart, alt: 'Adresse' },
  { ikon: icWeb, iL: 620, iW: 90, iH: 63, iT: 1081, tL: 710, tT: 1094.5, tW: 191, tekst: BEDRIFT.nettsted, href: `https://${BEDRIFT.nettsted}`, alt: 'Nettsted' },
  { ikon: icMail, iL: 957, iW: 90, iH: 62, iT: 1082, tL: 1047, tT: 1095, tW: 265, tekst: BEDRIFT.epost, href: `mailto:${BEDRIFT.epost}`, alt: 'E-post' },
]

/**
 * Google Maps-innbygging på firmaets adresse. Krever ingen API-nøkkel.
 * Vi peker rett på /maps/embed: den korte /maps?q=…&output=embed-varianten
 * svarer med en omdirigering som har `X-Frame-Options: SAMEORIGIN`, og da
 * nekter nettleseren å vise rammen.
 */
const KART_EMBED = `https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1s${encodeURIComponent(
  BEDRIFT.adresse
)}`

export default function Kontakt() {
  return (
    <Stage height={2025}>
      <Abs l={1} t={100} w={1429} h={1922} style={{ background: G.kontakt, overflow: 'hidden' }} />

      <SiteHeader />

      <Txt as="h1" l={582} t={322} w={266} size={40} weight={800} lh={60} color={C.white}>
        Kontakt oss
      </Txt>

      <Txt l={102.5} t={458} w={751} size={16} weight={400} lh={24} color={C.white} align="center">
        Har du spørsmål eller ønsker du et tilbud? Send oss en melding, så tar vi kontakt med deg.
      </Txt>
      <ContactForm l={119} t={508} w={718} btnL={359} btnW={238} />

      {/* ---------- «Derfor velger kundene oss» ---------- */}
      <Rect l={936} t={458} w={376} h={491} r={67} bg="rgba(255,255,255,0.99)" />
      <Txt l={977} t={513} w={295} size={24} weight={700} lh={36} color={C.navy} align="center">
        {'Derfor velger\nkundene oss'}
      </Txt>
      <Txt l={977} t={606} w={295} size={24} weight={400} lh={36} color={C.brown} align="center">
        Erfarne fagfolk, kvalitetsmaterialer og ryddig gjennomføring – fra første samtale til ferdig
        resultat.
      </Txt>
      <Link
        to="/om-oss"
        className="btn-press"
        style={{
          position: 'absolute',
          left: 1039,
          top: 837,
          width: 171,
          height: 39,
          background: C.gold,
          borderRadius: 41,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontSize: 15,
          fontWeight: 400,
          lineHeight: '22.5px',
          color: C.black,
        }}
      >
        OM OSS
      </Link>

      {/* ---------- Kontaktrad ---------- */}
      {RAD.map((r) => (
        <a
          key={r.tekst}
          href={r.href}
          target={r.href.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          style={{ display: 'contents' }}
        >
          <img
            src={r.ikon}
            alt={r.alt}
            style={{ position: 'absolute', left: r.iL, top: r.iT, width: r.iW, height: r.iH, objectFit: 'contain' }}
          />
          <Txt l={r.tL} t={r.tT} w={r.tW} size={24} weight={800} lh={36} color={C.black}>
            {r.tekst}
          </Txt>
        </a>
      ))}

      {/* ---------- Kart ---------- */}
      <Abs l={118} t={1182} w={1194} h={473} style={{ borderRadius: 67, overflow: 'hidden' }}>
        <iframe
          title="Maler Delius AS på kartet"
          src={KART_EMBED}
          width="1194"
          height="473"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </Abs>

      {/* Akvarellsølet ligger øverst i lagrekkefølgen, som i Figma */}
      <CropImg
        src={splash}
        l={-5}
        t={96}
        w={1441}
        h={213}
        r={25}
        loading="eager"
        tf={[[0.9999397397041321, 0, 0.00003007479062944185], [0, 0.4268537163734436, 0]]}
      />

      <SiteFooter t={1781} l={6} />
    </Stage>
  )
}
