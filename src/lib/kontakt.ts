import { useRef, useState } from 'react'

/**
 * Felles logikk for de to kontaktskjemaene (desktop og mobil).
 *
 * Skjemaet sendes til serverfunksjonen `/api/kontakt`, som legger meldingen
 * i e-post via Resend. Feltnavnene er de samme begge steder: navn, epost,
 * melding – pluss honningkrukka `tilleggsinfo`, som bare roboter fyller ut.
 * Navnet er med vilje uten mening: heter feltet «firma» eller «adresse»,
 * fyller nettleserens autofyll det ut for kunden, og da hadde en ekte
 * henvendelse sett ut som en robot.
 */

export type Status = 'klar' | 'sender' | 'sendt' | 'feil'

const EPOST_MONSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Feilmeldingene brukeren ser. Alt står på norsk, som resten av siden. */
const FEIL = {
  navn: 'Skriv inn navnet ditt.',
  epost: 'Skriv inn en gyldig e-postadresse.',
  melding: 'Skriv noen ord om hva du trenger hjelp til.',
  forMange:
    'Det er sendt mange meldinger herfra på kort tid. Vent noen minutter og prøv igjen.',
  server:
    'Meldingen kunne ikke sendes akkurat nå. Prøv igjen, eller ring oss på 966 93 780.',
}

export type Felt = 'navn' | 'epost' | 'melding' | null

export function useKontaktSkjema() {
  const [status, setStatus] = useState<Status>('klar')
  const [feil, setFeil] = useState('')
  /** Feltet som stoppet innsendingen – det får rød ring i skjemaet. */
  const [feilFelt, setFeilFelt] = useState<Felt>(null)
  /**
   * Tidspunktet for det første tastetrykket i skjemaet – brukes til å avsløre
   * robotinnsending. Regnet fra første inntasting, ikke fra sidelasting, så
   * autofyll pluss rask innsending ikke rammer ekte folk.
   */
  const forsteTast = useRef<number | null>(null)

  /**
   * Settes som onInput på selve skjemaet. Registrerer første tastetrykk,
   * og rydder bort en rød feilmelding straks brukeren begynner å rette –
   * i stedet for at den blir stående til neste innsending.
   */
  function merk() {
    forsteTast.current ??= Date.now()
    if (status === 'feil') {
      setStatus('klar')
      setFeil('')
      setFeilFelt(null)
    }
  }

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sender') return

    const skjema = e.currentTarget
    const data = new FormData(skjema)
    const navn = String(data.get('navn') ?? '').trim()
    const epost = String(data.get('epost') ?? '').trim()
    const melding = String(data.get('melding') ?? '').trim()
    const krukke = String(data.get('tilleggsinfo') ?? '')

    if (!navn) return vis(FEIL.navn, 'navn')
    if (!EPOST_MONSTER.test(epost)) return vis(FEIL.epost, 'epost')
    if (melding.length < 5) return vis(FEIL.melding, 'melding')

    setFeil('')
    setFeilFelt(null)
    setStatus('sender')

    try {
      const svar = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navn,
          epost,
          melding,
          tilleggsinfo: krukke,
          apnet: forsteTast.current ? Date.now() - forsteTast.current : 0,
          side: window.location.pathname,
        }),
      })

      if (svar.status === 429) return vis(FEIL.forMange)
      if (!svar.ok) throw new Error(String(svar.status))

      skjema.reset()
      setStatus('sendt')
    } catch {
      setStatus('feil')
      setFeil(FEIL.server)
    }
  }

  function vis(melding: string, felt: Felt = null) {
    setStatus('feil')
    setFeil(melding)
    setFeilFelt(felt)
  }

  /** Teksten på knappen følger status, så brukeren ser at noe skjer. */
  const knappetekst =
    status === 'sender' ? 'Sender …' : status === 'sendt' ? 'Takk!' : 'Kontakt oss'

  return { status, feil, feilFelt, send, merk, knappetekst }
}
