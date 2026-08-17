import { useState, type FormEvent } from 'react'
import { loggInn } from '../auth'
import { Felt, Status } from '../deler'
import { folkeligFeil } from '../verktoy'
import logo from '../../assets/figma/logo.png'

/** Innloggingssiden. Én bruker, opprettet i Supabase-dashbordet. */
export default function LoggInn() {
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
    if (svar) setFeil(folkeligFeil(svar))
    // ved suksess bytter AdminApp selv til panelet (økten endrer seg)
  }

  return (
    <div className="adm">
      <div className="adm-inngang">
        <form className="adm-inngang-kort" onSubmit={send}>
          <img src={logo} alt="Maler Delius AS" />
          <h1>Admin-panelet</h1>
          <p>Logg inn for å styre bloggen, galleriet og statistikken.</p>

          <Felt navn="E-post">
            <input
              className="adm-inn"
              type="email"
              autoComplete="username"
              required
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
            />
          </Felt>

          <Felt navn="Passord">
            <input
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
            {sender ? 'Logger inn …' : 'Logg inn'}
          </button>
        </form>
      </div>
    </div>
  )
}
