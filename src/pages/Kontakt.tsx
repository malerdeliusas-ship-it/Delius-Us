import Stage from '../components/Stage'
import SiteHeader from '../components/SiteHeader'
import SiteFooter, { FOOTER_EKSTRA } from '../components/SiteFooter'
import TilbudSkjemaDesign, { EKSTRA_HOYDE } from '../components/TilbudSkjemaDesign'
import Kart from '../components/Kart'
import HvaDereFaar from '../components/HvaDereFaar'
import Teknisk from '../components/Teknisk'
import { Abs, Txt, Img, CropImg } from '../components/prim'
import { C, BEDRIFT } from '../lib/theme'
import type { TilbudSkjemaTilstand } from '../lib/tilbud'

import splash from '../assets/figma/splash.webp'
import logo from '../assets/figma/logo.png'
import icMarker from '../assets/figma/ic-marker.webp'
import icWeb from '../assets/figma/ic-web.webp'
import icMail from '../assets/figma/ic-mail.webp'

/**
 * Kontakt-siden, tegnet på nytt i Figma 7. september 2026: det korte
 * skjemaet er byttet ut med det lange, nummererte tilbudsskjemaet.
 *
 * Alle mål er hentet rett fra rammen «Kontakt oss» (46:964, 1430x2838).
 * Siden er 237px høyere enn rammen, fordi skjemaet har fått en syvende
 * bolk med navn, telefon og e-post – uten den kan ingen svare kunden.
 * Alt som ligger under skjemaet er flyttet like langt ned (`SKIFT`).
 */

/** Så mye høyere enn Figma-rammen siden er: kontaktbolken og avkryssingen for personvern. */
const SKIFT = EKSTRA_HOYDE

/** Dempet blå, som i designet: #022269 med 62 % dekkevne. */
const DEMPET = 'rgba(2,34,105,0.62)'

/** Kontaktraden nederst: ikon + tekst, tre grupper på rad. */
const RAD = [
  {
    ikon: icMarker,
    iL: 120,
    iW: 90,
    iH: 63,
    iT: 1975,
    tL: 217,
    tT: 1992,
    tW: 382,
    tekst: BEDRIFT.adresse,
    href: BEDRIFT.kart,
    alt: 'Adresse',
  },
  {
    ikon: icWeb,
    iL: 654,
    iW: 90,
    iH: 63,
    iT: 1975,
    tL: 744,
    tT: 1992,
    tW: 159,
    tekst: BEDRIFT.nettsted,
    href: `https://${BEDRIFT.nettsted}`,
    alt: 'Nettsted',
  },
  {
    ikon: icMail,
    iL: 959,
    iW: 90,
    iH: 62,
    iT: 1976,
    tL: 1049,
    tT: 1992,
    tW: 221,
    tekst: BEDRIFT.epost,
    href: `mailto:${BEDRIFT.epost}`,
    alt: 'E-post',
  },
]

export default function Kontakt({ s }: { s: TilbudSkjemaTilstand }) {
  return (
    <Stage height={2838 + SKIFT + FOOTER_EKSTRA}>
      {/* Den blå flaten under alt. Stoppene står i piksler og ikke prosent,
          så gradienten treffer designet nøyaktig selv om siden er høyere
          enn rammen; de siste 237px står i sluttfargen. */}
      <Abs
        l={0}
        t={100}
        w={1430}
        h={2494 + SKIFT}
        style={{
          background: 'linear-gradient(180deg, #7aa3fd 0px, #ffffff 2494px)',
          overflow: 'hidden',
        }}
      />

      <SiteHeader />

      <Txt as="h1" l={437} t={329} w={557} size={40} weight={800} lh={60} color={C.white}>
        Få et uforpliktende tilbud
      </Txt>
      <Txt l={416} t={383} w={597} size={24} weight={700} lh={36} color={DEMPET} align="center">
        En kort vei fra mobilbesøk til et riktig pristilbud
      </Txt>

      <Txt as="h2" l={120} t={484} w={393} size={32} weight={700} lh={48} color={C.navy} align="center">
        Det jeg faktisk sikter til
      </Txt>
      <Txt l={120} t={547} w={718} size={20} weight={700} lh={30} color={DEMPET}>
        {'Nettsiden har allerede et kontaktskjema. Det jeg ville endret er informasjonen dere får inn. I dag spør skjemaet bare etter navn, \ne-post og en åpen melding. Kunden må selv gjette hva som er nyttig å skrive.'}
      </Txt>

      <Img src={logo} alt="" l={960} t={451} w={278} h={96} fit="cover" loading="eager" />
      <Txt l={928} t={566} w={356} size={24} weight={700} lh={36} color={C.navy} align="center">
        Forslag: «Be om gratis befaring eller tilbud»
      </Txt>

      <TilbudSkjemaDesign l={120} t={748} s={s} />

      <HvaDereFaar l={910} t={798} />
      <Teknisk l={951} t={1515} rader={[54, 136, 195, 257]} />

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
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              left: r.iL,
              top: r.iT + SKIFT,
              width: r.iW,
              height: r.iH,
              objectFit: 'contain',
            }}
          />
          {/* Midtstilt som i designet. E-postadressen vår er lengre enn den
              designet viser, så den får stå utenfor boksen sin i stedet for
              å brekke i to linjer – midtpunktet blir det samme. */}
          <Txt
            l={r.tL}
            t={r.tT + SKIFT}
            w={r.tW}
            size={20}
            weight={800}
            lh={30}
            color={C.black}
            align="center"
            style={{ whiteSpace: 'nowrap' }}
          >
            {r.tekst}
          </Txt>
        </a>
      ))}

      {/* ---------- Kart ---------- */}
      <Abs l={118} t={2067 + SKIFT} w={1194} h={473} style={{ borderRadius: 67, overflow: 'hidden' }}>
        <Kart />
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

      <SiteFooter t={2594 + SKIFT} />
    </Stage>
  )
}
