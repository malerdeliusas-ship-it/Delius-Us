import { useRef, useState } from 'react'

/**
 * Felles logikk for de to kontaktskjemaene (desktop og mobil).
 *
 * Skjemaet sendes til serverfunksjonen `/api/kontakt`, som legger meldingen
 * i e-post via Resend. Feltnavnene er de samme begge steder: navn, epost,
 * melding – pluss honningkrukka `firma`, som bare roboter fyller ut.
 */

export type Status = 'klar' | 'sender' | 'sendt' | 'feil'

const EPOST_MONSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Feilmeldingene brukeren ser. Alt står på norsk, som resten av siden. */
const FEIL = {
  navn: 'Skriv inn navnet ditt.',
  epost: 'Skriv inn en gyldig e-postadresse.',
  melding: 'Skriv noen ord om hva du trenger hjelp til.',
  server:
    'Meldingen kunne ikke sendes akkurat nå. Prøv igjen, eller ring oss på 966 93 780.',
}

export function useKontaktSkjema() {
  const [status, setStatus] = useState<Status>('klar')
  const [feil, setFeil] = useState('')
  /** Tidspunktet skjemaet ble tegnet – brukes til å avsløre robotinnsending. */
  const apnet = useRef(Date.now())

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sender') return

    const skjema = e.currentTarget
    const data = new FormData(skjema)
    const navn = String(data.get('navn') ?? '').trim()
    const epost = String(data.get('epost') ?? '').trim()
    const melding = String(data.get('melding') ?? '').trim()
    const firma = String(data.get('firma') ?? '')

    if (!navn) return vis(FEIL.navn)
    if (!EPOST_MONSTER.test(epost)) return vis(FEIL.epost)
    if (melding.length < 5) return vis(FEIL.melding)

    setFeil('')
    setStatus('sender')

    try {
      const svar = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navn,
          epost,
          melding,
          firma,
          apnet: Date.now() - apnet.current,
          side: window.location.pathname,
        }),
      })

      if (!svar.ok) throw new Error(String(svar.status))

      skjema.reset()
      setStatus('sendt')
    } catch {
      setStatus('feil')
      setFeil(FEIL.server)
    }
  }

  function vis(melding: string) {
    setStatus('feil')
    setFeil(melding)
  }

  /** Teksten på knappen følger status, så brukeren ser at noe skjer. */
  const knappetekst =
    status === 'sender' ? 'Sender …' : status === 'sendt' ? 'Takk!' : 'Kontakt oss'

  return { status, feil, send, knappetekst }
}

/** Kvitteringen under skjemaet når meldingen er kommet fram. */
export const KVITTERING = 'Takk! Vi har fått meldingen din og svarer så snart vi kan.'
