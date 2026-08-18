import BloggStage from '../components/BloggStage'
import { C, FONT, FONT_MUKTA, BEDRIFT } from '../lib/theme'
import Shell from '../components/mobile/Shell'
import useIsMobile from '../lib/useIsMobile'

/**
 * Personvernerklæringen. Kort, konkret og på norsk: hva nettstedet faktisk
 * lagrer, hvor lenge, og hvem som kan se det. Siden er påkrevd så snart et
 * nettsted teller besøk eller tar imot skjemaer, og den er samtidig det
 * enkleste stedet å svare på spørsmål en kunde kan ha.
 *
 * Innholdet skal stemme med koden. Endres sporingen i src/lib/spor.ts eller
 * skjemaet i api/kontakt.ts, må teksten her endres i samme slengen.
 */
const OPPDATERT = '18. august 2026'

type Bolk = { tittel: string; avsnitt: string[] }

const BOLKER: Bolk[] = [
  {
    tittel: 'Hvem er ansvarlig',
    avsnitt: [
      `${BEDRIFT.navn}, ${BEDRIFT.adresse}, ${BEDRIFT.orgnr.replace('Org nr.', 'org.nr.')}, er ansvarlig for opplysningene som samles inn på ${BEDRIFT.nettsted}. Spørsmål sendes til ${BEDRIFT.epost}.`,
    ],
  },
  {
    tittel: 'Når du bruker kontaktskjemaet',
    avsnitt: [
      'Skjemaet sender navnet, e-postadressen og meldingen din videre til vår egen e-postkasse, slik at vi kan svare deg. Opplysningene brukes ikke til noe annet, og de deles ikke med noen for markedsføring.',
      'E-posten sendes gjennom leverandøren Resend, som håndterer selve utsendingen på våre vegne. Meldingen blir liggende i e-postkassen vår så lenge det er saklig grunn til det, normalt så lenge kundeforholdet varer. Du kan når som helst be oss slette henvendelsen din.',
    ],
  },
  {
    tittel: 'Besøksstatistikk',
    avsnitt: [
      'Vi teller hvor mange som besøker sidene våre, for å se hva folk faktisk er interessert i. Tellingen er vår egen, og den er laget for å vite minst mulig om deg.',
      'Vi lagrer hvilken side som ble vist, hvilket nettsted du eventuelt kom fra (bare domenenavnet, for eksempel google.com), om du er på mobil eller datamaskin, og et tilfeldig nummer som holder sammen sidene i ett og samme besøk. Nummeret ligger i nettleseren din og forsvinner når du lukker fanen.',
      'Vi lagrer ikke IP-adressen din, vi bruker ingen informasjonskapsler, og vi bruker verken Google Analytics, Facebook-piksel eller lignende sporing. Tallene kan ikke knyttes til deg som person, og de deles ikke med noen.',
    ],
  },
  {
    tittel: 'Skrifter og kart',
    avsnitt: [
      'Skrifttypene på nettstedet ligger på vår egen server, ikke hos Google, så nettleseren din trenger ikke kontakte noen tredjepart for å vise teksten.',
      'På kontaktsiden viser vi et kart fra Google Maps, så du finner fram til oss. Åpner du den siden, får Google vite at nettleseren din har hentet kartet. Vil du unngå det, kan du la være å besøke kontaktsiden og heller ringe eller sende e-post.',
    ],
  },
  {
    tittel: 'Rettighetene dine',
    avsnitt: [
      `Du har rett til å få vite hvilke opplysninger vi har om deg, få dem rettet eller slettet, og til å klage til Datatilsynet dersom du mener vi behandler opplysninger feil. Ta kontakt på ${BEDRIFT.epost}, så ordner vi det.`,
    ],
  },
]

function Innhold({ mobil }: { mobil: boolean }) {
  return (
    <div style={{ maxWidth: mobil ? undefined : 900 }}>
      <p
        style={{
          fontFamily: FONT_MUKTA,
          fontSize: mobil ? 17 : 21,
          lineHeight: mobil ? 1.65 : '32px',
          color: C.navy,
          marginBottom: mobil ? 28 : 40,
        }}
      >
        Sist oppdatert {OPPDATERT}. Denne siden forklarer hva malerdelius.no lagrer om
        deg, og hvorfor. Kort fortalt: så lite som mulig.
      </p>

      {BOLKER.map((b) => (
        <section key={b.tittel} style={{ marginBottom: mobil ? 30 : 44 }}>
          <h2
            style={{
              fontFamily: FONT,
              fontSize: mobil ? 20 : 30,
              lineHeight: 1.25,
              fontWeight: 700,
              color: C.navy,
              marginBottom: mobil ? 10 : 16,
              textAlign: 'left',
            }}
          >
            {b.tittel}
          </h2>
          {b.avsnitt.map((a, i) => (
            <p
              key={i}
              style={{
                fontFamily: FONT_MUKTA,
                fontSize: mobil ? 16 : 20,
                lineHeight: mobil ? 1.7 : '32px',
                color: C.navy,
                marginBottom: 12,
              }}
            >
              {a}
            </p>
          ))}
        </section>
      ))}
    </div>
  )
}

export default function Personvern() {
  const mobil = useIsMobile()

  if (mobil) {
    return (
      <Shell>
        <section className="m-seksjon">
          <h1 className="m-balanse">Personvern</h1>
          <Innhold mobil />
        </section>
      </Shell>
    )
  }

  return (
    <BloggStage tittel="Personvern">
      <div style={{ padding: '64px 119px 96px' }}>
        <Innhold mobil={false} />
      </div>
    </BloggStage>
  )
}
