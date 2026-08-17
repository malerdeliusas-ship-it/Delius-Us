import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { IKKE_SPOR } from '../lib/spor'

/**
 * Innlogging for admin-panelet, rett mot Supabase Auth. Registrering av nye
 * brukere skal være slått AV i Supabase-dashbordet, så den ene brukeren som
 * finnes der er administratoren.
 */

/** undefined = vet ikke ennå (sjekker), null = ikke innlogget. */
export function useOkt(): Session | null | undefined {
  const [okt, setOkt] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    if (!supabase) {
      setOkt(null)
      return
    }
    void supabase.auth.getSession().then(({ data }) => setOkt(data.session))
    const { data: lytter } = supabase.auth.onAuthStateChange((_hendelse, s) => setOkt(s))
    return () => lytter.subscription.unsubscribe()
  }, [])

  // admin-maskinen skal ikke telle med i besøksstatistikken; flagget står
  // til nettleserdataene slettes, med vilje – også utlogget er dette
  // «husets» maskin
  useEffect(() => {
    if (!okt) return
    try {
      localStorage.setItem(IKKE_SPOR, '1')
    } catch {
      /* uten localStorage teller maskinen som vanlig besøk */
    }
  }, [okt])

  return okt
}

export async function loggInn(epost: string, passord: string): Promise<string | null> {
  if (!supabase) return 'Supabase er ikke satt opp (mangler nøkler i .env).'
  const { error } = await supabase.auth.signInWithPassword({ email: epost, password: passord })
  return error ? error.message : null
}

export async function loggUt() {
  await supabase?.auth.signOut()
}

/** Slipper bare innloggede inn; andre sendes til innloggingssiden. */
export function Vakt({ okt, children }: { okt: Session | null | undefined; children: ReactNode }) {
  const { pathname } = useLocation()

  if (okt === undefined) {
    return (
      <div className="adm-laster" style={{ minHeight: '100vh' }}>
        <div className="adm-snurr" />
        Sjekker innlogging …
      </div>
    )
  }
  if (!okt) {
    return <Navigate to="/admin/logg-inn" replace state={{ fra: pathname }} />
  }
  return <>{children}</>
}
