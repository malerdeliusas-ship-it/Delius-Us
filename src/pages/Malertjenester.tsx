import Stage from '../components/Stage'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import GoldButton from '../components/GoldButton'
import { Abs, Txt, Rect, CropImg } from '../components/prim'
import { C, MT_OVERLAY, FONT } from '../lib/theme'
import { TJENESTER } from '../lib/site'
import splash from '../assets/figma/splash.webp'

/** Tjenestekortene står likt som på forsiden, bare flyttet (+6, −2780). */
const DX = 6
const DY = -2780

const KORT_POS = [
  [125, 424], [533, 424], [941, 424],
  [125, 1001], [533, 1001], [941, 1001],
]

export const TRINN = [
  {
    kort: 125,
    tittel: { l: 189, t: 1796, w: 363, tekst: 'Konsultasjon og planlegging' },
    punkter: [
      { l: 189, t: 1923, w: 262, tekst: 'Gratis innledende konsultasjon' },
      { l: 189, t: 1997, w: 217, tekst: 'Vurdering av rommet' },
      { l: 189, t: 2041, w: 277, tekst: 'Valg av farger og materialer' },
      { l: 189, t: 2077, w: 267, tekst: 'Utarbeidelse av forslag og kostnadsoverslag' },
    ],
    merke: { l: 222, t: 2181, w: 159, tekst: 'TRINN 1' },
  },
  {
    kort: 531,
    tittel: { l: 604, t: 1797, w: 260, tekst: 'Forberedelse og utførelse' },
    punkter: [
      { l: 600, t: 1916, w: 262, tekst: 'Forberedelse av overflater' },
      { l: 599, t: 1953, w: 259, tekst: 'Beskyttelse av tilstøtende områder' },
      { l: 600, t: 2012, w: 277, tekst: 'Utførelse av malerarbeid' },
      { l: 600, t: 2052, w: 267, tekst: 'Kvalitetskontroll under arbeidet' },
    ],
    merke: { l: 639, t: 2180, w: 164, tekst: 'TRINN 2' },
  },
  {
    kort: 945,
    tittel: { l: 1001, t: 1796, w: 263, tekst: 'Fullføring og støtte' },
    punkter: [
      { l: 1001, t: 1896, w: 262, tekst: 'Endelig kvalitetskontroll' },
      { l: 1001, t: 1930, w: 320, tekst: 'Rydding og overlevering av prosjektet — vi rydder alltid etter oss' },
      { l: 1001, t: 2033, w: 201, tekst: 'Sikring av garantier' },
      { l: 1000, t: 2076, w: 235, tekst: 'Støtte etter prosjektets avslutning' },
    ],
    merke: { l: 1053, t: 2181, w: 158, tekst: 'TRINN 3' },
  },
]

export default function Malertjenester() {
  return (
    <Stage height={2838}>
      {/* Akvarellsølet ligger under gradienten, akkurat som i Figma */}
      <CropImg
        src={splash}
        l={-5}
        t={96}
        w={1441}
        h={272}
        r={25}
        loading="eager"
        tf={[[0.9999397397041321, 0, 0.00003007479062944185], [0, 0.5450901985168457, 0]]}
      />
      <Abs l={1} t={0} w={1429} h={2594} style={{ background: MT_OVERLAY }} />

      <SiteHeader />

      <Txt as="h1" l={550} t={309} w={331} size={40} weight={800} lh={60} color={C.navy}>
        Våre tjenester
      </Txt>

      {KORT_POS.map(([l, t]) => (
        <Rect key={`${l}-${t}`} l={l} t={t} w={376} h={520} r={67} bg={C.cardWhite} />
      ))}
      {TJENESTER.map((s) => (
        <div key={s.id}>
          <img
            src={s.ikon}
            alt=""
            style={{ position: 'absolute', left: s.iL + DX, top: s.iT + DY, width: s.iW, height: s.iH }}
          />
          {s.titler.map((tt, i) => (
            <Txt
              key={i}
              l={tt.l + DX}
              t={tt.t + DY}
              w={tt.w}
              size={28}
              weight={700}
              lh={42}
              color={C.navy}
              align={tt.align}
            >
              {tt.tekst}
            </Txt>
          ))}
          <Txt l={s.bL + DX} t={s.bT + DY} w={s.bW} size={20} weight={400} lh={30} color={C.brown}>
            {s.brod}
          </Txt>
        </div>
      ))}

      {/* ---------- Arbeidstrinn ---------- */}
      <Txt l={356} t={1649} w={697} size={40} weight={600} lh={60} color={C.black}>
        Arbeidstrinn med Maler Delius AS
      </Txt>
      {TRINN.map((tr) => (
        <div key={tr.merke.tekst}>
          <Rect l={tr.kort} t={1760} w={376} h={520} r={67} bg={C.cardWhite} />
          <Txt l={tr.tittel.l} t={tr.tittel.t} w={tr.tittel.w} size={28} weight={700} lh={42} color={C.navy}>
            {tr.tittel.tekst}
          </Txt>
          {tr.punkter.map((p) => (
            <Txt key={p.tekst} l={p.l} t={p.t} w={p.w} size={20} weight={400} lh={30} color={C.navy}>
              {p.tekst}
            </Txt>
          ))}
          <Abs
            l={tr.merke.l}
            t={tr.merke.t}
            w={tr.merke.w}
            h={66}
            style={{
              background: C.panelBlue,
              borderRadius: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT,
              fontSize: 24,
              fontWeight: 600,
              lineHeight: '36px',
              color: C.white,
            }}
          >
            {tr.merke.tekst}
          </Abs>
        </div>
      ))}

      {/* ---------- Avslutning ---------- */}
      <Txt l={502} t={2347} w={437} size={40} weight={700} lh={58} color={C.white}>
        Få en gratis befaring
      </Txt>
      <GoldButton l={617} t={2422} w={203} h={57} label="Kontakt oss" color={C.brown} />

      <SiteFooter t={2594} l={1} />
    </Stage>
  )
}
