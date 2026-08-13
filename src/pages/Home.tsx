import Stage from '../components/Stage'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import GoldButton from '../components/GoldButton'
import ContactForm from '../components/ContactForm'
import { Abs, Txt, Img, Rect, CropImg } from '../components/prim'
import { C, G, FONT } from '../lib/theme'
import { TEAM, TJENESTER } from '../lib/site'

import heroBilde from '../assets/figma/hero-echipa.jpg'
import omOssBilde from '../assets/figma/omoss-team.jpg'
import icTeam from '../assets/figma/ic-team.png'
import icKvalitet from '../assets/figma/ic-kvalitet.png'
import icGaranti from '../assets/figma/ic-garanti.png'

/** Maskeformen over hero-bildet, fra vektoren i Figma (796.5 x 534.5). */
const HERO_MASK = 'polygon(20.213% 41.722%, 0% 100%, 100% 100%, 100% 0%, 43.692% 0%)'

/** Figmas beskjæringer (imageTransform) på bildefyllene. */
const TF_LOGO: [[number, number, number], [number, number, number]] =
  [[0.769784152507782, 0, 0.21223022043704987], [0, 0.9972774982452393, 0.0013612788170576096]]
const TF_HERO: [[number, number, number], [number, number, number]] =
  [[0.9834954738616943, 0, 0.016504546627402306], [0, 0.952681839466095, 0.023504769429564476]]
const TF_OMOSS: [[number, number, number], [number, number, number]] =
  [[0.964684009552002, 0, 0.03531598299741745], [0, 0.8935415744781494, 0.053229235112667084]]

export const BADGES = [
  { l: 100, bg: C.gold, ic: icTeam, icL: 146.5, op: 0.86, txtL: 280.5, w: 183, farge: C.navy, tekst: 'Profesjonelt \nTeam' },
  { l: 510, bg: C.navy, ic: icKvalitet, icL: 593.5, op: 1, txtL: 727.5, w: 109, farge: C.goldText, tekst: 'Høy \nKvalitet' },
  { l: 920, bg: C.gold, ic: icGaranti, icL: 974.5, op: 0.86, txtL: 1108.5, w: 167, farge: C.navy, tekst: 'Garanti og \nPålitelighet' },
]

/** «Hvorfor velge oss?» – tittel og brødtekst med hver sin ramme fra Figma. */
export const GRUNNER = [
  { l: 716, t: 1161, w: 295, bT: 1203, bW: 295, tittel: 'Individuell tilnærming', brod: 'Vi lytter til våre kunder og tilbyr løsninger som passer perfekt til dine behov.', farge: C.reasonBody },
  { l: 716, t: 1321, w: 295, bT: 1363, bW: 295, tittel: 'Miljøansvar', brod: 'Vi bruker kun miljøvennlige materialer og tar hensyn til både din helse og miljøet.', farge: C.navy },
  { l: 716, t: 1471, w: 281, bT: 1513, bW: 281, tittel: 'Kvalitet og pålitelighet', brod: 'Vi garanterer høy kvalitet og varighet på vår', farge: C.navy },
  { l: 1033, t: 1161, w: 277, bT: 1203, bW: 277, tittel: 'Garantier og støtte', brod: 'Vi tilbyr garantier på alt vårt arbeid og er alltid klare til å gi støtte etter prosjektets avslutning.', farge: C.navy },
  { l: 1033, t: 1354, w: 277, bT: 1396, bW: 277, tittel: 'Lokal erfaring', brod: 'Som et selskap som opererer i Oslo, har vi god kjennskap til de lokale forholdene og kan tilby de mest effektive løsningene for ditt prosjekt.', farge: C.navy },
]

const KORT_POS = [
  [124, 178], [532, 178], [940, 178],
  [124, 755], [532, 755], [940, 755],
]

export default function Home() {
  return (
    <Stage height={5488}>
      {/* ---------- Hero ---------- */}
      <Abs l={0} t={0} w={1430} h={837} style={{ background: C.cream, overflow: 'hidden' }}>
        <SiteHeader logoL={118.5} logoW={214} navL={625.5} logoTf={TF_LOGO} />

        <Txt l={118} t={220.25} w={580} size={56} weight={700} lh={63.28} ls={2.24} color={C.navyH1}>
          Profesjonell maling for hjem og bedrifter i Oslo
        </Txt>
        <Txt l={118} t={436.25} w={578} size={18} weight={600} lh={27} color="rgba(2,34,105,0.65)">
          {'Vi holder til i Oslo og spesialiserer oss på å levere førsteklasses maler- og reparasjonstjenester.  Vår misjon er å forvandle rom ved å tilføre komfort og trivsel i hvert hjem og kontor.'}
        </Txt>
        <GoldButton l={118} t={544.25} w={267} label="Bestill gratis befaring" />

        {/* Skyggen ligger på et ytre lag – clip-path ville ellers klippe den bort */}
        <Abs l={706} t={144} w={796.5} h={534.5} style={{ filter: 'drop-shadow(-17px 4px 21.7px rgba(0,0,0,0.25))' }}>
          <Abs l={0} t={0} w={796.5} h={534.5} style={{ clipPath: HERO_MASK, overflow: 'hidden' }}>
            <CropImg
              src={heroBilde}
              alt="Malere fra Maler Delius AS i arbeid"
              loading="eager"
              l={-50}
              t={-4}
              w={833}
              h={538}
              tf={TF_HERO}
              style={{ transform: 'scaleX(-1)' }}
            />
          </Abs>
        </Abs>

        {/* De tre feltene nederst. Figma klipper dem ved 837px, det gjør vi også. */}
        {BADGES.map((b) => (
          <Abs key={b.l} l={b.l} t={726.5} w={410} h={117} style={{ background: b.bg }}>
            <img
              src={b.ic}
              alt=""
              style={{ position: 'absolute', left: b.icL - b.l, top: 11.5, width: 94, height: 94, opacity: b.op }}
            />
            <Txt l={b.txtL - b.l} t={24.5} w={b.w} size={28} weight={600} lh={34.13} color={b.farge}>
              {b.tekst}
            </Txt>
          </Abs>
        ))}
      </Abs>

      {/* ---------- Velkommen / Hvorfor velge oss ---------- */}
      <CropImg src={omOssBilde} alt="Teamet i Maler Delius AS" l={120} t={951} w={519} h={721} tf={TF_OMOSS} />

      <Txt l={120} t={892} w={500} size={28} weight={400} lh={42} color={C.navy} italic>
        {'Velkommen til   '}
        <span style={{ fontWeight: 700, fontStyle: 'normal' }}>MALER DELIUS AS</span>
      </Txt>
      <Txt l={710} t={892} w={591} size={20} weight={400} lh={30} color={C.navy} italic>
        Vi er Maler Delius AS, et team av profesjonelle med over 5 års erfaring, som tilbyr
        høykvalitets maler- og reparasjonstjenester i Oslo. Vårt mål er å gjøre ditt rom mer
        hyggelig, moderne og behagelig for både liv og arbeid.
      </Txt>

      <Txt l={716} t={1100} w={279} size={28} weight={600} lh={42} color={C.navy} italic>
        Hvorfor velge oss?
      </Txt>
      {GRUNNER.map((g) => (
        <div key={g.tittel}>
          <Txt l={g.l} t={g.t} w={g.w} size={20} weight={700} lh={30} color={C.gold}>
            {g.tittel}
          </Txt>
          <Txt l={g.l} t={g.bT} w={g.bW} size={20} weight={400} lh={30} color={g.farge}>
            {g.brod}
          </Txt>
        </div>
      ))}
      <GoldButton l={716} t={1614} w={176} label="Kontakt oss" color={C.brown} />

      {/* ---------- Vårt team ---------- */}
      <Abs l={0} t={1714} w={1430} h={1312} style={{ background: G.team, overflow: 'hidden' }}>
        <Txt l={605} t={37} w={222} size={40} weight={800} lh={60} color={C.navy}>
          Vårt team
        </Txt>
        {TEAM.map((p) => (
          <div key={p.navn}>
            <Img src={p.bilde} alt={p.navn.trim()} l={p.iL} t={p.iT - 1714} w={p.iW} h={p.iH} r={p.r} />
            <Txt
              l={p.nL}
              t={p.nT - 1714}
              w={p.nW}
              size={25}
              weight={800}
              lh={37.5}
              color={C.navy}
              align={'senter' in p && p.senter ? 'center' : 'left'}
            >
              {p.navn}
            </Txt>
            <Txt
              l={p.mL}
              t={p.mT - 1714}
              w={p.mW}
              size={18}
              weight={700}
              lh={27}
              color={C.teamMeta}
              align={p.metaSenter ? 'center' : 'left'}
            >
              {p.meta}
            </Txt>
          </div>
        ))}
      </Abs>

      {/* ---------- Våre tjenester ---------- */}
      <Abs l={-5} t={3026} w={1435} h={1343} style={{ background: G.tjenester, overflow: 'hidden' }}>
        <Txt l={124} t={67} w={1187} size={40} weight={800} lh={60} color={C.navy} align="center">
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
              style={{ position: 'absolute', left: s.iL + 5, top: s.iT - 3026, width: s.iW, height: s.iH }}
            />
            {s.titler.map((tt, i) => (
              <Txt
                key={i}
                l={tt.l + 5}
                t={tt.t - 3026}
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
            <Txt l={s.bL + 5} t={s.bT - 3026} w={s.bW} size={20} weight={400} lh={30} color={C.brown}>
              {s.brod}
            </Txt>
          </div>
        ))}
      </Abs>

      {/* ---------- Kontakt oss ---------- */}
      <Abs l={0} t={4369} w={1430} h={875} style={{ background: C.contactBlue, overflow: 'hidden' }}>
        <Txt l={449.5} t={96} w={543} size={40} weight={800} lh={60} color={C.white} align="center">
          Kontakt oss!
        </Txt>
        <Abs
          l={628}
          t={176}
          w={186}
          h={39}
          style={{
            background: C.gold,
            borderRadius: 41,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 400,
            lineHeight: '22.5px',
            color: C.black,
          }}
        >
          GRATIS BEFARING
        </Abs>
        <Txt l={449.5} t={247} w={543} size={16} weight={400} lh={24} color={C.white} align="center">
          Vi skaper en atmosfære du vil vende tilbake til, med Maler Delius AS
        </Txt>
        <Txt l={594} t={793} w={242} size={20} weight={400} lh={30} color="rgba(2,34,105,0.51)" align="center">
          Profesjonelle arbeidere
        </Txt>
      </Abs>
      <ContactForm l={432} t={4666} w={578} btnL={633} btnW={176} />

      <SiteFooter t={5244} />
    </Stage>
  )
}
