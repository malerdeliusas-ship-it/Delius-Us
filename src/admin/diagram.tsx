import { useRef, useState } from 'react'
import { useSprak } from './sprak'

/**
 * Diagrammene i admin-panelet: håndtegnet SVG i nettstedets farger.
 * Seriefargene er sjekket maskinelt (fargeblindhet + kontrast mot hvit
 * flate): marineblå #224fb1 og en dyp gulltone #c78500 – gullet fra
 * designet (#ffc300) er for lyst til å ligge som strek på hvitt.
 */
export const SERIE_A = '#224fb1' // sidevisninger
export const SERIE_B = '#c78500' // unike besøk

export type Punkt = { etikett: string; visninger: number; unike: number }

const B = 720
const H = 240
const VENSTRE = 46
const HOYRE = 14
const TOPP = 14
const BUNN = 30

/**
 * Rund opp til et «pent» takpunkt for y-aksen.
 *
 * Taket må være delelig på to, for midtstreken er merket med halvparten:
 * med et odde tak ville streken stått på 2,5 men hatt tallet 3 ved siden av.
 */
function tak(maks: number): number {
  if (maks <= 4) return 4
  const grov = 10 ** Math.floor(Math.log10(maks))
  for (const m of [1, 2, 5, 10]) {
    const kandidat = Math.ceil(grov * m)
    if (maks <= kandidat) return kandidat % 2 === 0 ? kandidat : kandidat + 1
  }
  return maks % 2 === 0 ? maks : maks + 1
}

export function LinjeDiagram({
  punkter,
  medUnike = true,
}: {
  punkter: Punkt[]
  medUnike?: boolean
}) {
  const { t } = useSprak()
  const [pekt, setPekt] = useState<number | null>(null)
  const flate = useRef<HTMLDivElement>(null)

  const innerB = B - VENSTRE - HOYRE
  const innerH = H - TOPP - BUNN
  const maks = tak(Math.max(1, ...punkter.map((p) => Math.max(p.visninger, medUnike ? p.unike : 0))))

  const x = (i: number) =>
    VENSTRE + (punkter.length < 2 ? innerB / 2 : (i / (punkter.length - 1)) * innerB)
  const y = (v: number) => TOPP + innerH - (v / maks) * innerH

  const linje = (verdi: (p: Punkt) => number) =>
    punkter.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(verdi(p)).toFixed(1)}`).join(' ')

  // hvilke datoetiketter får plass langs x-aksen
  const hopp = Math.max(1, Math.ceil(punkter.length / 6))

  function pek(e: React.PointerEvent) {
    const boks = flate.current?.getBoundingClientRect()
    if (!boks || punkter.length === 0) return
    const svgX = ((e.clientX - boks.left) / boks.width) * B
    const andel = Math.min(1, Math.max(0, (svgX - VENSTRE) / innerB))
    setPekt(Math.round(andel * (punkter.length - 1)))
  }

  const valgt = pekt !== null ? punkter[pekt] : null

  return (
    <div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--tekst-svak)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 11, height: 11, borderRadius: 3.5, background: SERIE_A }} />
          {t('diagram.visninger')}
        </span>
        {medUnike && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3.5, background: SERIE_B }} />
            {t('diagram.unike')}
          </span>
        )}
      </div>

      <div
        ref={flate}
        style={{ position: 'relative' }}
        onPointerMove={pek}
        onPointerLeave={() => setPekt(null)}
      >
        <svg viewBox={`0 0 ${B} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label={t('diagram.aria')}>
          {/* stille rutenett */}
          {[0, 0.5, 1].map((andel) => {
            const gy = TOPP + innerH - andel * innerH
            return (
              <g key={andel}>
                <line x1={VENSTRE} x2={B - HOYRE} y1={gy} y2={gy} stroke="rgba(2,34,105,0.09)" strokeWidth={1} />
                <text x={VENSTRE - 8} y={gy + 4} textAnchor="end" fontSize={11} fill="rgba(2,34,105,0.55)">
                  {Math.round(andel * maks)}
                </text>
              </g>
            )
          })}

          {/* Datoetiketter. Den første og den siste står helt ytterst, så de
              ankres til kanten sin – midtstilt ville halve teksten falt
              utenfor diagrammet. */}
          {punkter.map((p, i) =>
            i % hopp === 0 || i === punkter.length - 1 ? (
              <text
                key={i}
                x={x(i)}
                y={H - 8}
                textAnchor={i === 0 ? 'start' : i === punkter.length - 1 ? 'end' : 'middle'}
                fontSize={11}
                fill="rgba(2,34,105,0.55)"
              >
                {p.etikett}
              </text>
            ) : null
          )}

          {/* pekelinje */}
          {valgt && pekt !== null && (
            <line
              x1={x(pekt)}
              x2={x(pekt)}
              y1={TOPP}
              y2={TOPP + innerH}
              stroke="rgba(2,34,105,0.25)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}

          {medUnike && (
            <path d={linje((p) => p.unike)} fill="none" stroke={SERIE_B} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          )}
          <path d={linje((p) => p.visninger)} fill="none" stroke={SERIE_A} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {/* punktene under pekeren, med hvit ring så de synes oppå streken */}
          {valgt && pekt !== null && (
            <g>
              {medUnike && (
                <circle cx={x(pekt)} cy={y(valgt.unike)} r={4.5} fill={SERIE_B} stroke="#fff" strokeWidth={2} />
              )}
              <circle cx={x(pekt)} cy={y(valgt.visninger)} r={4.5} fill={SERIE_A} stroke="#fff" strokeWidth={2} />
            </g>
          )}
        </svg>

        {valgt && pekt !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${(x(pekt) / B) * 100}%`,
              top: 0,
              transform: `translate(${pekt > punkter.length / 2 ? 'calc(-100% - 12px)' : '12px'}, 0)`,
              background: '#fff',
              border: '1px solid rgba(2,34,105,0.12)',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(2,34,105,0.14)',
              padding: '9px 13px',
              fontSize: 12.5,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 3 }}>{valgt.etikett}</div>
            <div>
              {t('diagram.visninger')}: <b style={{ fontVariantNumeric: 'tabular-nums' }}>{valgt.visninger}</b>
            </div>
            {medUnike && (
              <div>
                {t('diagram.unike')}: <b style={{ fontVariantNumeric: 'tabular-nums' }}>{valgt.unike}</b>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Liten énseries linje til oversikten – ingen akser, bare formen. */
export function Sparklinje({ verdier }: { verdier: number[] }) {
  const b = 220
  const h = 56
  const maks = Math.max(1, ...verdier)
  const x = (i: number) => (verdier.length < 2 ? b / 2 : (i / (verdier.length - 1)) * b)
  const y = (v: number) => h - 5 - (v / maks) * (h - 10)
  const sti = verdier.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${b} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden>
      <path
        d={`${sti} L${b},${h} L0,${h} Z`}
        fill="rgba(34,79,177,0.09)"
        stroke="none"
      />
      <path d={sti} fill="none" stroke={SERIE_A} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/** Vannrette stolper med tall – til «mest sett», kilder og enheter. */
export function Stolper({
  rader,
  tom,
}: {
  rader: { navn: string; verdi: number }[]
  tom: string
}) {
  const maks = Math.max(1, ...rader.map((r) => r.verdi))
  if (rader.length === 0) {
    return <div style={{ fontSize: 13.5, color: 'var(--tekst-svak)' }}>{tom}</div>
  }
  return (
    <div className="adm-stolper">
      {rader.map((r) => (
        <div key={r.navn} className="adm-stolpe" title={r.navn}>
          <span className="adm-stolpe-navn">{r.navn}</span>
          <span className="adm-stolpe-spor">
            <span className="adm-stolpe-fyll" style={{ width: `${(r.verdi / maks) * 100}%` }} />
          </span>
          <span className="adm-stolpe-tall">{r.verdi}</span>
        </div>
      ))}
    </div>
  )
}
