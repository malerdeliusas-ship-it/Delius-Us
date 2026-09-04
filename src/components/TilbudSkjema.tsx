import { useEffect, useRef, useState, type ChangeEvent, type DragEvent as ReactDragEvent } from 'react'
import { Link } from 'react-router-dom'
import SkjemaStatus from './SkjemaStatus'
import { JOBBTYPER, MAKS_BILDER, TIDSPUNKT, type TilbudSkjemaTilstand } from '../lib/tilbud'

/**
 * Tilbudsskjemaet: den blå flaten med hvite felt, som kontaktskjemaet på
 * forsiden, bare med plass til det en maler trenger for å gi en pris:
 * hvem du er, hva slags jobb, hvor, hvor stort, når, bilder og noen ord.
 *
 * Flytende layout, så den samme komponenten brukes på desktop (inne i
 * Stage) og på mobil (inne i .m). Utseendet ligger i index.css (`tb-`),
 * logikken i `src/lib/tilbud.ts`. Tilstanden `s` eies av siden rundt, så
 * den overlever at skjemaet bytter mellom mobil- og desktop-utgaven.
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
        f === 'jobbtype' || f === 'bilder'
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

  const felt = (navn: string) => `tb-felt${s.feilFelt === navn ? ' felt-feil' : ''}`
  const utkast = s.utkast.current

  /** Feilmeldingen står ved feltet den gjelder, ikke bare nederst i skjemaet. */
  const feilFor = (...felter: string[]) =>
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
        <h2 className="tb-tittel">Om deg</h2>
        <p className="tb-hjelp">Slik at vi kan ringe eller skrive til deg om tilbudet.</p>
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
            aria-label="Telefon"
            defaultValue={utkast.telefon ?? ''}
          />
          <input
            className={felt('epost')}
            name="epost"
            type="email"
            maxLength={200}
            autoComplete="email"
            placeholder="E-post"
            aria-label="E-post"
            defaultValue={utkast.epost ?? ''}
          />
        </div>
        {feilFor('telefon', 'epost')}
      </section>

      <section className="tb-del">
        <h2 className="tb-tittel">Om jobben</h2>
        <p className="tb-hjelp">Velg det som passer. Du kan velge flere.</p>
        <div
          className={`tb-brikker${s.feilFelt === 'jobbtype' ? ' tb-brikker--feil' : ''}`}
          role="group"
          aria-label="Type jobb"
          data-felt="jobbtype"
        >
          {JOBBTYPER.map((j) => (
            <button
              key={j}
              type="button"
              role="checkbox"
              aria-checked={s.jobbtyper.includes(j)}
              className="tb-brikke"
              onClick={() => s.veksleJobbtype(j)}
            >
              {j}
            </button>
          ))}
        </div>
        {feilFor('jobbtype')}
        <div className="tb-rad tb-rad--2" style={{ marginTop: 22 }}>
          <input
            className={felt('adresse')}
            name="adresse"
            type="text"
            maxLength={200}
            autoComplete="street-address"
            placeholder="Adresse, postnummer og sted"
            aria-label="Adresse"
            defaultValue={utkast.adresse ?? ''}
          />
          <div className="tb-suffiks">
            <input
              className={felt('areal')}
              name="areal"
              type="text"
              maxLength={5}
              inputMode="numeric"
              placeholder="Areal, omtrent (valgfritt)"
              aria-label="Areal i kvadratmeter, valgfritt"
              defaultValue={utkast.areal ?? ''}
            />
            <span aria-hidden="true">m²</span>
          </div>
        </div>
        {feilFor('adresse', 'areal')}
        <p className="tb-hjelp" style={{ marginTop: 22 }}>
          Når passer det å starte? <span className="tb-valgfritt">valgfritt</span>
        </p>
        <div className="tb-brikker" role="group" aria-label="Ønsket oppstart" style={{ marginTop: 12 }}>
          {TIDSPUNKT.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={s.tidspunkt === t}
              className="tb-brikke"
              onClick={() => s.velgTidspunkt(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="tb-del">
        <h2 className="tb-tittel">
          Bilder <span className="tb-valgfritt">valgfritt</span>
        </h2>
        <p className="tb-hjelp">Et par bilder av rommet eller fasaden gjør tilbudet mer presist.</p>
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
          <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <path
              d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.2-1.8c.2-.3.5-.5.9-.5h3.6c.4 0 .7.2.9.5L15.9 6h1.6A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <strong>
            {s.behandler > 0
              ? 'Klargjør bildene …'
              : fullt
                ? `Du har lagt til ${MAKS_BILDER} bilder`
                : 'Legg til bilder'}
          </strong>
          <small>
            Trykk her<span className="tb-dra">, eller dra bildene hit</span>. Inntil {MAKS_BILDER}{' '}
            bilder, gjerne rett fra telefonen.
          </small>
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
        <h2 className="tb-tittel">
          Beskriv jobben <span className="tb-valgfritt">valgfritt</span>
        </h2>
        <div className="tb-rad">
          <textarea
            className={`${felt('melding')} tb-felt--stor`}
            name="melding"
            maxLength={5000}
            placeholder="Hva skal gjøres, hvilke rom eller flater, farger, spesielle ønsker …"
            aria-label="Beskrivelse av jobben"
            defaultValue={utkast.melding ?? ''}
          />
        </div>
        {feilFor('melding')}
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
        <p className="tb-note">
          Opplysningene brukes bare til å svare deg, se{' '}
          <Link to="/personvern">personvernerklæringen</Link>.
        </p>
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
