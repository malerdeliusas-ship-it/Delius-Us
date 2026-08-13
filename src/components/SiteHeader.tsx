import { Link } from 'react-router-dom'
import { Abs, CropImg } from './prim'
import { C, FONT } from '../lib/theme'
import logo from '../assets/figma/logo.png'

type Tf = [[number, number, number], [number, number, number]]

/**
 * Header, eksakt fra Figma. Logoen står litt forskjellig fra side til side i
 * designet, så plasseringen sendes inn per side. Nav-lenkene og
 * Kontakt-knappen ligger alltid på faste avstander fra `navL`.
 */
export default function SiteHeader({
  logoL,
  logoW,
  navL,
  logoTf,
}: {
  logoL: number
  logoW: number
  navL: number
  /** Figmas beskjæring av logoen. Bare forsiden bruker et utsnitt. */
  logoTf?: Tf
}) {
  const nav = [
    { label: 'Om oss', to: '/om-oss', dx: 0, w: 79 },
    { label: 'Portefølje', to: '/portefolje', dx: 129, w: 114 },
    { label: 'Malertjenester', to: '/malertjenester', dx: 293, w: 155 },
  ]

  return (
    <Abs l={0} t={0} w={1430} h={96} style={{ zIndex: 5 }}>
      <Link to="/" aria-label="Maler Delius AS – til forsiden">
        {logoTf ? (
          <CropImg src={logo} alt="Maler Delius AS" l={logoL} t={0} w={logoW} h={96} tf={logoTf} loading="eager" />
        ) : (
          <img
            src={logo}
            alt="Maler Delius AS"
            style={{ position: 'absolute', left: logoL, top: 0, width: logoW, height: 96, objectFit: 'cover' }}
          />
        )}
      </Link>

      {nav.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          className="navlink"
          style={{
            position: 'absolute',
            left: navL + n.dx,
            top: 60,
            width: n.w,
            fontFamily: FONT,
            fontSize: 20,
            fontWeight: 600,
            lineHeight: '24.38px',
            color: C.navy,
          }}
        >
          {n.label}
        </Link>
      ))}

      <Link
        to="/kontakt"
        className="btn-press"
        style={{
          position: 'absolute',
          left: navL + 498,
          top: 44,
          width: 188,
          height: 52,
          background: C.gold,
          borderRadius: 65,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontSize: 20,
          fontWeight: 600,
          lineHeight: '24.38px',
          color: C.navy,
        }}
      >
        Kontakt oss
      </Link>
    </Abs>
  )
}
