import { Link } from 'react-router-dom'
import JuridiskSide from '../components/JuridiskSide'
import { BEDRIFT } from '../lib/theme'
import { harAnalyse } from '../lib/analyse'
import { apneValg } from '../lib/samtykke'

/**
 * Personvernerklæringen. På norsk, konkret, og skrevet slik at den stemmer
 * med koden: endres skjemaet (src/lib/tilbud.ts, api/kontakt.ts), tellingen
 * (src/lib/spor.ts), Analytics (src/lib/analyse.ts) eller kartet
 * (src/components/Kart.tsx), må teksten her endres i samme slengen.
 *
 * Kravene kommer fra personvernforordningen artikkel 13 (hva som skal
 * opplyses når opplysninger samles inn fra deg selv) og ekomloven § 3-15
 * (lagring i nettleseren).
 */
export const PERSONVERN_OPPDATERT = '8. september 2026'

export default function Personvern() {
  const epost = <a href={`mailto:${BEDRIFT.epost}`}>{BEDRIFT.epost}</a>

  return (
    <JuridiskSide
      tittel="Personvernerklæring"
      oppdatert={PERSONVERN_OPPDATERT}
      ingress={
        <>
          Her står det hvilke opplysninger {BEDRIFT.navn} samler inn om deg på {BEDRIFT.nettsted},
          hvorfor, hvor lenge vi har dem, og hvilke rettigheter du har. Kort fortalt: vi samler inn så
          lite som mulig, og bare det vi trenger for å svare deg.
        </>
      }
    >
      <section>
        <h2>Hvem er ansvarlig</h2>
        <p>
          {BEDRIFT.navn}, org.nr. {BEDRIFT.orgnrTall}, er behandlingsansvarlig for opplysningene som
          samles inn på dette nettstedet og i kontakten med deg.
        </p>
        <ul>
          <li>Forretningsadresse (Enhetsregisteret): {BEDRIFT.forretningsadresse}</li>
          <li>Besøksadresse: {BEDRIFT.adresse}</li>
          <li>E-post: {epost}</li>
          <li>
            Telefon: <a href={BEDRIFT.telefonLenke}>{BEDRIFT.telefon}</a>
          </li>
        </ul>
        <p>
          Vi er en liten bedrift og har ikke personvernombud. Spørsmål om personvern svares av
          daglig leder på e-postadressen over.
        </p>
      </section>

      <section>
        <h2>Når du sender oss en forespørsel</h2>
        <p>
          Skjemaet på forsiden og på kontaktsiden spør etter det vi trenger for å gi deg et
          tilbud: hva slags jobb det gjelder, hvor jobben er, omtrent hvor stort arealet er, når
          du ønsker jobben utført, en kort beskrivelse, bilder om du vil legge ved, navnet ditt og
          telefonnummer eller e-postadresse. Bare jobbtype, sted, navn og én måte å nå deg på er
          obligatorisk. Resten fyller du ut hvis du vil.
        </p>
        <p>
          Opplysningene sendes som e-post til vår egen e-postkasse, og brukes til å vurdere jobben,
          svare deg og eventuelt avtale befaring og gi tilbud. De brukes ikke til noe annet, og de
          gis ikke videre til noen for markedsføring. Bildene du legger ved krympes i nettleseren
          din før de sendes, lagres ikke på nettstedet, og finnes bare i e-posten vi får.
        </p>
        <p>
          Grunnlaget for behandlingen er personvernforordningen artikkel 6 nr. 1 bokstav b: dette
          er tiltak vi gjør på din forespørsel før en eventuell avtale. Før du sender, ber vi deg
          bekrefte at du har lest denne erklæringen, så du vet hva som skjer med opplysningene.
        </p>
        <p>
          Det samme gjelder når du ringer oss eller sender e-post direkte: vi bruker det du
          oppgir til å svare deg og følge opp henvendelsen.
        </p>
      </section>

      <section>
        <h2>Hvor lenge vi har opplysningene</h2>
        <ul>
          <li>
            Henvendelser som ikke fører til et oppdrag, slettes senest tolv måneder etter siste
            kontakt.
          </li>
          <li>
            Blir det et oppdrag, oppbevares avtale, tilbud, faktura og korrespondansen som hører
            til, så lenge bokføringsloven krever, som hovedregel fem år etter regnskapsårets
            slutt, og så lenge reklamasjonsfristen løper.
          </li>
          <li>Du kan når som helst be oss slette henvendelsen din, se rettighetene dine under.</li>
        </ul>
      </section>

      <section>
        <h2>Besøksstatistikk uten sporing</h2>
        <p>
          Vi teller hvor mange som besøker sidene våre, for å se hva folk faktisk er interessert i.
          Tellingen er vår egen, og den er laget for å vite minst mulig om deg: vi lagrer hvilken
          side som ble vist, hvilket nettsted du eventuelt kom fra (bare domenenavnet, for
          eksempel google.com), om du er på mobil eller datamaskin, og et tilfeldig nummer som
          holder sidene i ett og samme besøk sammen. Nummeret finnes bare i minnet til fanen og
          lagres ikke i nettleseren din.
        </p>
        <p>
          Vi lagrer ikke IP-adressen din, og tallene kan ikke knyttes til deg som person. Tallene
          ligger i databasen vår hos Supabase. Grunnlaget er vår berettigede interesse i å vite
          hvordan nettstedet brukes (artikkel 6 nr. 1 bokstav f).
        </p>
      </section>

      <section>
        <h2>Google Analytics og Google Ads, bare hvis du sier ja</h2>
        {harAnalyse ? (
          <>
            <p>
              I tillegg til vår egen telling bruker vi Google Analytics 4 fra Google Ireland
              Limited, men bare når du har godtatt «statistikk» i banneret om informasjonskapsler.
              Google-taggen ligger i sidene, men den står på «nei» på alt til du har svart: den
              setter ingen informasjonskapsler og lagrer ingenting i nettleseren din. Før du har
              svart, sender den bare et anonymt signal uten identifikator til Google, som Google
              bruker til å anslå besøkstall. Svarer du «Bare nødvendige», slås målingen helt av.
            </p>
            <p>
              Sier du ja, setter Google informasjonskapslene <code>_ga</code> og{' '}
              <code>_ga_…</code> i nettleseren din i inntil to år. De inneholder et tilfeldig
              nummer som skiller nettleseren din fra andre, og Google registrerer hvilke sider du
              ser, hvor lenge, hva slags enhet og nettleser du bruker, og omtrent hvor du er
              (Google anslår sted ut fra IP-adressen og lagrer ikke selve adressen). Annonsedelen av
              målingen er alltid avslått hos oss, vi bruker ikke Google Signals, og Google sletter
              enkelthendelsene etter to måneder, som er standardinnstillingen i Analytics.
            </p>
            <p>
              Har du i tillegg godtatt «markedsføring», får Google Ads vite om besøket ditt kom
              fra en av annonsene våre, og om det førte til en henvendelse, så vi kan se om
              annonsene virker. Da settes informasjonskapslene <code>_gcl_…</code> i inntil 90
              dager. Vi bruker aldri opplysningene til personlig tilpassede annonser eller til å
              følge deg med annonser på andre nettsteder; den delen står alltid avslått.
            </p>
            <p>
              Google kan behandle opplysningene i USA. Google LLC er sertifisert under EU-U.S. Data
              Privacy Framework, som EU-kommisjonen har godkjent som grunnlag for slik overføring.
              Grunnlaget for behandlingen er ditt samtykke (artikkel 6 nr. 1 bokstav a og
              ekomloven § 3-15), og du kan trekke det tilbake når som helst:
            </p>
            <p>
              <button type="button" className="jus-knapp" onClick={apneValg}>
                Endre valgene mine
              </button>
            </p>
          </>
        ) : (
          <p>
            Vi bruker for tiden ikke Google Analytics eller andre analyseverktøy fra tredjeparter.
            Skulle det endre seg, vil det bare skje etter at du har sagt ja i banneret om
            informasjonskapsler, og denne siden oppdateres.
          </p>
        )}
      </section>

      <section>
        <h2>Kartet fra Google Maps</h2>
        <p>
          På kontaktsiden kan du se hvor vi holder til på et kart fra Google Maps. Kartet hentes
          ikke før du har godtatt «innhold fra Google» i banneret, eller trykker på knappen i
          kartflaten. Når kartet vises, får Google vite at nettleseren din har hentet det, og Google
          setter sine egne informasjonskapsler. Vil du unngå det, kan du i stedet åpne adressen i
          Google Maps i en ny fane, eller bare ringe oss.
        </p>
      </section>

      <section>
        <h2>Det som lagres i nettleseren din</h2>
        <p>
          Uten at du har sagt ja til noe, lagrer nettstedet bare to ting i nettleseren: svaret ditt
          i banneret om informasjonskapsler, og om du har skrudd bakgrunnsmusikken av eller på.
          Begge er der for å huske et valg du selv har gjort. Alt annet krever samtykke. Hele listen,
          med hvor lenge hver enkelt lever, står på siden{' '}
          <Link to="/informasjonskapsler">Informasjonskapsler</Link>.
        </p>
      </section>

      <section>
        <h2>Tekniske logger og sikkerhet</h2>
        <p>
          Nettstedet ligger hos Vercel. Som alle nettjenere fører Vercel korte tekniske logger med
          IP-adresse, tidspunkt og hvilken side som ble hentet, for drift og sikkerhet. Loggene
          slettes automatisk etter kort tid, og vi bruker dem ikke til å følge enkeltpersoner.
          Skjemaet vårt teller også antall innsendinger per IP-adresse i noen minutter, i minnet,
          for å stoppe automatisk søppelpost. Grunnlaget er vår berettigede interesse i å holde
          nettstedet trygt (artikkel 6 nr. 1 bokstav f).
        </p>
        <p>
          All trafikk går kryptert (HTTPS), og skjemaet tar bare imot innsendinger fra vårt eget
          nettsted.
        </p>
      </section>

      <section>
        <h2>Hvem som hjelper oss med driften</h2>
        <p>
          Vi selger aldri opplysninger, og vi deler dem ikke med andre for markedsføring. Disse
          leverandørene behandler opplysninger på våre vegne, etter databehandleravtale:
        </p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> (USA) drifter nettstedet og kjører skjemaet. Sertifisert
            under EU-U.S. Data Privacy Framework.
          </li>
          <li>
            <strong>Resend Inc.</strong> (USA) sender e-posten fra skjemaet til oss. Utsendingen
            skjer fra Irland; leverandøren er sertifisert under EU-U.S. Data Privacy Framework.
          </li>
          <li>
            <strong>Supabase Inc.</strong> lagrer besøksstatistikken og blogginnleggene våre.
          </li>
          <li>
            <strong>Google Ireland Limited</strong> leverer e-postkassen vår, og Google Maps og
            Google Analytics når du har sagt ja til dem.
          </li>
        </ul>
        <p>
          Overføring til USA skjer bare til leverandører som er sertifisert under EU-U.S. Data
          Privacy Framework, eller med EU-kommisjonens standardavtaler (Standard Contractual
          Clauses).
        </p>
      </section>

      <section>
        <h2>Rettighetene dine</h2>
        <p>Du har rett til å</p>
        <ul>
          <li>få vite hvilke opplysninger vi har om deg (innsyn),</li>
          <li>få dem rettet eller slettet,</li>
          <li>få behandlingen begrenset, eller protestere mot den,</li>
          <li>få utlevert opplysningene du selv har gitt oss (dataportabilitet),</li>
          <li>trekke tilbake et samtykke, uten at det påvirker det som er gjort før.</li>
        </ul>
        <p>
          Send en e-post til {epost}, så ordner vi det uten ugrunnet opphold, og senest innen én
          måned. Mener du at vi behandler opplysninger feil, kan du klage til Datatilsynet:{' '}
          <a href="https://www.datatilsynet.no" target="_blank" rel="noreferrer">
            datatilsynet.no
          </a>
          , Postboks 458 Sentrum, 0105 Oslo. Vi setter pris på om du tar kontakt med oss først.
        </p>
      </section>

      <section>
        <h2>Endringer</h2>
        <p>
          Endrer vi hva vi samler inn eller hvordan, oppdateres denne siden og datoen øverst. Større
          endringer varsles på forsiden.
        </p>
      </section>
    </JuridiskSide>
  )
}
