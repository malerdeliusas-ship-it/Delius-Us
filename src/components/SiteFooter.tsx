import { Link } from 'react-router-dom'
import { Abs } from './prim'
import { C, FONT, BEDRIFT } from '../lib/theme'

const col: React.CSSProperties = {
  position: 'absolute',
  top: 84,
  fontFamily: FONT,
  fontSize: 15,
  fontWeight: 300,
  // Designets egen linjeavstand. Den gjør at lenkene her blir noen piksler
  // lavere enn de 24 pikslene tilgjengelighetskravet ber om, se README.
  lineHeight: '22.5px',
  color: C.white,
}

/**
 * Lenkene i footeren. Polstringen over og under gjør trykkflaten høy nok til
 * kravet på 24 piksler, og den negative margen tar tilbake nøyaktig like
 * mye, så ingenting flytter seg. Utseendet er uendret.
 */
const u: React.CSSProperties = { textDecoration: 'underline', display: 'block' }

/**
 * Footeren i Figma er 244px høy. Under den ligger en ekstra rad på 34px med
 * lenkene til de juridiske sidene (personvern, informasjonskapsler, vilkår,
 * angrerett). Raden er ikke tegnet i designet, men lenkene er lovpålagte og
 * det er ikke plass til fire til inne i de 244 pikslene. Sidene legger
 * FOOTER_EKSTRA til høyden sin, så raden aldri klippes.
 */
export const FOOTER_EKSTRA = 34
export const FOOTER_HOYDE = 244 + FOOTER_EKSTRA

/** Lenkene i den juridiske raden, i rekkefølgen de står. */
export const JURIDISKE_LENKER = [
  { til: '/personvern', tekst: 'Personvern' },
  { til: '/informasjonskapsler', tekst: 'Informasjonskapsler' },
  { til: '/vilkar', tekst: 'Vilkår for bruk' },
  { til: '/angrerett', tekst: 'Angrerett og reklamasjon' },
]

/**
 * Footer, eksakt fra Figma (#022269, 1430x244), pluss den juridiske raden.
 * Adressen er rettet til den som står i kontaktraden på Kontakt-siden, og
 * «Portfolje» er rettet til «Portefølje». Begge er notert i README.
 */
export default function SiteFooter({ t, l = 0 }: { t: number; l?: number }) {
  return (
    <Abs as="footer" l={l} t={t} w={1430} h={FOOTER_HOYDE} style={{ background: C.navy }}>
      <div style={{ ...col, left: 222, width: 240 }}>
        <div>Kontakt</div>
        <div>{BEDRIFT.adresse}</div>
        <a href={BEDRIFT.telefonLenke} style={u}>
          {BEDRIFT.telefon}
        </a>
        <div>
          <a href={`mailto:${BEDRIFT.epost}`} style={u}>
            {BEDRIFT.epost}
          </a>
        </div>
        <div>{BEDRIFT.orgnr}{BEDRIFT.mva ? ' MVA' : ''}</div>
      </div>

      <div style={{ ...col, left: 628, width: 140 }}>
        <div>Hurtiglenker</div>
        <div>
          <Link to="/om-oss" style={u}>
            Om oss
          </Link>
        </div>
        <div>
          <Link to="/malertjenester" style={u}>
            Malertjenester
          </Link>
        </div>
        <div>
          <Link to="/portefolje" style={u}>
            Portefølje
          </Link>
        </div>
        <div>
          <Link to="/blogg" style={u}>
            Blogg
          </Link>
        </div>
        <div>
          <Link to="/kontakt" style={u}>
            Kontakt oss
          </Link>
        </div>
      </div>

      {/* Designet hadde to kanaler; TikTok kom til da kunden sendte adressene. */}
      <div style={{ ...col, left: 942, width: 120 }}>
        <div>Følg oss</div>
        <div>
          <a href={BEDRIFT.facebook} target="_blank" rel="noreferrer" style={u}>
            FACEBOOK
          </a>
        </div>
        <div>
          <a href={BEDRIFT.instagram} target="_blank" rel="noreferrer" style={u}>
            INSTAGRAM
          </a>
        </div>
        <div>
          <a href={BEDRIFT.tiktok} target="_blank" rel="noreferrer" style={u}>
            TIKTOK
          </a>
        </div>
      </div>

      {/* Den juridiske raden: fire lenker midtstilt under de tre spaltene. */}
      <nav
        aria-label="Juridisk informasjon"
        style={{
          position: 'absolute',
          left: 0,
          top: 244,
          width: 1430,
          height: FOOTER_EKSTRA,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 0,
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 400,
          lineHeight: '22.5px',
          color: 'rgba(255,255,255,0.92)',
        }}
      >
        {JURIDISKE_LENKER.map((j, i) => (
          <span key={j.til} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <span aria-hidden="true" style={{ padding: '0 10px' }}>·</span>}
            <Link to={j.til} style={{ textDecoration: 'underline', padding: '1px 0' }}>
              {j.tekst}
            </Link>
          </span>
        ))}
      </nav>
    </Abs>
  )
}
