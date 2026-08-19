import { useEffect, useState, type FormEvent } from 'react'
import { loggInn } from '../auth'
import { Felt, Status } from '../deler'
import { folkeligFeil } from '../verktoy'
import { SprakVelger, useSprak } from '../sprak'
import logo from '../../assets/figma/logo-tett.webp'

/**
 * Sperre mot gjetting: tre bomskudd, så er skjemaet stengt i et kvarter.
 *
 * Dette er den ytre døra, ikke den eneste. En som gjetter passord med
 * verktøy går utenom nettleseren og snakker rett med Supabase, og der er
 * det Supabase sin egen grense som gjelder. Sperra her stopper det som
 * faktisk skjer i praksis: noen som sitter og prøver seg fram i skjemaet.
 *
 * Tellingen ligger i localStorage, altså per maskin og nettleser. Den kan
 * tømmes av den som vil nok – men da har man alt bevist at man ikke er
 * kunden som har glemt passordet sitt, og Supabase-grensa står igjen.
 */
const FORSOK = 'md-adm-forsok'
const MAKS = 3
const SPERRE_MS = 15 * 60 * 1000

type Teller = { antall: number; sist: number }

function lesTeller(): Teller {
  try {
    const rå = localStorage.getItem(FORSOK)
    if (!rå) return { antall: 0, sist: 0 }
    const t = JSON.parse(rå) as Teller
    return Number.isFinite(t.antall) && Number.isFinite(t.sist) ? t : { antall: 0, sist: 0 }
  } catch {
    return { antall: 0, sist: 0 }
  }
}

function skrivTeller(t: Teller) {
  try {
    localStorage.setItem(FORSOK, JSON.stringify(t))
  } catch {
    /* privat modus uten lagring – da får man prøve fritt, som før */
  }
}

/** Millisekunder igjen av sperra, eller 0 når skjemaet er åpent. */
function sperretIgjen(t: Teller): number {
  if (t.antall < MAKS) return 0
  const igjen = SPERRE_MS - (Date.now() - t.sist)
  return igjen > 0 ? igjen : 0
}

/** Innloggingssiden. Én bruker, opprettet i Supabase-dashbordet. */
export default function LoggInn() {
  const { t } = useSprak()
  const [epost, setEpost] = useState('')
  const [passord, setPassord] = useState('')
  const [feil, setFeil] = useState<string | null>(null)
  const [sender, setSender] = useState(false)
  const [teller, setTeller] = useState<Teller>(lesTeller)
  const [igjenMs, setIgjenMs] = useState(() => sperretIgjen(lesTeller()))

  // Teller ned mens sperra står, så knappen åpner seg av seg selv.
  useEffect(() => {
    if (igjenMs <= 0) return
    const id = setInterval(() => {
      const nå = sperretIgjen(teller)
      setIgjenMs(nå)
      if (nå <= 0) {
        setFeil(null)
        clearInterval(id)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [igjenMs, teller])

  const sperret = igjenMs > 0
  const minutter = Math.max(1, Math.ceil(igjenMs / 60000))

  async function send(e: FormEvent) {
    e.preventDefault()
    if (sperret) return

    setFeil(null)
    setSender(true)
    const svar = await loggInn(epost.trim(), passord)
    setSender(false)

    if (!svar) {
      // Riktig passord: nullstill, så en glemsom dag ikke henger med videre.
      skrivTeller({ antall: 0, sist: 0 })
      setTeller({ antall: 0, sist: 0 })
      return
      // ved suksess bytter AdminApp selv til panelet (økten endrer seg)
    }

    const ny = { antall: teller.antall + 1, sist: Date.now() }
    skrivTeller(ny)
    setTeller(ny)
    setPassord('')

    if (ny.antall >= MAKS) {
      setIgjenMs(SPERRE_MS)
      setFeil(null)
    } else {
      setFeil(t('login.forsokIgjen', { igjen: MAKS - ny.antall }))
    }
  }

  return (
    <div className="adm">
      <div className="adm-inngang">
        <form className="adm-inngang-kort" onSubmit={send}>
          <SprakVelger />
          <img src={logo} alt="Maler Delius AS" />
          <h1>{t('login.tittel')}</h1>
          <p>{t('login.under')}</p>

          <Felt navn={t('login.epost')} id="inn-epost">
            <input
              id="inn-epost"
              className="adm-inn"
              type="email"
              autoComplete="username"
              required
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
            />
          </Felt>

          <Felt navn={t('login.passord')} id="inn-passord">
            <input
              id="inn-passord"
              className="adm-inn"
              type="password"
              autoComplete="current-password"
              required
              value={passord}
              onChange={(e) => setPassord(e.target.value)}
            />
          </Felt>

          {sperret && (
            <Status type="feil" style={{ marginBottom: 16 }}>
              {t('login.sperret', { min: minutter })}
            </Status>
          )}

          {!sperret && feil && (
            <Status type="feil" style={{ marginBottom: 16 }}>
              {folkeligFeil(feil, t)}
            </Status>
          )}

          <button className="adm-knapp" style={{ width: '100%' }} disabled={sender || sperret}>
            {sender ? t('login.venter') : t('login.knapp')}
          </button>
        </form>
      </div>
    </div>
  )
}
