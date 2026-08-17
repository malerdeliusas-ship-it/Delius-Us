import { useState, type FormEvent } from 'react'
import { loggInn } from '../auth'
import { Felt, Status } from '../deler'
import { folkeligFeil } from '../verktoy'
import { SprakVelger, useSprak } from '../sprak'
import logo from '../../assets/figma/logo.png'

/** Innloggingssiden. Én bruker, opprettet i Supabase-dashbordet. */
export default function LoggInn() {
  const { t } = useSprak()
  const [epost, setEpost] = useState('')
  const [passord, setPassord] = useState('')
  const [feil, setFeil] = useState<string | null>(null)
  const [sender, setSender] = useState(false)

  async function send(e: FormEvent) {
    e.preventDefault()
    setFeil(null)
    setSender(true)
    const svar = await loggInn(epost.trim(), passord)
    setSender(false)
    if (svar) setFeil(folkeligFeil(svar, t))
    // ved suksess bytter AdminApp selv til panelet (økten endrer seg)
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

          {feil && <Status type="feil" style={{ marginBottom: 16 }}>{feil}</Status>}

          <button className="adm-knapp" style={{ width: '100%' }} disabled={sender}>
            {sender ? t('login.venter') : t('login.knapp')}
          </button>
        </form>
      </div>
    </div>
  )
}
