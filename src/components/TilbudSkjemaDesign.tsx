import { useRef, useState, type CSSProperties, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import SkjemaStatus from './SkjemaStatus'
import { C, FONT } from '../lib/theme'
import { MAKS_BILDER, type Felt, type TilbudSkjemaTilstand } from '../lib/tilbud'
import icOpplasting from '../assets/figma/ic-opplasting.webp'

/**
 * Tilbudsskjemaet slik det er tegnet i Figma: seks nummererte spørsmål i én
 * spalte, 718px bred, med hvite avrundede felt på den blå flaten. Står to
 * steder med samme mål: Kontakt-siden og nederst på forsiden. `l` og `t` er
 * øverste venstre hjørne av det første spørsmålet.
 *
 * Alle avstander er hentet rett fra designet (`inputs`-rammen har 27px
 * mellom hvert element, og 30px ned til meldingsfeltet og knappen).
 *
 * Bolk 7, kontaktopplysningene, er ikke tegnet i Figma. Uten navn og en
 * måte å nå kunden på kommer henvendelsen fram uten noen måte å svare, så
 * den er lagt til nederst i samme stil. Under den står avkryssingen for
 * personvernerklæringen, som personvernforordningen artikkel 13 ber om
 * før opplysningene samles inn. Til sammen er spalten `EKSTRA_HOYDE`
 * piksler høyere enn i designet.
 */

/** Så mye høyere skjemaet er enn Figma-rammen: bolk 7 (237) og avkryssingen (60). */
export const EKSTRA_HOYDE = 297

/** Etikettene over feltene: samme blå som resten, men dempet. */
const ETIKETT = 'rgba(2,34,105,0.62)'

/** Loddrette avstander i spalten, målt fra første etikett. */
const Y = {
  q1: 0,
  f1: 57,
  q2: 146,
  f2: 202,
  q3: 291,
  f3: 347,
  q4: 436,
  f4: 492,
  q5: 585,
  slipp: 641,
  q6: 842,
  melding: 901,
  q7: 1078,
  navn: 1134,
  kontakt: 1223,
  samtykke: 1315,
  knapp: 1375,
  status: 1449,
}

/** Bredden på spalten, og på de to feltene som deler en linje. */
const BREDDE = 718
const HALV = (BREDDE - 24) / 2

export default function TilbudSkjemaDesign({
  l,
  t,
  s,
}: {
  l: number
  t: number
  s: TilbudSkjemaTilstand
}) {
  const filRef = useRef<HTMLInputElement>(null)
  const [drar, setDrar] = useState(false)
  const utkast = s.utkast.current

  const etikett = (dy: number, tekst: string) => (
    <div
      style={{
        position: 'absolute',
        left: l,
        top: t + dy,
        width: BREDDE,
        fontFamily: FONT,
        fontSize: 20,
        fontWeight: 700,
        lineHeight: '30px',
        color: ETIKETT,
      }}
    >
      {tekst}
    </div>
  )

  /** Hvitt felt med designets radius, polstring og typografi. */
  const feltStil = (dy: number, h: number, ph: string, w = BREDDE, dx = 0): CSSProperties =>
    ({
      position: 'absolute',
      left: l + dx,
      top: t + dy,
      width: w,
      height: h,
      borderRadius: 43,
      background: C.white,
      border: 'none',
      outline: 'none',
      padding: '16px 66px 16px 32px',
      fontFamily: FONT,
      fontSize: 20,
      fontWeight: 400,
      lineHeight: '30px',
      color: C.navy,
      resize: 'none',
      '--ph': ph,
    }) as CSSProperties

  const klasse = (navn: Felt) => `field${s.feilFelt === navn ? ' felt-feil' : ''}`

  const valgteFiler = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) void s.leggTil(e.target.files)
    // samme fil skal kunne velges på nytt etter at den er fjernet
    e.target.value = ''
  }

  const fullt = s.bilder.length + s.behandler >= MAKS_BILDER
  const harBilder = s.bilder.length > 0 || s.behandler > 0

  return (
    <form onSubmit={s.send} onInput={s.merk} noValidate>
      {etikett(Y.q1, '1. Hva slags jobb gjelder det?')}
      <input
        className={klasse('jobbtype')}
        name="jobbtype"
        type="text"
        maxLength={120}
        placeholder="Skrive type jobb"
        aria-label="Hva slags jobb gjelder det?"
        defaultValue={utkast.jobbtype ?? ''}
        style={feltStil(Y.f1, 62, 'rgba(2,3,105,0.46)')}
      />

      {etikett(Y.q2, '2. Hvor er jobben?')}
      <input
        className={klasse('adresse')}
        name="adresse"
        type="text"
        maxLength={200}
        autoComplete="street-address"
        placeholder="Postnummer eller adresse"
        aria-label="Hvor er jobben?"
        defaultValue={utkast.adresse ?? ''}
        style={feltStil(Y.f2, 62, C.placeholder)}
      />

      {etikett(Y.q3, '3. Omtrent hvor stort er arealet?')}
      <input
        className={klasse('areal')}
        name="areal"
        type="text"
        maxLength={40}
        placeholder="f.eks. 80 m²"
        aria-label="Omtrent hvor stort er arealet?"
        defaultValue={utkast.areal ?? ''}
        style={feltStil(Y.f3, 62, C.placeholder)}
      />

      {etikett(Y.q4, '4. Når ønsker du at jobben kan utføres?')}
      <input
        className={klasse('tidspunkt')}
        name="tidspunkt"
        type="text"
        maxLength={120}
        placeholder="Skriv ønsket tidspunkt eller periode"
        aria-label="Når ønsker du at jobben kan utføres?"
        defaultValue={utkast.tidspunkt ?? ''}
        style={feltStil(Y.f4, 66, C.placeholder)}
      />

      {etikett(Y.q5, '5. Legg ved bilder (valgfritt)')}
      <div
        style={{
          position: 'absolute',
          left: l,
          top: t + Y.slipp,
          width: BREDDE,
          height: 174,
          borderRadius: 43,
          background: C.white,
          boxShadow: drar ? `0 0 0 2px ${C.gold}` : undefined,
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!fullt) setDrar(true)
        }}
        onDragLeave={() => setDrar(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrar(false)
        }}
      >
        {/* Klikkflaten dekker hele boksen og ligger under miniatyrene, så
            «fjern»-knappene deres ikke havner inni en annen knapp. */}
        <button
          type="button"
          className={s.feilFelt === 'bilder' ? 'felt-feil' : undefined}
          data-felt="bilder"
          onClick={() => filRef.current?.click()}
          disabled={fullt || s.status === 'sender'}
          aria-label="Legg ved bilder"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: 43,
            background: 'transparent',
            cursor: fullt ? 'default' : 'pointer',
          }}
        />

        {!harBilder && (
          <>
            <img
              src={icOpplasting}
              alt=""
              loading="lazy"
              decoding="async"
              style={{
                position: 'absolute',
                left: 181,
                top: 29,
                width: 64,
                height: 55,
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 268,
                top: 26,
                width: 259,
                fontFamily: FONT,
                fontSize: 20,
                lineHeight: '30px',
                color: C.placeholder,
                whiteSpace: 'pre-wrap',
                pointerEvents: 'none',
              }}
            >
              {'Klikk for å laste opp bilder\neller dra og slipp her'}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 181,
                top: 122,
                width: 346,
                fontFamily: FONT,
                fontSize: 20,
                lineHeight: '30px',
                color: C.placeholder,
                pointerEvents: 'none',
              }}
            >
              JPG, PNG eller HEIC- maks 10 MB
            </div>
          </>
        )}

        {harBilder && (
          <ul
            style={{
              position: 'absolute',
              left: 32,
              top: 32,
              display: 'flex',
              gap: 12,
              listStyle: 'none',
              alignItems: 'center',
            }}
          >
            {s.bilder.map((b) => (
              <li key={b.id} style={{ position: 'relative' }}>
                <img
                  src={b.url}
                  alt=""
                  style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 20 }}
                />
                <button
                  type="button"
                  aria-label={`Fjern bildet ${b.navn}`}
                  onClick={() => s.fjern(b.id)}
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -6,
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    background: C.navy,
                    color: C.white,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                    <path
                      d="M2 2l8 8M10 2l-8 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
            {s.behandler > 0 && (
              <li
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 20,
                  background: '#eef2fb',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: FONT,
                  fontSize: 14,
                  color: C.placeholder,
                }}
              >
                Klargjør …
              </li>
            )}
          </ul>
        )}

        {harBilder && (
          <div
            style={{
              position: 'absolute',
              left: 32,
              top: 138,
              width: BREDDE - 64,
              fontFamily: FONT,
              fontSize: 16,
              lineHeight: '24px',
              color: C.placeholder,
              pointerEvents: 'none',
            }}
          >
            {fullt
              ? `Du har lagt til ${MAKS_BILDER} bilder.`
              : 'Klikk for å legge til flere, eller dra og slipp her.'}
            {s.bildeFeil ? ` ${s.bildeFeil}` : ''}
          </div>
        )}
      </div>
      <input
        ref={filRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={valgteFiler}
        aria-label="Velg bilder"
      />

      {etikett(Y.q6, '6. Beskriv kort jobben (valgfritt)')}
      <textarea
        className={klasse('melding')}
        name="melding"
        maxLength={5000}
        placeholder="Skriv gjerne noen linjer om hva som skal gjøres, farger, spesielle ønsker osv."
        aria-label="Beskriv kort jobben"
        defaultValue={utkast.melding ?? ''}
        style={feltStil(Y.melding, 147, C.placeholder)}
      />

      {/* Bolken som ikke står i designet, men uten den kan ingen svare kunden */}
      {etikett(Y.q7, '7. Hvordan når vi deg?')}
      <input
        className={klasse('navn')}
        name="navn"
        type="text"
        maxLength={120}
        autoComplete="name"
        placeholder="Navn, etternavn"
        aria-label="Navn, etternavn"
        defaultValue={utkast.navn ?? ''}
        style={feltStil(Y.navn, 62, C.placeholder)}
      />
      <input
        className={klasse('telefon')}
        name="telefon"
        type="tel"
        maxLength={40}
        inputMode="tel"
        autoComplete="tel"
        placeholder="Telefon"
        aria-label="Telefon (telefon eller e-post må fylles ut)"
        defaultValue={utkast.telefon ?? ''}
        style={feltStil(Y.kontakt, 62, C.placeholder, HALV)}
      />
      <input
        className={klasse('epost')}
        name="epost"
        type="email"
        maxLength={200}
        autoComplete="email"
        placeholder="E-post"
        aria-label="E-post (telefon eller e-post må fylles ut)"
        defaultValue={utkast.epost ?? ''}
        style={feltStil(Y.kontakt, 62, C.placeholder, HALV, HALV + 24)}
      />

      {/* Bekreftelsen på at personvernerklæringen er lest. Ikke i designet,
          men opplysningene skal ikke samles inn før kunden vet hva de brukes
          til, og avkryssingen sendes med i e-posten som dokumentasjon. */}
      <label
        className={`skjema-samtykke${s.feilFelt === 'samtykke' ? ' felt-feil' : ''}`}
        style={{ position: 'absolute', left: l, top: t + Y.samtykke, width: BREDDE }}
      >
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

      {/* Honningkrukke: usynlig for folk, fylt ut av roboter. Navnet må ikke
          ligne på et ekte felt, ellers fyller autofyllen det for kunden. */}
      <input
        className="honning"
        type="text"
        name="tilleggsinfo"
        tabIndex={-1}
        autoComplete="new-password"
        aria-hidden="true"
      />

      <button
        type="submit"
        className="btn-press"
        disabled={s.status === 'sender'}
        style={{
          position: 'absolute',
          left: l,
          top: t + Y.knapp,
          width: 300,
          height: 58,
          borderRadius: 65,
          background: C.goldAlt,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 18,
          lineHeight: '26px',
          color: C.formText,
          cursor: s.status === 'sender' ? 'progress' : 'pointer',
          opacity: s.status === 'sender' ? 0.75 : 1,
        }}
      >
        {s.knappetekst}
      </button>

      {/* Kvitteringen og feilmeldingen står under knappen, i den ledige
          plassen ned mot kontaktraden, så ingenting flytter seg. */}
      <div
        aria-live="polite"
        style={{ position: 'absolute', left: l, top: t + Y.status, width: BREDDE, fontFamily: FONT }}
      >
        {s.status === 'sendt' && (
          <SkjemaStatus
            type="ok"
            tittel="Forespørselen ble sendt!"
            tekst="Vi ser på den og tar kontakt med deg så snart som mulig."
          />
        )}
        {s.status === 'feil' && s.feil && <SkjemaStatus type="feil" tekst={s.feil} />}
      </div>
    </form>
  )
}
