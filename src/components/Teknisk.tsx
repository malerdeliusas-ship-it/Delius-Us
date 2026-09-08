import { C, FONT } from '../lib/theme'

/**
 * «Teknisk»-listen under kortet ved siden av tilbudsskjemaet, som tegnet i
 * Figma. Den står både på Kontakt-siden og på forsiden, men med litt ulik
 * linjeavstand i de to rammene, så avstandene sendes inn.
 *
 * `rader` er avstanden ned fra overskriften til hver av de fire linjene,
 * i piksler, i den rekkefølgen de står i designet.
 */

const LINJER = [
  '✓ Feltene merkes tydelig og           valideres',
  '✓ Varsel sendes til riktig e-post',
  '✓ Bilder kan gjøres valgfrie',
  '✓ GDPR-vennlig håndtering',
]

export default function Teknisk({
  l,
  t,
  rader,
}: {
  l: number
  t: number
  rader: [number, number, number, number]
}) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: l,
          top: t,
          width: 294,
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 700,
          lineHeight: '42px',
          color: C.navy,
        }}
      >
        Teknisk
      </div>
      {LINJER.map((tekst, i) => (
        <div
          key={tekst}
          style={{
            position: 'absolute',
            left: l,
            top: t + rader[i],
            width: 294,
            fontFamily: FONT,
            fontSize: 20,
            fontWeight: 400,
            lineHeight: '30px',
            color: C.navy,
            // pre-wrap, som i Txt: designet har flere mellomrom på rad
            whiteSpace: 'pre-wrap',
          }}
        >
          {tekst}
        </div>
      ))}
    </>
  )
}
