import { Link } from 'react-router-dom'
import JuridiskSide from '../components/JuridiskSide'
import { BEDRIFT } from '../lib/theme'

/**
 * Vilkår for bruk av nettstedet, og de faste opplysningene om selskapet som
 * ehandelsloven § 8 og tjenesteloven § 20 krever at en tjenesteyter gjør
 * lett tilgjengelig: navn, foretaksform, adresse, e-post, organisasjonsnummer,
 * merverdiavgift, register, alminnelige avtalevilkår, garantier og adgangen
 * til utenrettslig tvisteløsning.
 *
 * Tallene om selskapet er hentet fra Enhetsregisteret 8. september 2026 og
 * ligger i BEDRIFT (src/lib/theme.ts).
 */
export const VILKAR_OPPDATERT = '8. september 2026'

export default function Vilkar() {
  return (
    <JuridiskSide
      tittel="Vilkår for bruk"
      oppdatert={VILKAR_OPPDATERT}
      ingress={
        <>
          Disse vilkårene gjelder for bruk av nettstedet {BEDRIFT.nettsted} og for forespørsler du
          sender oss herfra. Selve malerarbeidet avtales alltid skriftlig, i et eget tilbud, og for
          forbrukere gjelder i tillegg håndverkertjenesteloven og angrerettloven, som ingen avtale
          kan gjøre dårligere for deg.
        </>
      }
    >
      <section>
        <h2>Om selskapet</h2>
        <ul>
          <li>Navn og foretaksform: {BEDRIFT.navn} (aksjeselskap)</li>
          <li>
            Organisasjonsnummer: {BEDRIFT.orgnrTall}
            {BEDRIFT.mva ? ' MVA (registrert i Merverdiavgiftsregisteret)' : ''}
          </li>
          <li>Registrert i Foretaksregisteret {BEDRIFT.registrert}</li>
          <li>Forretningsadresse (Enhetsregisteret): {BEDRIFT.forretningsadresse}</li>
          <li>Besøksadresse: {BEDRIFT.adresse}</li>
          <li>Daglig leder: {BEDRIFT.dagligLeder}</li>
          <li>
            E-post: <a href={`mailto:${BEDRIFT.epost}`}>{BEDRIFT.epost}</a>
          </li>
          <li>
            Telefon: <a href={BEDRIFT.telefonLenke}>{BEDRIFT.telefon}</a>
          </li>
          <li>Virksomhet: malertjenester (næringskode 43.340, maler- og glassarbeid)</li>
        </ul>
        <p>
          Malerfaget krever ingen offentlig tillatelse i Norge. Opplysninger om eventuell
          ansvarsforsikring får du på forespørsel og i tilbudet.
        </p>
      </section>

      <section>
        <h2>Bruk av nettstedet</h2>
        <p>
          Innholdet på nettstedet er ment som informasjon om tjenestene våre. Vi gjør vårt beste
          for at alt skal være riktig og oppdatert, men kan ikke garantere at siden alltid er fri
          for feil eller tilgjengelig til enhver tid. Lenker til andre nettsteder (for eksempel
          Mittanbud, Facebook, Instagram, TikTok og Google Maps) fører til innhold vi ikke er
          ansvarlige for.
        </p>
        <p>
          Du kan bruke nettstedet fritt til vanlig lesing og til å kontakte oss. Automatisk
          innhenting av innholdet, forsøk på å omgå sikkerhetstiltak, og bruk av skjemaet til
          søppelpost eller til å sende inn opplysninger om andre uten deres samtykke, er ikke
          tillatt.
        </p>
      </section>

      <section>
        <h2>Forespørsler, befaring og tilbud</h2>
        <p>
          En forespørsel gjennom skjemaet, på e-post eller på telefon er ikke en bestilling og
          binder verken deg eller oss. Befaringen er gratis og uforpliktende. Etter befaringen får
          du et skriftlig tilbud med hva som skal gjøres, pris og når arbeidet kan utføres.
        </p>
        <p>
          En avtale er inngått først når du har godtatt tilbudet, skriftlig eller på annen måte
          som ikke kan misforstås. Da får du samtidig en bekreftelse på avtalen, opplysningene
          angrerettloven krever, og angreskjema (se <Link to="/angrerett">Angrerett og reklamasjon</Link>).
        </p>
        <p>
          Priser til forbrukere oppgis alltid inkludert merverdiavgift. Et prisoverslag kan etter
          håndverkertjenesteloven § 32 ikke overskrides vesentlig, og aldri med mer enn 15 prosent,
          med mindre vi har avtalt tilleggsarbeid med deg underveis. Er det avtalt fast pris,
          gjelder den.
        </p>
      </section>

      <section>
        <h2>Reklamasjon, garanti og dine rettigheter</h2>
        <p>
          Som forbruker har du rettighetene i håndverkertjenesteloven. Er det en mangel ved
          arbeidet, kan du kreve retting, prisavslag, heving og erstatning etter lovens regler.
          Reklamasjon må skje innen rimelig tid etter at du oppdaget eller burde ha oppdaget
          mangelen, og senest to år etter at oppdraget ble avsluttet. For arbeid som ved vanlig
          bruk er ment å vare vesentlig lenger, som maling av bygninger normalt er, er den lengste
          fristen fem år.
        </p>
        <p>
          Når vi bruker ordet «garanti» på nettstedet, mener vi at vi står for arbeidet vårt og
          retter feil som skyldes oss, innenfor disse lovfestede rettighetene. Gir vi i tillegg en
          egen garanti på et oppdrag, står vilkårene for den i det skriftlige tilbudet. En
          garanti begrenser aldri rettighetene du har etter loven.
        </p>
        <p>Hvordan du reklamerer, står på siden <Link to="/angrerett">Angrerett og reklamasjon</Link>.</p>
      </section>

      <section>
        <h2>Opphavsrett og bilder</h2>
        <p>
          Tekst, logo og bilder på nettstedet tilhører {BEDRIFT.navn} eller brukes med tillatelse
          fra rettighetshaverne. Bildene av prosjekter viser arbeid vi selv har utført, og bildene
          av teamet viser våre egne ansatte. Innholdet kan ikke kopieres, gjengis eller brukes
          videre uten skriftlig samtykke fra oss, utover det åndsverkloven tillater. Bilder du
          selv sender oss gjennom skjemaet, forblir dine; vi bruker dem bare til å vurdere jobben.
        </p>
      </section>

      <section>
        <h2>Personvern</h2>
        <p>
          Hvordan vi behandler opplysningene dine, står i{' '}
          <Link to="/personvern">personvernerklæringen</Link>, og hva som lagres i nettleseren står
          på siden om <Link to="/informasjonskapsler">informasjonskapsler</Link>.
        </p>
      </section>

      <section>
        <h2>Tvister og lovvalg</h2>
        <p>
          Norsk lov gjelder. Blir vi uenige, vil vi helst løse det direkte med deg. Som forbruker
          kan du også be Forbrukertilsynet om mekling, og deretter få saken avgjort av
          Forbrukerklageutvalget, uten kostnad. Se{' '}
          <a href="https://www.forbrukertilsynet.no" target="_blank" rel="noreferrer">
            forbrukertilsynet.no
          </a>
          . Ingenting her hindrer deg i å ta saken til de alminnelige domstolene.
        </p>
      </section>

      <section>
        <h2>Endringer</h2>
        <p>
          Vi kan endre disse vilkårene. Den gjeldende versjonen ligger alltid her, med datoen
          øverst. For en avtale som allerede er inngått, gjelder vilkårene i tilbudet du godtok.
        </p>
      </section>
    </JuridiskSide>
  )
}
