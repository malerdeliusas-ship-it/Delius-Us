import { Link } from 'react-router-dom'
import { C } from '../../lib/theme'

import icOk from '../../assets/figma/ic-ok.webp'
import icKamera from '../../assets/figma/ic-kamera.webp'
import icKlokke from '../../assets/figma/ic-klokke.webp'
import icDokument from '../../assets/figma/ic-dokument.webp'

/**
 * Kortet «Hva dere får» og listen «Teknisk», slik de står ved siden av
 * tilbudsskjemaet i designet. På telefon står de under skjemaet i stedet,
 * med de samme ikonene, tekstene og fargene.
 */

const FONT_MULISH = "'Mulish', 'Montserrat', system-ui, sans-serif"

const PUNKT = [
  {
    ikon: icOk,
    tittel: 'Riktig type jobb',
    brod: 'Du velger blant våre tjenester slik at vi forstår jobben fra start.',
  },
  {
    ikon: icKamera,
    tittel: 'Bedre første vurdering',
    brod: 'Sted, omfang og bilder gir oss et mye bedre grunnlag for et nøyaktig tilbud.',
  },
  {
    ikon: icKlokke,
    tittel: 'Mindre frem og tilbake',
    brod: 'Du får svar raskere fordi vi har informasjonen vi trenger.',
  },
  {
    ikon: icDokument,
    tittel: 'Samme uttrykk',
    brod: 'Skjemaet bygges i tråd med designet på nettsiden og fungerer godt på mobil.',
  },
]

const TEKNISK = [
  'Feltene merkes tydelig og valideres',
  'Varsel sendes til riktig e-post',
  'Bilder kan gjøres valgfrie',
  'GDPR-vennlig håndtering',
]

export default function Fordeler() {
  return (
    <>
      <div className="m-kort m-kort--hvit" style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 21, textAlign: 'center' }}>Hva dere får</h3>
        <ul style={{ listStyle: 'none', display: 'grid', gap: 20, marginTop: 20, padding: 0 }}>
          {PUNKT.map((p) => (
            <li key={p.tittel} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <img
                src={p.ikon}
                alt=""
                loading="lazy"
                decoding="async"
                style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }}
              />
              <div>
                <strong style={{ fontSize: 16, lineHeight: '23px', color: C.brown }}>
                  {p.tittel}
                </strong>
                <p
                  style={{
                    marginTop: 4,
                    fontFamily: FONT_MULISH,
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: C.black,
                  }}
                >
                  {p.brod}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/om-oss" className="m-merke btn-press" style={{ marginTop: 22 }}>
            OM OSS
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 24, textAlign: 'left' }}>Teknisk</h3>
        <ul style={{ listStyle: 'none', display: 'grid', gap: 12, marginTop: 14, padding: 0 }}>
          {TEKNISK.map((t) => (
            <li key={t} style={{ fontSize: 17, lineHeight: '26px', color: C.navy }}>
              ✓ {t}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
