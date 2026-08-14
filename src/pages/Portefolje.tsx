import Stage from '../components/Stage'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import { Txt, Img, Rect, CropImg } from '../components/prim'
import { C, FONT_MUKTA } from '../lib/theme'

import splash from '../assets/figma/splash.webp'
import anmeldelser from '../assets/figma/mittanbud-anmeldelser.jpg'
import icTeam from '../assets/figma/ic-team.png'
import f06530 from '../assets/figma/portefolje-dsc06530-1.jpg'
import f06515 from '../assets/figma/portefolje-dsc06515-1.jpg'
import f06535 from '../assets/figma/portefolje-dsc06535-1.jpg'
import f05791 from '../assets/figma/portefolje-dsc05791-1.jpg'
import f07386 from '../assets/figma/portefolje-dsc07386-1.jpg'
import f07295 from '../assets/figma/portefolje-dsc07295-1.jpg'
import f05793 from '../assets/figma/portefolje-dsc05793-1.jpg'
import f05812 from '../assets/figma/portefolje-dsc05812-1.jpg'
import f05797 from '../assets/figma/portefolje-dsc05797-1.jpg'
import f02723 from '../assets/figma/portefolje-dsc02723-1.jpg'
import f02756 from '../assets/figma/portefolje-dsc02756-1.jpg'
import f02672 from '../assets/figma/portefolje-dsc02672-1.jpg'
import f02620 from '../assets/figma/portefolje-dsc02620-1.jpg'

const BAND = [
  { l: -5, t: 376, w: 1435, h: 669, bg: C.pf[0] },
  { l: 0, t: 990, w: 1430, h: 669, bg: C.pf[1] },
  { l: 0, t: 1609, w: 1432, h: 669, bg: C.pf[2] },
  { l: 0, t: 2246, w: 1427, h: 669, bg: C.pf[3] },
  { l: 0, t: 2874, w: 1432, h: 932, bg: C.pf[4] },
]

export const KORT = [
  {
    boks: { l: 495, t: 460, w: 816, h: 466 }, ikon: { l: 1107.5, t: 487 },
    tittel: { l: 1004, t: 683, w: 273, tekst: 'Profesjonell interiørmaling' },
    brod: { l: 1004, t: 780, w: 295, tekst: 'Med nøye fargevalg og profesjonelt håndverk skaper vi harmoniske rom med et elegant og varig resultat.' },
  },
  {
    boks: { l: 119, t: 1086, w: 784, h: 453 }, ikon: { l: 273.5, t: 1113 },
    tittel: { l: 170, t: 1284, w: 273, tekst: 'Renovering av rom' },
    brod: { l: 170, t: 1396, w: 295, tekst: 'Vi oppgraderer eksisterende rom for å forbedre funksjonalitet, estetikk og komfort.' },
  },
  {
    boks: { l: 936, t: 1727, w: 715, h: 453 }, ikon: { l: 1141.5, t: 1754 },
    tittel: { l: 1038, t: 1904, w: 273, tekst: 'Restaurering av detaljer' },
    brod: { l: 1038, t: 2016, w: 295, tekst: 'Med presist håndverk bevarer og fremhever vi historiske takdetaljer, rosetter og dekorative elementer.' },
  },
  {
    boks: { l: 119, t: 2310, w: 784, h: 526 }, ikon: { l: 320.5, t: 2337 },
    tittel: { l: 217, t: 2487, w: 273, tekst: 'Materialer av høy kvalitet' },
    brod: { l: 217, t: 2599, w: 295, tekst: 'Vi bruker nøye utvalgte produkter og materialer av høy kvalitet for å sikre et jevnt, slitesterkt og profesjonelt resultat.' },
  },
]

/**
 * Figmas beskjæringer. De fleste bildene her er eksportert ferdig rendret fra
 * Figma (med fargejustering, beskjæring og speiling bakt inn), så bare disse
 * to trenger et utsnitt i koden.
 */
const TF_SPRUT: [[number, number, number], [number, number, number]] =
  [[0.9999397993087769, 0, 0.00003007479062944185], [0, 0.4989980161190033, 0]]
const TF_02672: [[number, number, number], [number, number, number]] =
  [[0.998793363571167, 0, 0.0006032608798705041], [0, 0.4056399166584015, 0.19956615567207336]]
const TF_02620: [[number, number, number], [number, number, number]] =
  [[0.734415590763092, 0, 0], [0, 0.6692269444465637, 0.2814437747001648]]

export default function Portefolje() {
  return (
    <Stage height={4050}>
      {BAND.map((b) => (
        <Rect key={b.t} l={b.l} t={b.t} w={b.w} h={b.h} r={83} bg={b.bg} />
      ))}

      <SiteHeader />
      <CropImg src={splash} l={-6} t={96} w={1441} h={249} r={25} tf={TF_SPRUT} loading="eager" />

      <Txt as="h1" l={606} t={286} w={217} size={40} weight={800} lh={60} color={C.navy}>
        Portefølje
      </Txt>

      {/* Bilder som ligger under kortene */}
      <Img src={f07386} alt="Ferdig malt rom" l={935} t={1022} w={375} h={556} r={57} />
      <Img src={f07295} alt="Malt stue" l={119} t={1648} w={510} h={287} r={67} />
      <Img src={f05797} alt="Detalj av takliste" l={552} t={2025} w={326} h={159} r={67} />
      <Img src={f02756} alt="Malerarbeid i gang" l={936} t={2287} w={375} h={563} r={67} />

      {/* De fire tekstkortene */}
      {KORT.map((k) => (
        <div key={k.tittel.tekst}>
          <Rect l={k.boks.l} t={k.boks.t} w={k.boks.w} h={k.boks.h} r={67} bg={C.cardWhite} />
          <img
            src={icTeam}
            alt=""
            style={{ position: 'absolute', left: k.ikon.l, top: k.ikon.t, width: 88, height: 87, opacity: 0.86 }}
          />
          <Txt l={k.tittel.l} t={k.tittel.t} w={k.tittel.w} size={36} weight={700} lh={36.72} color={C.panelBlue}>
            {k.tittel.tekst}
          </Txt>
          <Txt
            l={k.brod.l}
            t={k.brod.t}
            w={k.brod.w}
            size={24}
            weight={400}
            lh={26.16}
            color={C.navy}
            font={FONT_MUKTA}
          >
            {k.brod.tekst}
          </Txt>
        </div>
      ))}

      {/* Bilder som ligger oppå kortene */}
      <Img src={f05793} alt="Restaurert murvegg" l={659} t={1648} w={219} h={324} r={67} />
      <Img src={f05791} alt="Rom under oppussing" l={598} t={1086} w={305} h={453} r={67} />
      <Img src={f06535} alt="Nymalt rom" l={495} t={717} w={391} h={209} r={67} />
      <Img src={f06530} alt="Rom klart til maling" l={119} t={454} w={315} h={472} r={67} />
      <Img src={f06515} alt="Malt rom med lyst tak" l={495} t={454} w={440} h={227} r={67} />
      <Img src={f05812} alt="Takdetalj etter restaurering" l={119} t={1954} w={412} h={232} r={67} />
      <Img src={f02723} alt="Malingsprøver på vegg" l={699} t={2310} w={204} h={306} r={67} />
      <CropImg src={f02672} alt="Malingsspann og verktøy" l={597} t={2650} w={306} h={186} r={67} tf={TF_02672} />

      {/* ---------- Tall og anmeldelser ---------- */}
      <Img src={anmeldelser} alt="Kundevurderinger av Maler Delius AS på Mittanbud" l={449} t={3395} w={862} h={326} r={67} />

      <Rect l={1038} t={2990} w={273} h={326} r={67} bg={C.white} />
      <Txt l={1074} t={3088} w={201} size={48} weight={700} lh={72} color={C.black} align="center">
        +300
      </Txt>
      <Txt l={1074} t={3160} w={201} size={24} weight={700} lh={36} color={C.black} align="center">
        utførte arbeider
      </Txt>

      <Rect l={732} t={2983} w={273} h={326} r={67} bg={C.white} />
      <Txt l={768} t={3081} w={201} size={48} weight={700} lh={72} color={C.black} align="center">
        +7
      </Txt>
      <Txt l={768} t={3153} w={201} size={24} weight={700} lh={36} color={C.black} align="center">
        År i Bransjen
      </Txt>

      <Rect l={119} t={3395} w={259} h={329} r={67} bg={C.white} />
      <Txt l={148} t={3485} w={201} size={48} weight={700} lh={72} color={C.black} align="center">
        57
      </Txt>
      <Txt l={148} t={3557} w={201} size={24} weight={700} lh={36} color={C.black} align="center">
        {'vurderinger på '}
        <span style={{ color: C.mittanbud }}>Mittanbud</span>
      </Txt>

      <CropImg src={f02620} alt="Skilt fra Maler Delius AS på byggeplass" l={119} t={2985} w={536} h={326} r={67} tf={TF_02620} />

      <SiteFooter t={3806} />
    </Stage>
  )
}
