import { Link } from 'react-router-dom'
import JuridiskSide from '../components/JuridiskSide'
import { BEDRIFT } from '../lib/theme'

/**
 * Angrerett, tilbakebetaling og reklamasjon, for forbrukere.
 *
 * Reglene: angrerettloven (lov 20. juni 2014 nr. 27) for avtaler inngått
 * ved fjernsalg (telefon, e-post, nettskjema) eller utenom faste
 * forretningslokaler (hjemme hos kunden, typisk under befaring), og
 * håndverkertjenesteloven (lov 16. juni 1989 nr. 63) for mangler ved
 * arbeidet. Siden er informasjon; selve angreskjemaet skal følge med
 * avtalebekreftelsen, se README.
 */
export const ANGRERETT_OPPDATERT = '8. september 2026'

const ANGRESKJEMA =
  'https://www.regjeringen.no/no/dokument/dep/bld/skjema/skjema-2/skjema-om-angrerett/id614564/'

export default function Angrerett() {
  return (
    <JuridiskSide
      tittel="Angrerett og reklamasjon"
      oppdatert={ANGRERETT_OPPDATERT}
      ingress={
        <>
          Her står det hvordan du som forbruker kan angre en avtale med {BEDRIFT.navn}, hvordan du
          får pengene tilbake, og hvordan du reklamerer hvis noe ved arbeidet ikke er som det skal.
          Reglene følger angrerettloven og håndverkertjenesteloven. Handler du på vegne av en
          bedrift, gjelder avtalen og tilbudet i stedet.
        </>
      }
    >
      <section>
        <h2>Når du har angrerett</h2>
        <p>
          Du har 14 dagers angrerett når avtalen er inngått uten at vi har møttes i våre lokaler:
          på telefon, på e-post, gjennom skjemaet på nettstedet, eller hjemme hos deg, for eksempel
          under en befaring. Fristen regnes fra dagen avtalen ble inngått. Faller siste dag på en
          lørdag, helligdag eller høytidsdag, forlenges fristen til neste virkedag.
        </p>
        <p>
          Har vi ikke gitt deg opplysningene om angreretten som loven krever, utvides fristen til
          tolv måneder etter at den ellers ville gått ut. Får du opplysningene i mellomtiden,
          løper 14 dager fra den dagen.
        </p>
      </section>

      <section>
        <h2>Slik angrer du</h2>
        <p>
          Gi oss beskjed før fristen går ut. Det holder med en e-post til{' '}
          <a href={`mailto:${BEDRIFT.epost}`}>{BEDRIFT.epost}</a> eller et brev til{' '}
          {BEDRIFT.navn}, {BEDRIFT.forretningsadresse}, der du skriver at du angrer, hvilken avtale
          det gjelder, navnet ditt og adressen din. Du kan også bruke det offisielle{' '}
          <a href={ANGRESKJEMA} target="_blank" rel="noreferrer">
            angreskjemaet fra Barne- og familiedepartementet
          </a>
          . Du trenger ikke oppgi noen grunn. Det er nok at meldingen er sendt innen fristen.
        </p>
        <p>Vi bekrefter alltid at vi har mottatt meldingen din, på e-post.</p>
      </section>

      <section>
        <h2>Pengene tilbake</h2>
        <p>
          Har du betalt noe på forskudd, betaler vi hele beløpet tilbake uten ugrunnet opphold, og
          senest 14 dager etter at vi fikk meldingen om at du angrer. Vi bruker samme
          betalingsmåte som du brukte, med mindre vi avtaler noe annet med deg. Det koster deg
          ingenting å angre.
        </p>
      </section>

      <section>
        <h2>Hvis arbeidet skal starte før fristen er ute</h2>
        <p>
          Vil du at vi begynner før de 14 dagene har gått, må du be om det uttrykkelig, og vi ber
          deg bekrefte det skriftlig i avtalen. Angrer du etterpå, betaler du for den delen av
          arbeidet som er utført fram til du ga beskjed, regnet forholdsmessig ut fra den avtalte
          prisen. Er arbeidet helt ferdig når du angrer, og du hadde bedt om oppstart og godtatt at
          angreretten da faller bort, gjelder ikke angreretten lenger.
        </p>
        <p>
          Angreretten gjelder heller ikke reparasjoner eller annet arbeid som det haster å få
          utført, der du selv uttrykkelig har bedt oss komme. Ber du om noe mer enn det som hastet,
          har du angrerett på den delen.
        </p>
      </section>

      <section>
        <h2>Reklamasjon: når noe ved arbeidet ikke er som det skal</h2>
        <p>
          Reklamasjon er noe annet enn angrerett. Angreretten gjelder selve avtalen; reklamasjon
          gjelder feil ved arbeidet, og den retten har du i årevis etter at jobben er gjort.
        </p>
        <p>
          Oppdager du en mangel, for eksempel maling som flasser, striper, sprekker som ikke ble
          utbedret, eller søl på flater som skulle vært beskyttet, gir du oss beskjed innen rimelig
          tid etter at du oppdaget eller burde ha oppdaget den. Send gjerne bilder på e-post. Den
          absolutte fristen er to år etter at oppdraget ble avsluttet, og fem år for arbeid som er
          ment å vare vesentlig lenger, slik maling av bygninger normalt er.
        </p>
        <p>
          Er det en mangel, har du etter håndverkertjenesteloven rett til å få den rettet uten
          kostnad. Retter vi ikke innen rimelig tid, kan du kreve prisavslag, holde tilbake så mye
          av betalingen som sikrer kravet, heve avtalen hvis mangelen er vesentlig, og kreve
          erstatning for tap mangelen har påført deg. Vi svarer på reklamasjoner så snart vi kan,
          normalt innen få virkedager, og avtaler tid for å se på arbeidet.
        </p>
      </section>

      <section>
        <h2>Blir vi ikke enige</h2>
        <p>
          Kommer vi ikke til enighet, kan du be Forbrukertilsynet om mekling, og deretter få saken
          avgjort av Forbrukerklageutvalget. Begge deler er gratis for deg. Les mer på{' '}
          <a href="https://www.forbrukertilsynet.no" target="_blank" rel="noreferrer">
            forbrukertilsynet.no
          </a>
          . Du kan også alltid ta saken til de alminnelige domstolene.
        </p>
        <p>
          Se også <Link to="/vilkar">vilkårene for bruk</Link> og{' '}
          <Link to="/personvern">personvernerklæringen</Link>.
        </p>
      </section>
    </JuridiskSide>
  )
}
