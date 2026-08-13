import Stage from '../components/Stage'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import GoldButton from '../components/GoldButton'
import { Txt, Img, Rect, CropImg } from '../components/prim'
import { C } from '../lib/theme'

/** Figmas beskjæringer (imageTransform). */
const TF_TEAM: [[number, number, number], [number, number, number]] =
  [[0.9646841287612915, 0, 0.03531598299741745], [0, 0.9466233253479004, 0.00014755639131180942]]
const TF_SPRUT: [[number, number, number], [number, number, number]] =
  [[0.9979108572006226, 0, 0], [0, 0.47440609335899353, 0.00016262807184830308]]

import splash from '../assets/figma/splash-omoss.png'
import teamBilde from '../assets/figma/omoss-team.jpg'
import foto1 from '../assets/figma/omoss-dsc06303-1.jpg'
import foto2 from '../assets/figma/omoss-dsc07360-1.jpg'
import foto3 from '../assets/figma/omoss-1-119-1.jpg'
import foto4 from '../assets/figma/omoss-dsc05502-1.jpg'

/** «Hvorfor velge oss?» – to spalter, med egne rammer fra Figma. */
export const GRUNNER = [
  { l: 734, t: 607, w: 274, bT: 649, bW: 274, farge: C.gold, tittel: 'Individuell tilnærming', brod: 'Vi lytter til våre kunder og tilbyr løsninger som passer perfekt til dine behov.' },
  { l: 734, t: 758, w: 295, bT: 800, bW: 286, farge: C.gold, tittel: 'Miljøansvar', brod: 'Vi bruker kun miljøvennlige materialer og tar hensyn til både din helse og miljøet.' },
  { l: 734, t: 908, w: 281, bT: 950, bW: 281, farge: C.gold, tittel: 'Kvalitet og pålitelighet', brod: 'Vi garanterer høy kvalitet og varighet på vårt.' },
  { l: 1040, t: 607, w: 256, bT: 649, bW: 256, farge: C.goldAlt, tittel: 'Garantier og støtte', brod: 'Vi tilbyr garantier på alt vårt arbeid og er alltid klare til å gi støtte etter prosjektets avslutning.' },
  { l: 1040, t: 800, w: 256, bT: 842, bW: 256, farge: C.goldAlt, tittel: 'Lokal erfaring', brod: 'Som et selskap som opererer i Oslo, har vi god kjennskap til de lokale forholdene og kan tilby de mest effektive løsningene for ditt prosjekt.' },
]

const GALLERI = [
  { src: foto1, l: 124, w: 249, alt: 'Maler ruller maling på vegg' },
  { src: foto2, l: 438, w: 249, alt: 'Maler arbeider rundt et vindu' },
  { src: foto3, l: 753, w: 250, alt: 'Maler på gulvet under arbeid' },
  { src: foto4, l: 1061, w: 250, alt: 'Maler med hørselvern i arbeid' },
]

export default function OmOss() {
  return (
    <Stage height={1858}>
      <Rect l={0} t={514} w={1430} h={1100} bg={C.panelBlue} />

      <SiteHeader logoL={51} logoW={278} navL={625} />

      <CropImg
        src={teamBilde}
        alt="Teamet i Maler Delius AS"
        loading="eager"
        l={124}
        t={385}
        w={509}
        h={749}
        r={67}
        tf={TF_TEAM}
      />

      <Txt l={130} t={328} w={500} size={28} weight={400} lh={42} color={C.navy} italic>
        {'Velkommen til   '}
        <span style={{ fontWeight: 700, fontStyle: 'normal' }}>MALER DELIUS AS</span>
      </Txt>
      <Txt l={699} t={328} w={612} size={20} weight={500} lh={32.6} ls={1.2} color={C.navy}>
        Vi er Maler Delius AS, et team av profesjonelle med over 5 års erfaring, som tilbyr
        høykvalitets maler- og reparasjonstjenester i Oslo. Vårt mål er å gjøre ditt rom mer
        hyggelig, moderne og behagelig for både liv og arbeid.
      </Txt>

      <Txt l={734} t={546} w={279} size={28} weight={600} lh={42} color={C.white} italic>
        Hvorfor velge oss?
      </Txt>
      {GRUNNER.map((g) => (
        <div key={g.tittel}>
          <Txt l={g.l} t={g.t} w={g.w} size={20} weight={700} lh={30} color={g.farge}>
            {g.tittel}
          </Txt>
          <Txt l={g.l} t={g.bT} w={g.bW} size={18} weight={400} lh={27} color={C.white}>
            {g.brod}
          </Txt>
        </div>
      ))}
      <GoldButton l={734} t={1077} w={176} label="Kontakt oss" color={C.brown} />

      {GALLERI.map((f) => (
        <Img key={f.l} src={f.src} alt={f.alt} l={f.l} t={1197} w={f.w} h={374} r={67} />
      ))}

      {/* Akvarellsølet ligger øverst i lagrekkefølgen, som i Figma */}
      <CropImg src={splash} l={-3} t={96} w={1433} h={236} r={25} tf={TF_SPRUT} loading="eager" />

      <SiteFooter t={1614} />
    </Stage>
  )
}
