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
 *
 * Innholdet sto først i en tabell med de tekniske navnene i første kolonne.
 * Alt sto der, men siden så ut som en utskrift fra en database. Nå er den
 * bygget som kort, ett per formål: det leseren faktisk lurer på står som
 * overskrift på hver linje, og det tekniske navnet står smått under. Ingen
 * opplysninger er tatt bort – bare snudd, så mennesket kommer først.
 */
export const KAPSLER_OPPDATERT = '8. september 2026'

/** Én ting som lagres: hva den gjør (i klartekst), navnet, og hvor lenge. */
type Ting = { hva: string; navn: string; varighet: string }

type Gruppe = {
  tittel: string
  /** Hva hele gruppen er til for, i én setning. */
  ingress: string
  hvem: string
  ting: Ting[]
  /** «Alltid på», «På» eller «Av» – vises som merke øverst til høyre. */
  status: 'alltid' | 'paa' | 'av'
}

const strommen = GA_ID ? GA_ID.replace(/^G-/, '') : 'XXXXXXXX'

export default function Informasjonskapsler() {
  const samtykke = useSamtykke()

  const grupper: Gruppe[] = [
    {
      tittel: 'Nødvendige',
      ingress:
        'Husker et valg du selv har gjort på nettstedet. Disse trenger vi ikke spørre om, og de forteller oss ingenting om deg.',
      hvem: 'Nettstedet vårt',
      status: 'alltid',
      ting: [
        {
          hva: 'Husker svaret ditt i banneret, så vi ikke spør på hver eneste side.',
          navn: 'md-samtykke',
          varighet: '12 måneder',
        },
        {
          hva: 'Husker om du har skrudd av bakgrunnsmusikken. Lagres bare hvis du trykker på musikknappen.',
          navn: 'md-musikk',
          varighet: 'Til du sletter den',
        },
      ],
    },
    ...(harAnalyse
      ? ([
          {
            tittel: 'Statistikk',
            ingress:
              'Lar oss se hvor mange som besøker sidene og hva folk leser, så vi vet hva som er nyttig. Vi ser tall, ikke personer.',
            hvem: 'Google Analytics (Google Ireland Limited)',
            status: samtykke?.statistikk ? 'paa' : 'av',
            ting: [
              {
                hva: 'Skiller nettleseren din fra andre, så det samme besøket ikke telles to ganger.',
                navn: '_ga',
                varighet: '2 år',
              },
              {
                hva: 'Holder sidene du ser i ett og samme besøk sammen.',
                navn: `_ga_${strommen}`,
                varighet: '2 år',
              },
            ],
          },
          {
            tittel: 'Markedsføring',
            ingress:
              'Lar oss se om en annonse faktisk førte til at noen tok kontakt. Vi bruker det aldri til personlig tilpassede annonser, og vi følger deg ikke rundt på andre nettsteder.',
            hvem: 'Google Ads (Google Ireland Limited)',
            status: samtykke?.markedsforing ? 'paa' : 'av',
            ting: [
              {
                hva: 'Husker at besøket kom fra en av annonsene våre.',
                navn: '_gcl_au, _gcl_aw, _gcl_gs',
                varighet: '90 dager',
              },
            ],
          },
        ] as Gruppe[])
      : []),
    {
      tittel: 'Kartet på kontaktsiden',
      ingress:
        'Kartet hentes fra Google Maps, og da setter Google sine egne informasjonskapsler. Derfor viser vi det ikke før du sier ja.',
      hvem: 'google.com',
      status: samtykke?.eksternt ? 'paa' : 'av',
      ting: [
        {
          hva: 'Googles egne innstillinger og sikkerhet mens kartet vises.',
          navn: 'NID, CONSENT, SOCS med flere',
          varighet: '6 måneder til 2 år, bestemt av Google',
        },
      ],
    },
  ]

  const merke = (s: Gruppe['status']) =>
    s === 'alltid' ? 'Alltid på' : s === 'paa' ? 'På nå' : 'Av nå'

  const status = !samtykke
    ? 'Du har ikke svart på banneret ennå. Da er bare det nødvendige på, og ingenting sendes til Google.'
    : samtykke.statistikk || samtykke.markedsforing || samtykke.eksternt
      ? 'Du har gjort et valg. Merkene under viser hva som er på akkurat nå.'
      : 'Du har valgt bare det nødvendige. Ingenting sendes til Google.'

  return (
    <JuridiskSide
      tittel="Informasjonskapsler"
      oppdatert={KAPSLER_OPPDATERT}
      ingress={
        <>
          Informasjonskapsler (cookies) er små notater et nettsted legger igjen i nettleseren din.
          Etter ekomloven § 3-15 må vi ha ditt ja før vi lagrer noe som ikke er strengt nødvendig.
          Her står alt vi bruker, i klartekst, og du kan ombestemme deg når som helst.
        </>
      }
    >
      <section>
        <h2>Valgene dine nå</h2>
        <div className="jus-boks">
          <p>{status}</p>
        </div>
        <div className="kapsel-knapper">
          <button type="button" className="jus-knapp" onClick={apneValg}>
            Endre valgene mine
          </button>
          {samtykke && (
            <button type="button" className="jus-knapp jus-knapp--hvit" onClick={trekkSamtykke}>
              Trekk tilbake alt
            </button>
          )}
        </div>
        <p style={{ marginTop: 16 }}>
          Trekker du tilbake et samtykke, slutter vi å bruke det med en gang, og informasjonskapslene
          fra Google slettes fra nettleseren din. Kapsler som Google selv har satt på google.com, må
          du slette i nettleserens innstillinger.
        </p>
      </section>

      <section>
        <h2>Alt som lagres, og hvor lenge</h2>
        <div className="kapsel-kort">
          {grupper.map((g) => (
            <article key={g.tittel} className="kapsel-gruppe">
              <header className="kapsel-topp">
                <h3>{g.tittel}</h3>
                <span className={`kapsel-merke kapsel-merke--${g.status}`}>{merke(g.status)}</span>
              </header>
              <p className="kapsel-ingress">{g.ingress}</p>

              <ul className="kapsel-liste">
                {g.ting.map((t) => (
                  <li key={t.navn}>
                    <p className="kapsel-hva">{t.hva}</p>
                    <p className="kapsel-detalj">
                      <span className="kapsel-navn">{t.navn}</span>
                      <span className="kapsel-varighet">{t.varighet}</span>
                    </p>
                  </li>
                ))}
              </ul>

              <p className="kapsel-hvem">Settes av: {g.hvem}</p>
            </article>
          ))}
        </div>

        <p className="kapsel-fotnote">
          Besøkstellingen vi har laget selv, lagrer ingenting i nettleseren din og bruker ingen
          informasjonskapsler. Den er forklart i{' '}
          <Link to="/personvern">personvernerklæringen</Link>. Logger noen av oss seg inn i
          administrasjonspanelet, lagrer nettleseren i tillegg innloggingen og et par
          arbeidsinnstillinger på den maskinen. Det gjelder bare oss som jobber her, aldri
          besøkende på nettstedet.
        </p>
      </section>

      <section>
        <h2>Slette informasjonskapsler selv</h2>
        <p>
          Du kan alltid slette informasjonskapsler og lagrede data i nettleserens innstillinger, som
          regel under «Personvern og sikkerhet» eller «Nettstedsdata». Gjør du det, spør banneret på
          nytt neste gang du besøker oss.
        </p>
      </section>
    </JuridiskSide>
  )
}
