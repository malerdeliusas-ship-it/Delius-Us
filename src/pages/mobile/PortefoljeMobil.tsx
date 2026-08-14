import MobilSide from '../../components/mobile/Shell'
import { C, FONT_MUKTA, BEDRIFT } from '../../lib/theme'
import { KORT } from '../Portefolje'

import splash from '../../assets/figma/splash.webp'
import icTeam from '../../assets/figma/ic-team.png'
import anmeldelser from '../../assets/figma/mittanbud-anmeldelser.jpg'
import f06530 from '../../assets/figma/portefolje-dsc06530-1.jpg'
import f06515 from '../../assets/figma/portefolje-dsc06515-1.jpg'
import f06535 from '../../assets/figma/portefolje-dsc06535-1.jpg'
import f05791 from '../../assets/figma/portefolje-dsc05791-1.jpg'
import f07386 from '../../assets/figma/portefolje-dsc07386-1.jpg'
import f07295 from '../../assets/figma/portefolje-dsc07295-1.jpg'
import f05793 from '../../assets/figma/portefolje-dsc05793-1.jpg'
import f05812 from '../../assets/figma/portefolje-dsc05812-1.jpg'
import f05797 from '../../assets/figma/portefolje-dsc05797-1.jpg'
import f02723 from '../../assets/figma/portefolje-dsc02723-1.jpg'
import f02756 from '../../assets/figma/portefolje-dsc02756-1.jpg'
import f02672 from '../../assets/figma/portefolje-dsc02672-1.jpg'
import f02620 from '../../assets/figma/portefolje-dsc02620-1.jpg'

/** Samme fire blokker som på desktop, med bildene som hører til hver av dem. */
const BLOKKER = [
  { bg: C.pf[0], bilder: [f06530, f06515, f06535], alt: ['Rom klart til maling', 'Malt rom med lyst tak', 'Nymalt rom'] },
  { bg: C.pf[1], bilder: [f05791, f07386], alt: ['Rom under oppussing', 'Ferdig malt rom'] },
  { bg: C.pf[2], bilder: [f07295, f05793, f05812, f05797], alt: ['Malt stue', 'Restaurert murvegg', 'Takdetalj etter restaurering', 'Detalj av takliste'] },
  { bg: C.pf[3], bilder: [f02723, f02756, f02672], alt: ['Malingsprøver på vegg', 'Malerarbeid i gang', 'Malingsspann og verktøy'] },
]

const TALL = [
  { tall: '+7', tekst: 'År i Bransjen' },
  { tall: '+300', tekst: 'utførte arbeider' },
]

export default function PortefoljeMobil() {
  return (
    <MobilSide>
      <img
        src={splash}
        alt=""
        style={{ display: 'block', width: '100%', height: 90, objectFit: 'cover', objectPosition: 'top' }}
      />

      <section className="m-inn" style={{ paddingTop: 32, paddingBottom: 8 }}>
        <h2>Portefølje</h2>
      </section>

      {BLOKKER.map((b, i) => (
        <section key={i} className="m-seksjon m-inn" style={{ background: b.bg }}>
          <img src={icTeam} alt="" width={72} height={71} style={{ opacity: 0.86 }} />
          <h3 style={{ marginTop: 16, fontSize: 26, color: C.panelBlue }}>{KORT[i].tittel.tekst}</h3>
          <p style={{ marginTop: 12, fontFamily: FONT_MUKTA, fontSize: 18, lineHeight: '24px' }}>
            {KORT[i].brod.tekst}
          </p>
          <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
            {b.bilder.map((src, j) => (
              <img key={j} className="m-bilde" src={src} alt={b.alt[j]} />
            ))}
          </div>
        </section>
      ))}

      {/* ---------- Tall og anmeldelser ---------- */}
      <section className="m-seksjon m-inn" style={{ background: C.pf[4] }}>
        <img className="m-bilde" src={f02620} alt="Skilt fra Maler Delius AS på byggeplass" />

        <div className="m-rutenett m-rutenett--2" style={{ marginTop: 18 }}>
          {TALL.map((t) => (
            <div key={t.tall} className="m-kort m-kort--hvit" style={{ textAlign: 'center', color: C.black }}>
              <div style={{ fontSize: 38, lineHeight: '48px', fontWeight: 700 }}>{t.tall}</div>
              <div style={{ fontSize: 17, lineHeight: '24px', fontWeight: 700 }}>{t.tekst}</div>
            </div>
          ))}
        </div>

        <div
          className="m-kort m-kort--hvit"
          style={{ marginTop: 18, textAlign: 'center', color: C.black }}
        >
          <div style={{ fontSize: 38, lineHeight: '48px', fontWeight: 700 }}>57</div>
          <div style={{ fontSize: 17, lineHeight: '24px', fontWeight: 700 }}>
            vurderinger på <span style={{ color: C.mittanbud }}>Mittanbud</span>
          </div>
        </div>

        <a
          href={BEDRIFT.mittanbud}
          target="_blank"
          rel="noreferrer"
          aria-label="Se vurderingene våre på Mittanbud"
        >
          <img
            className="m-bilde"
            src={anmeldelser}
            alt="Kundevurderinger av Maler Delius AS på Mittanbud"
            style={{ marginTop: 18 }}
          />
        </a>
      </section>
    </MobilSide>
  )
}
