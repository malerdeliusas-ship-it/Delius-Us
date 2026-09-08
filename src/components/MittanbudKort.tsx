import { useLayoutEffect, useRef, useState } from 'react'
import { C, FONT, BEDRIFT } from '../lib/theme'

/**
 * Kortet med vurderingene fra Mittanbud. Designet hadde et skjermbilde av
 * Mittanbud-profilen (mittanbud-anmeldelser.webp, 862x326), men et bilde
 * fryser tallet: det viste 57 vurderinger mens profilen hadde 58, og
 * markedsføringsloven § 3 krever at tall i markedsføring er riktige og kan
 * dokumenteres. Nå tegnes kortet her, med de samme tallene som resten av
 * siden (BEDRIFT.mittanbud* i src/lib/theme.ts), i samme oppsett som
 * skjermbildet: tittel, fem stolper, snittet med stjerner. Kortet er også
 * lesbart på mobil, der skjermbildet ble uleselig.
 *
 * `bredde` er kortets bredde i piksler; alt annet skaleres fra 862.
 */
const STOLPER: Array<[number, number]> = [
  [5, BEDRIFT.mittanbudVurderinger],
  [4, 0],
  [3, 0],
  [2, 0],
  [1, 0],
]

export default function MittanbudKort({ bredde = 862 }: { bredde?: number }) {
  const k = bredde / 862
  const px = (n: number) => `${n * k}px`
  const maks = Math.max(1, ...STOLPER.map(([, n]) => n))

  // På en telefon blir en nedskalert utgave uleselig: da stables innholdet
  // i stedet, i full bredde og med vanlige skriftstørrelser.
  if (bredde < 600) {
    return (
      <div
        style={{
          width: bredde,
          borderRadius: 28,
          background: C.white,
          padding: '22px 22px 24px',
          fontFamily: FONT,
          color: C.black,
        }}
      >
        <div style={{ fontSize: 19, lineHeight: '25px', fontWeight: 700 }}>
          Andres erfaringer med {BEDRIFT.navn}
        </div>
        <div style={{ marginTop: 4, fontSize: 14, lineHeight: '20px', color: '#5a607a' }}>
          Kunder av {BEDRIFT.navn} har gitt følgende evalueringer
        </div>
        <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
          {STOLPER.map(([stjerner, antall]) => (
            <div key={stjerner} style={{ display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 500 }}>
              <span style={{ width: 16 }}>{stjerner}</span>
              <span style={{ flex: 1, height: 8, borderRadius: 4, background: '#eef0f5', margin: '0 12px 0 8px', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: `${(antall / maks) * 100}%`, borderRadius: 4, background: '#3d5cc7' }} />
              </span>
              <span style={{ width: 28, textAlign: 'right' }}>{antall}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 34, lineHeight: '40px', fontWeight: 700 }}>{BEDRIFT.mittanbudSnitt} av 5</div>
          <div aria-label={`${BEDRIFT.mittanbudSnitt} av 5 stjerner`} style={{ marginTop: 4, lineHeight: 0 }}>
            {[0, 1, 2, 3, 4].map((n) => (
              <svg key={n} viewBox="0 0 24 24" width={26} height={26} aria-hidden="true" style={{ display: 'inline-block', margin: '0 2px' }}>
                <path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.7 6 21l1.3-6.8-5-4.7 6.8-.8z" fill="#f2c45a" />
              </svg>
            ))}
          </div>
          <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600 }}>{BEDRIFT.mittanbudVurderinger} evalueringer</div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: bredde,
        height: 326 * k,
        borderRadius: 67 * k,
        background: C.white,
        position: 'relative',
        fontFamily: FONT,
        color: C.black,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: px(64),
          top: px(46),
          fontSize: px(26),
          lineHeight: px(32),
          fontWeight: 700,
        }}
      >
        Andres erfaringer med {BEDRIFT.navn}
      </div>
      <div
        style={{
          position: 'absolute',
          left: px(64),
          top: px(84),
          fontSize: px(16),
          lineHeight: px(22),
          fontWeight: 400,
          color: '#5a607a',
        }}
      >
        Kunder av {BEDRIFT.navn} har gitt følgende evalueringer
      </div>

      {/* Fem stolper: tallet til venstre, stolpen, antallet til høyre */}
      {STOLPER.map(([stjerner, antall], i) => (
        <div
          key={stjerner}
          style={{
            position: 'absolute',
            left: px(64),
            top: px(148 + i * 27),
            width: px(370),
            height: px(20),
            display: 'flex',
            alignItems: 'center',
            fontSize: px(15),
            fontWeight: 500,
          }}
        >
          <span style={{ width: px(18) }}>{stjerner}</span>
          <span
            style={{
              flex: 1,
              height: px(8),
              borderRadius: px(4),
              background: '#eef0f5',
              margin: `0 ${px(14)} 0 ${px(8)}`,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                display: 'block',
                height: '100%',
                width: `${(antall / maks) * 100}%`,
                borderRadius: px(4),
                background: '#3d5cc7',
              }}
            />
          </span>
          <span style={{ width: px(30), textAlign: 'right' }}>{antall}</span>
        </div>
      ))}

      {/* Snittet og stjernene til høyre */}
      <div
        style={{
          position: 'absolute',
          right: px(64),
          top: px(150),
          width: px(220),
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: px(44), lineHeight: px(50), fontWeight: 700 }}>
          {BEDRIFT.mittanbudSnitt} av 5
        </div>
        <div aria-label={`${BEDRIFT.mittanbudSnitt} av 5 stjerner`} style={{ marginTop: px(6), lineHeight: 0 }}>
          {[0, 1, 2, 3, 4].map((n) => (
            <svg key={n} viewBox="0 0 24 24" width={30 * k} height={30 * k} aria-hidden="true" style={{ display: 'inline-block', margin: `0 ${px(2)}` }}>
              <path
                d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.7 6 21l1.3-6.8-5-4.7 6.8-.8z"
                fill="#f2c45a"
              />
            </svg>
          ))}
        </div>
        <div style={{ marginTop: px(6), fontSize: px(15), fontWeight: 600 }}>
          {BEDRIFT.mittanbudVurderinger} evalueringer
        </div>
      </div>
    </div>
  )
}

/**
 * Samme kort, men så bredt som plassen det står i (mobil). Bredden måles,
 * og kortet tegnes om når den endrer seg (en telefon som snus).
 */
export function MittanbudKortFlytende() {
  const ref = useRef<HTMLDivElement>(null)
  const [bredde, setBredde] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const maal = () => setBredde(el.clientWidth)
    maal()
    const ro = new ResizeObserver(maal)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ width: '100%' }}>
      {bredde > 0 && <MittanbudKort bredde={bredde} />}
    </div>
  )
}
