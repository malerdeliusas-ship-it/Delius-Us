import { Link, useLocation } from 'react-router-dom'
import { Abs, CropImg } from './prim'
import { C, FONT } from '../lib/theme'
import logo from '../assets/figma/logo.png'

/**
 * Header, lik på alle sider. I Figma sto logoen og menyen noen piksler
 * forskjellig fra side til side (40–118px), så headeren «hoppet» ved
 * sidebytte. Forsidens plassering brukes derfor overalt – forsiden er
 * uendret mot designet, og undersidene avviker bare noen få piksler.
 */

/** Figmas beskjæring av logoen på forsiden. */
const TF_LOGO: [[number, number, number], [number, number, number]] =
  [[0.769784152507782, 0, 0.21223022043704987], [0, 0.9972774982452393, 0.0013612788170576096]]

const LOGO_L = 118.5
const LOGO_W = 214
const NAV_L = 625.5

export default function SiteHeader() {
  const { pathname } = useLocation()
  const nav = [
    { label: 'Om oss', to: '/om-oss', dx: 0, w: 79 },
    { label: 'Portefølje', to: '/portefolje', dx: 129, w: 114 },
    { label: 'Malertjenester', to: '/malertjenester', dx: 293, w: 155 },
  ]

  return (
    <Abs as="header" l={0} t={0} w={1430} h={96} style={{ zIndex: 5 }}>
      <Link to="/" aria-label="Maler Delius AS – til forsiden">
        <CropImg src={logo} alt="Maler Delius AS" l={LOGO_L} t={0} w={LOGO_W} h={96} tf={TF_LOGO} loading="eager" />
      </Link>

      {/* <nav> er statisk og tom i layouten – lenkene i den står absolutt,
          så landemerket endrer ingenting visuelt. */}
      <nav aria-label="Hovedmeny">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="navlink"
            aria-current={pathname === n.to ? 'page' : undefined}
            style={{
              position: 'absolute',
              left: NAV_L + n.dx,
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
          aria-current={pathname === '/kontakt' ? 'page' : undefined}
          style={{
            position: 'absolute',
            left: NAV_L + 498,
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
      </nav>
    </Abs>
  )
}
