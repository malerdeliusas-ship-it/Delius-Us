import { useEffect, useRef, useState, type ChangeEvent, type DragEvent as ReactDragEvent } from 'react'
import { Link } from 'react-router-dom'
import SkjemaStatus from './SkjemaStatus'
import { MAKS_BILDER, type Felt, type TilbudSkjemaTilstand } from '../lib/tilbud'
import icOpplasting from '../assets/figma/ic-opplasting.webp'

/**
 * Tilbudsskjemaet på mobil: de samme seks nummererte spørsmålene som i
 * Figma-designet, stablet i én kolonne. Designeren har ikke tegnet en
 * mobilutgave ennå, så formene er hentet fra desktopversjonen: hvite
 * pilleformede felt, dempet blå etiketter, gul knapp.
 *
 * Utseendet ligger i index.css (`tb-`), logikken i `src/lib/tilbud.ts`.
 * Tilstanden `s` eies av siden rundt, så den overlever at skjemaet bytter
 * mellom mobil- og desktoputgaven.
 *
 * Spørsmål 7 står ikke i designet, men uten navn, telefon og e-post har
 * ikke Delius noen måte å svare kunden på.
 */
export default function TilbudSkjema({ s }: { s: TilbudSkjemaTilstand }) {
  const skjemaRef = useRef<HTMLFormElement>(null)
  const filRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const [drar, setDrar] = useState(false)

  // Rull dit oppmerksomheten trengs: feltet som stoppet innsendingen, eller
  // kvitteringen nederst.
  useEffect(() => {
    if (s.status !== 'sendt' && s.status !== 'feil') return
    const skjema = skjemaRef.current
    const f = s.feilFelt
    let el: Element | null = null
    if (s.status === 'feil' && f && skjema) {
      el =
        f === 'bilder' || f === 'samtykke'
          ? skjema.querySelector(`[data-felt="${f}"]`)
          : skjema.querySelector(`[name="${f}"]`)
    }
    el ??= statusRef.current
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.focus({ preventScroll: true })
    }
  }, [s.status, s.feilFelt])

  // Et bilde som slippes utenfor sonen ville ellers åpnet seg i fanen og
  // kastet alt som var skrevet. Slipp hvor som helst i skjemaet legger det
  // til; slipp utenfor skjemaet gjør ingenting. Tekst som dras inn i et
  // felt, rører vi ikke.
  const leggTilRef = useRef(s.leggTil)
  leggTilRef.current = s.leggTil
  useEffect(() => {
    const medFiler = (e: DragEvent) => Boolean(e.dataTransfer?.types?.includes('Files'))
    const over = (e: DragEvent) => {
      if (medFiler(e)) e.preventDefault()
    }
    const slippet = (e: DragEvent) => {
      if (!medFiler(e)) return
      e.preventDefault()
      const iSkjema = skjemaRef.current?.contains(e.target as Node)
      if (iSkjema && e.dataTransfer?.files?.length) void leggTilRef.current(e.dataTransfer.files)
    }
    window.addEventListener('dragover', over)
    window.addEventListener('drop', slippet)
    return () => {
      window.removeEventListener('dragover', over)
      window.removeEventListener('drop', slippet)
    }
  }, [])

  const felt = (navn: Felt) => `tb-felt${s.feilFelt === navn ? ' felt-feil' : ''}`
  const utkast = s.utkast.current

  /** Feilmeldingen står ved feltet den gjelder, ikke bare nederst i skjemaet. */
  const feilFor = (...felter: Felt[]) =>
    s.status === 'feil' && s.feilFelt && felter.includes(s.feilFelt) && s.feil ? (
      <p className="tb-feltfeil" role="alert">
        {s.feil}
      </p>
    ) : null

  const valgteFiler = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) void s.leggTil(e.target.files)
    // samme fil skal kunne velges på nytt etter at den er fjernet
    e.target.value = ''
  }

  // Selve filene tas imot av vindus-lytteren over, som ser hele skjemaet
  const slipp = (e: ReactDragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setDrar(false)
  }

  const fullt = s.bilder.length + s.behandler >= MAKS_BILDER

  return (
    <form ref={skjemaRef} className="tb-panel" onSubmit={s.send} onInput={s.merk} noValidate>
      <section className="tb-del">
        <h2 className="tb-sporsmal">1. Hva slags jobb gjelder det?</h2>
        <div className="tb-rad">
          <input
            className={felt('jobbtype')}
            name="jobbtype"
            type="text"
            maxLength={120}
            placeholder="Skrive type jobb"
            aria-label="Hva slags jobb gjelder det?"
            defaultValue={utkast.jobbtype ?? ''}
          />
        </div>
        {feilFor('jobbtype')}
      </section>

      <section className="tb-del">
        <h2 className="tb-sporsmal">2. Hvor er jobben?</h2>
        <div className="tb-rad">
          <input
            className={felt('adresse')}
            name="adresse"
            type="text"
            maxLength={200}
            autoComplete="street-address"
            placeholder="Postnummer eller adresse"
            aria-label="Hvor er jobben?"
            defaultValue={utkast.adresse ?? ''}
          />
        </div>
        {feilFor('adresse')}
      </section>

      <section className="tb-del">
        <h2 className="tb-sporsmal">3. Omtrent hvor stort er arealet?</h2>
        <div className="tb-rad">
          <input
            className={felt('areal')}
            name="areal"
            type="text"
            maxLength={40}
            placeholder="f.eks. 80 m²"
            aria-label="Omtrent hvor stort er arealet?"
            defaultValue={utkast.areal ?? ''}
          />
        </div>
      </section>

      <section className="tb-del">
        <h2 className="tb-sporsmal">4. Når ønsker du at jobben kan utføres?</h2>
        <div className="tb-rad">
          <input
            className={felt('tidspunkt')}
            name="tidspunkt"
            type="text"
            maxLength={120}
            placeholder="Skriv ønsket tidspunkt eller periode"
            aria-label="Når ønsker du at jobben kan utføres?"
            defaultValue={utkast.tidspunkt ?? ''}
          />
        </div>
      </section>

      <section className="tb-del">
        <h2 className="tb-sporsmal">5. Legg ved bilder (valgfritt)</h2>
        <button
          type="button"
          className={`tb-slipp${drar ? ' tb-slipp--over' : ''}${s.feilFelt === 'bilder' ? ' felt-feil' : ''}`}
          data-felt="bilder"
          onClick={() => filRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            if (!fullt) setDrar(true)
          }}
          onDragLeave={() => setDrar(false)}
          onDrop={slipp}
          disabled={fullt || s.status === 'sender'}
        >
          <img src={icOpplasting} alt="" loading="lazy" decoding="async" />
          <strong>
            {s.behandler > 0
              ? 'Klargjør bildene …'
              : fullt
                ? `Du har lagt til ${MAKS_BILDER} bilder`
                : 'Klikk for å laste opp bilder'}
          </strong>
          <small>JPG, PNG eller HEIC- maks 10 MB</small>
        </button>
        <input
          ref={filRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={valgteFiler}
          aria-label="Velg bilder"
        />
        {s.bilder.length > 0 && (
          <ul className="tb-bilder">
            {s.bilder.map((b) => (
              <li key={b.id} className="tb-bilde">
                <img src={b.url} alt="" />
                <button type="button" aria-label={`Fjern bildet ${b.navn}`} onClick={() => s.fjern(b.id)}>
                  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
        {s.bildeFeil && (
          <p className="tb-bildefeil" role="alert">
            {s.bildeFeil}
          </p>
        )}
        {feilFor('bilder')}
      </section>

      <section className="tb-del">
        <h2 className="tb-sporsmal">6. Beskriv kort jobben (valgfritt)</h2>
        <div className="tb-rad">
          <textarea
            className={`${felt('melding')} tb-felt--stor`}
            name="melding"
            maxLength={5000}
            placeholder="Skriv gjerne noen linjer om hva som skal gjøres, farger, spesielle ønsker osv."
            aria-label="Beskriv kort jobben"
            defaultValue={utkast.melding ?? ''}
          />
        </div>
      </section>

      {/* Bolken som ikke står i designet, men uten den kan ingen svare kunden */}
      <section className="tb-del">
        <h2 className="tb-sporsmal">7. Hvordan når vi deg?</h2>
        <div className="tb-rad">
          <input
            className={felt('navn')}
            name="navn"
            type="text"
            maxLength={120}
            autoComplete="name"
            placeholder="Navn, etternavn"
            aria-label="Navn, etternavn"
            defaultValue={utkast.navn ?? ''}
          />
        </div>
        {feilFor('navn')}
        <div className="tb-rad tb-rad--2">
          <input
            className={felt('telefon')}
            name="telefon"
            type="tel"
            maxLength={40}
            autoComplete="tel"
            inputMode="tel"
            placeholder="Telefon"
            aria-label="Telefon (telefon eller e-post må fylles ut)"
            defaultValue={utkast.telefon ?? ''}
          />
          <input
            className={felt('epost')}
            name="epost"
            type="email"
            maxLength={200}
            autoComplete="email"
            placeholder="E-post"
            aria-label="E-post (telefon eller e-post må fylles ut)"
            defaultValue={utkast.epost ?? ''}
          />
        </div>
        {feilFor('telefon', 'epost')}
      </section>

      {/* Bekreftelsen på at personvernerklæringen er lest, før noe sendes. */}
      <section className="tb-del">
        <label className={`skjema-samtykke${s.feilFelt === 'samtykke' ? ' felt-feil' : ''}`}>
          <input type="checkbox" name="samtykke" value="ja" data-felt="samtykke" />
          <span>
            Jeg har lest{' '}
            <Link to="/personvern" onClick={(e) => e.stopPropagation()}>
              personvernerklæringen
            </Link>{' '}
            og godtar at Maler Delius AS bruker opplysningene til å svare på henvendelsen og gi
            tilbud. Opplysningene brukes ikke til noe annet.
          </span>
        </label>
        {feilFor('samtykke')}
      </section>

      {/* Honningkrukke: usynlig for folk, fylt ut av roboter. Samme felt som
          i kontaktskjemaet, med et navn autofyllen ikke kjenner igjen. */}
      <input
        className="honning"
        type="text"
        name="tilleggsinfo"
        tabIndex={-1}
        autoComplete="new-password"
        aria-hidden="true"
      />

      <div className="tb-send">
        <button
          type="submit"
          className="tb-knapp btn-press"
          disabled={s.status === 'sender'}
          style={{
            opacity: s.status === 'sender' ? 0.75 : 1,
            cursor: s.status === 'sender' ? 'progress' : 'pointer',
          }}
        >
          {s.knappetekst}
        </button>
      </div>

      {/* Nederst står bare kvitteringen og feil som ikke hører til ett felt */}
      <div ref={statusRef} className="tb-status" aria-live="polite">
        {s.status === 'sendt' && (
          <SkjemaStatus
            type="ok"
            tittel="Forespørselen ble sendt!"
            tekst="Vi ser på den og tar kontakt med deg så snart som mulig."
          />
        )}
        {s.status === 'feil' && s.feil && !s.feilFelt && <SkjemaStatus type="feil" tekst={s.feil} />}
      </div>
    </form>
  )
}
