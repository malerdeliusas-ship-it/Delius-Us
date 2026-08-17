import { Link } from 'react-router-dom'
import { Abs } from './prim'
import { C, FONT, BEDRIFT } from '../lib/theme'

const col: React.CSSProperties = {
  position: 'absolute',
  top: 84,
  fontFamily: FONT,
  fontSize: 15,
  fontWeight: 300,
  lineHeight: '22.5px',
  color: C.white,
}

const u: React.CSSProperties = { textDecoration: 'underline' }

/**
 * Footer, eksakt fra Figma (#022269, 1430x244).
 * Adressen er rettet til den som står i kontaktraden på Kontakt-siden, og
 * «Portfolje» er rettet til «Portefølje». Begge er notert i README.
 */
export default function SiteFooter({ t, l = 0 }: { t: number; l?: number }) {
  return (
    <Abs as="footer" l={l} t={t} w={1430} h={244} style={{ background: C.navy }}>
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
        <div>{BEDRIFT.orgnr}</div>
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
    </Abs>
  )
}
