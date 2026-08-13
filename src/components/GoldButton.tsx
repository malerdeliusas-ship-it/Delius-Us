import { Link } from 'react-router-dom'
import { C, FONT } from '../lib/theme'

/** Gul pilleknapp, eksakt fra Figma. */
export default function GoldButton({
  l,
  t,
  w,
  h = 58,
  label,
  to = '/kontakt',
  bg = C.gold,
  color = C.navy,
  size = 18,
  weight = 700,
  r = 65,
}: {
  l: number
  t: number
  w: number
  h?: number
  label: string
  to?: string
  bg?: string
  color?: string
  size?: number
  weight?: number
  r?: number
}) {
  return (
    <Link
      to={to}
      className="btn-press"
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: w,
        height: h,
        background: bg,
        borderRadius: r,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        color,
      }}
    >
      {label}
    </Link>
  )
}
