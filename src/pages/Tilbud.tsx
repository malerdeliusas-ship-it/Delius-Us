import BloggStage from '../components/BloggStage'
import Shell from '../components/mobile/Shell'
import TilbudSkjema from '../components/TilbudSkjema'
import useIsMobile from '../lib/useIsMobile'
import { useTilbudSkjema } from '../lib/tilbud'
import { C, FONT, BEDRIFT } from '../lib/theme'

/**
 * /tilbud: siden der kunden ber om et uforpliktende tilbud. Kom til etter
 * ønske fra kunden (september 2026): det korte kontaktskjemaet ble for
 * tynt til å gi en pris, så her får maleren telefon, adresse, type jobb,
 * areal, ønsket tidspunkt og bilder i én forespørsel.
 *
 * Siden finnes ikke i Figma. Den er satt sammen av delene designet allerede
 * har: akvarellsølet og tittelen fra bloggsidene, den blå skjemaflaten fra
 * forsiden, det hvite kortet fra Kontakt-siden.
 */

const INTRO =
  'Fortell oss litt om jobben, så tar vi kontakt for gratis befaring og et konkret tilbud.'

const STEG = [
  {
    tittel: 'Du sender forespørselen',
    tekst: 'Det tar et par minutter, og du forplikter deg ikke til noe.',
  },
  {
    tittel: 'Vi ser på jobben',
    tekst: 'Bildene og målene gir oss et godt grunnlag for å vurdere jobben. Vi tar kontakt og avtaler gratis befaring når det trengs.',
  },
  {
    tittel: 'Du får et konkret tilbud',
    tekst: 'Etter befaringen får du en tydelig pris.',
  },
]

function Steg() {
  return (
    <aside className="tb-kort" aria-labelledby="tb-steg-tittel">
      <h2 id="tb-steg-tittel">Slik foregår det</h2>
      <ol className="tb-steg">
        {STEG.map((s, i) => (
          <li key={s.tittel}>
            <i aria-hidden="true">{i + 1}</i>
            <div>
              <strong>{s.tittel}</strong>
              <p>{s.tekst}</p>
            </div>
          </li>
        ))}
      </ol>
      <hr />
      <div className="tb-ring">
        Vil du heller snakke med oss?
        <a href={BEDRIFT.telefonLenke}>{BEDRIFT.telefon}</a>
      </div>
    </aside>
  )
}

export default function Tilbud() {
  const mobil = useIsMobile()
  // Tilstanden bor her, så den overlever byttet mellom mobil og desktop
  const skjema = useTilbudSkjema()

  if (mobil) {
    return (
      <Shell>
        <section className="m-seksjon m-inn" style={{ paddingBottom: 28, textAlign: 'center' }}>
          <h1 className="m-balanse">Få et uforpliktende tilbud</h1>
          <p style={{ marginTop: 14 }}>{INTRO}</p>
        </section>
        <TilbudSkjema s={skjema} />
        <section className="m-seksjon m-inn">
          <Steg />
        </section>
      </Shell>
    )
  }

  return (
    <BloggStage tittel="Få et uforpliktende tilbud">
      <div style={{ padding: '24px 119px 110px' }}>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 20,
            lineHeight: '30px',
            color: C.navy,
            textAlign: 'center',
            maxWidth: 820,
            margin: '0 auto 44px',
          }}
        >
          {INTRO}
        </p>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 800px', minWidth: 0 }}>
            <TilbudSkjema s={skjema} />
          </div>
          <div style={{ width: 360, flexShrink: 0 }}>
            <Steg />
          </div>
        </div>
      </div>
    </BloggStage>
  )
}
