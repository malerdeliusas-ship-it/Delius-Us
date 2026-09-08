import { Link } from 'react-router-dom'
import { C, FONT } from '../lib/theme'

import icOk from '../assets/figma/ic-ok.webp'
import icKamera from '../assets/figma/ic-kamera.webp'
import icKlokke from '../assets/figma/ic-klokke.webp'
import icDokument from '../assets/figma/ic-dokument.webp'

/**
 * Det hvite kortet «Hva dere får» ved siden av tilbudsskjemaet. Identisk
 * tegnet på Kontakt-siden og på forsiden (376x664), så samme komponent står
 * begge steder. `l` og `t` er kortets øverste venstre hjørne.
 *
 * Brødteksten står i Mulish SemiBold, som kom inn med denne utgaven av
 * designet. Overskriftene er Montserrat, som resten av nettstedet.
 */

const FONT_MULISH = "'Mulish', 'Montserrat', system-ui, sans-serif"

/** Ett punkt i kortet, med målene fra Figma. Alt er relativt til kortet. */
const PUNKT = [
  {
    ikon: icOk,
    ikonY: 116,
    tekstX: 118,
    tittelY: 92,
    tittelW: 184,
    midtstilt: false,
    tittel: 'Riktig type jobb',
    brodW: 184,
    brod: 'Du velger blant våre tjenester slik at vi forstår jobben fra start.',
  },
  {
    ikon: icKamera,
    ikonY: 250,
    tekstX: 128,
    tittelY: 226,
    tittelW: 179,
    midtstilt: true,
    tittel: 'Bedre første vurdering',
    brodW: 195,
    brod: 'Sted, omfang og bilder gir oss et mye bedre grunnlag for et nøyaktig tilbud.',
  },
  {
    ikon: icKlokke,
    ikonY: 373,
    tekstX: 116,
    tittelY: 360,
    tittelW: 213,
    midtstilt: false,
    tittel: 'Mindre frem og tilbake',
    brodW: 213,
    brod: 'Du får svar raskere fordi vi har informasjonen vi trenger.',
  },
  {
    ikon: icDokument,
    ikonY: 488,
    tekstX: 114,
    tittelY: 464,
    tittelW: 211,
    midtstilt: false,
    tittel: 'Samme uttrykk',
    brodW: 211,
    brod: 'Skjemaet bygges i tråd med designet på nettsiden og fungerer godt på mobil.',
  },
]

export default function HvaDereFaar({ l, t }: { l: number; t: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: 376,
        height: 664,
        borderRadius: 67,
        background: 'rgba(255,255,255,0.99)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 48,
          top: 32,
          width: 282,
          fontFamily: FONT,
          fontSize: 24,
          fontWeight: 700,
          lineHeight: '36px',
          textAlign: 'center',
          color: C.navy,
        }}
      >
        Hva dere får
      </div>

      {PUNKT.map((p) => (
        <div key={p.tittel}>
          <img
            src={p.ikon}
            alt=""
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              left: 48,
              top: p.ikonY,
              width: 50,
              height: 50,
              objectFit: 'contain',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: p.tekstX,
              top: p.tittelY,
              width: p.tittelW,
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 700,
              lineHeight: '22px',
              textAlign: p.midtstilt ? 'center' : 'left',
              color: C.brown,
            }}
          >
            {p.tittel}
          </div>
          <div
            style={{
              position: 'absolute',
              left: p.tekstX,
              top: p.tittelY + 30,
              width: p.brodW,
              fontFamily: FONT_MULISH,
              fontSize: 15,
              fontWeight: 600,
              lineHeight: '22px',
              color: C.black,
            }}
          >
            {p.brod}
          </div>
        </div>
      ))}

      <Link
        to="/om-oss"
        className="btn-press"
        style={{
          position: 'absolute',
          left: 103,
          top: 598,
          width: 171,
          height: 39,
          borderRadius: 41,
          background: C.gold,
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
    </div>
  )
}
