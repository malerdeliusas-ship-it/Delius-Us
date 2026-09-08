import { Link } from 'react-router-dom'
import JuridiskSide from '../components/JuridiskSide'
import { harAnalyse } from '../lib/analyse'
import { GA_ID } from '../lib/basekonfig'
import { apneValg, trekkSamtykke, useSamtykke } from '../lib/samtykke'

/**
 * Cookie-erklæringen: hva som lagres i nettleseren, av hvem, hvorfor og hvor
 * lenge, og knappene for å endre eller trekke tilbake svaret. Kravet står i
 * ekomloven § 3-15 og i personvernforordningen artikkel 7 nr. 3 (samtykke
 * skal kunne trekkes like lett som det ble gitt).
 */
export const KAPSLER_OPPDATERT = '8. september 2026'

type Rad = {
  navn: string
  hvem: string
  formaal: string
  type: 'Nødvendig' | 'Statistikk' | 'Markedsføring' | 'Innhold fra Google' | 'Bare admin'
  varighet: string
}

const strommen = GA_ID ? GA_ID.replace(/^G-/, '') : 'XXXXXXXX'

const RADER: Rad[] = [
  {
    navn: 'md-samtykke',
    hvem: 'malerdelius.no (localStorage)',
    formaal: 'Husker svaret ditt i banneret om informasjonskapsler, så vi ikke spør på hver side.',
    type: 'Nødvendig',
    varighet: '12 måneder',
  },
  {
    navn: 'md-musikk',
    hvem: 'malerdelius.no (localStorage)',
    formaal: 'Husker at du har skrudd bakgrunnsmusikken av eller på. Settes bare når du trykker på musikkknappen.',
    type: 'Nødvendig',
    varighet: 'Til du sletter den',
  },
  ...(harAnalyse
    ? ([
        {
          navn: '_ga',
          hvem: 'Google Analytics (informasjonskapsel)',
          formaal: 'Et tilfeldig nummer som skiller nettleseren din fra andre, så besøk kan telles.',
          type: 'Statistikk',
          varighet: '2 år',
        },
        {
          navn: `_ga_${strommen}`,
          hvem: 'Google Analytics (informasjonskapsel)',
          formaal: 'Holder sidene i ett og samme besøk sammen for Google Analytics.',
          type: 'Statistikk',
          varighet: '2 år',
        },
        {
          navn: '_gcl_au, _gcl_aw, _gcl_gs',
          hvem: 'Google Ads (informasjonskapsler)',
          formaal:
            'Husker at besøket kom fra en Google-annonse, så Google Ads kan se om annonsen førte til en henvendelse. Brukes ikke til personlig tilpassede annonser.',
          type: 'Markedsføring',
          varighet: '90 dager',
        },
      ] as Rad[])
    : []),
  {
    navn: 'NID, CONSENT, SOCS m.fl.',
    hvem: 'google.com (informasjonskapsler fra tredjepart)',
    formaal:
      'Settes av Google når kartet på kontaktsiden vises. Google bruker dem til egne innstillinger og sikkerhet.',
    type: 'Innhold fra Google',
    varighet: '6 måneder til 2 år, styrt av Google',
  },
  {
    navn: 'sb-…-auth-token, md-ikke-spor, md-innlogging-forsok',
    hvem: 'malerdelius.no (localStorage)',
    formaal:
      'Bare for ansatte som logger inn i admin-panelet: holder innloggingen, holder egne besøk utenfor statistikken og bremser gjentatte innloggingsforsøk.',
    type: 'Bare admin',
    varighet: 'Til utlogging, ellers til du sletter dem',
  },
]

export default function Informasjonskapsler() {
  const samtykke = useSamtykke()

  const status = !samtykke
    ? 'Du har ikke svart på banneret ennå. Da er bare det nødvendige på.'
    : [
        harAnalyse ? `Statistikk (Google Analytics): ${samtykke.statistikk ? 'på' : 'av'}` : null,
        harAnalyse ? `Markedsføring (Google Ads): ${samtykke.markedsforing ? 'på' : 'av'}` : null,
        `Innhold fra Google (kartet): ${samtykke.eksternt ? 'på' : 'av'}`,
      ]
        .filter(Boolean)
        .join('. ') + `. Svart ${new Date(samtykke.dato).toLocaleDateString('nb-NO')}.`

  return (
    <JuridiskSide
      tittel="Informasjonskapsler"
      oppdatert={KAPSLER_OPPDATERT}
      ingress={
        <>
          Informasjonskapsler (cookies) og lignende lagring er små biter informasjon et nettsted
          legger igjen i nettleseren din. Etter ekomloven § 3-15 må vi ha samtykket ditt før vi
          lagrer noe som ikke er strengt nødvendig for det du selv har bedt om. Her står alt vi
          bruker, og du kan endre svaret ditt når som helst.
        </>
      }
    >
      <section>
        <h2>Valgene dine nå</h2>
        <div className="jus-boks">
          <p>{status}</p>
        </div>
        <p style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button type="button" className="jus-knapp" onClick={apneValg}>
            Endre valgene mine
          </button>
          {samtykke && (
            <button
              type="button"
              className="jus-knapp"
              style={{ background: '#fff', boxShadow: 'inset 0 0 0 2px #022269' }}
              onClick={trekkSamtykke}
            >
              Trekk tilbake alt
            </button>
          )}
        </p>
        <p>
          Trekker du tilbake et samtykke, slutter vi å bruke det med en gang, og
          {harAnalyse ? ' informasjonskapslene fra Google Analytics slettes fra nettleseren din' : ' ingenting nytt hentes fra Google'}
          . Informasjonskapsler som Google selv har satt på google.com, må du slette i nettleserens
          innstillinger.
        </p>
      </section>

      <section>
        <h2>Alt som lagres, og hvor lenge</h2>
        <div className="jus-tabell">
          <table>
            <thead>
              <tr>
                <th>Navn</th>
                <th>Hvem setter den</th>
                <th>Hva den gjør</th>
                <th>Type</th>
                <th>Varighet</th>
              </tr>
            </thead>
            <tbody>
              {RADER.map((r) => (
                <tr key={r.navn}>
                  <td>
                    <code>{r.navn}</code>
                  </td>
                  <td>{r.hvem}</td>
                  <td>{r.formaal}</td>
                  <td>{r.type}</td>
                  <td>{r.varighet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 14 }}>
          «Nødvendig» betyr at lagringen bare husker et valg du selv har gjort, og er unntatt
          kravet om samtykke. «Statistikk», «Markedsføring» og «Innhold fra Google» skjer bare
          når du har sagt ja. Før du har svart, lagrer Google-taggen ingenting og setter ingen
          kapsler. Vår egen besøkstelling lagrer aldri noe i nettleseren din, se{' '}
          <Link to="/personvern">personvernerklæringen</Link>.
        </p>
      </section>

      <section>
        <h2>Slette informasjonskapsler selv</h2>
        <p>
          Du kan alltid slette informasjonskapsler og lagrede data i nettleserens innstillinger,
          som regel under «Personvern og sikkerhet» eller «Nettstedsdata». Gjør du det, spør
          banneret på nytt neste gang du besøker oss.
        </p>
      </section>
    </JuridiskSide>
  )
}
