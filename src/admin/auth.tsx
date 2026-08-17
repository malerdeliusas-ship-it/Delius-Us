import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { IKKE_SPOR } from '../lib/spor'
import { useSprak } from './sprak'

/**
 * Innlogging for admin-panelet, rett mot Supabase Auth.
 *
 * Å være innlogget er ikke nok: tilgangen avgjøres av om e-postadressen står
 * i tabellen admin_epost i databasen (funksjonen er_admin()). Det er med vilje
 * – den offentlige nøkkelen ligger i nettleseren, så hvis registrering står
 * åpen i Supabase kan hvem som helst lage seg en bruker. En slik bruker ser og
 * gjør nøyaktig like mye som en helt vanlig besøkende.
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

/** undefined = sjekker, true/false = svaret fra databasen. */
export function useErAdmin(okt: Session | null | undefined): boolean | undefined {
  const [erAdmin, setErAdmin] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (!supabase || okt === undefined) return
    if (!okt) {
      setErAdmin(undefined)
      return
    }
    let aktiv = true
    setErAdmin(undefined)
    void supabase.rpc('er_admin').then(({ data, error }) => {
      if (!aktiv) return
      // feiler oppslaget (f.eks. fordi oppsett.sql ikke er kjørt ennå), sier vi
      // nei – da får man skjermen som forklarer hva som mangler
      setErAdmin(!error && data === true)
    })
    return () => {
      aktiv = false
    }
  }, [okt])

  return erAdmin
}

export async function loggInn(epost: string, passord: string): Promise<string | null> {
  if (!supabase) return 'Supabase er ikke satt opp (mangler nøkler i .env).'
  const { error } = await supabase.auth.signInWithPassword({ email: epost, password: passord })
  return error ? error.message : null
}

export async function loggUt() {
  await supabase?.auth.signOut()
}

function Venter({ tekst }: { tekst: string }) {
  return (
    <div className="adm-laster" style={{ minHeight: '100vh' }}>
      <div className="adm-snurr" />
      {tekst}
    </div>
  )
}

/** Innlogget, men e-posten står ikke i admin_epost. */
function UtenTilgang({ epost }: { epost?: string }) {
  const { t } = useSprak()
  const hvem = epost ? t('vakt.som', { epost }) : ''
  return (
    <div className="adm-inngang">
      <div className="adm-inngang-kort" style={{ maxWidth: 520 }}>
        <h1>{t('vakt.ingenTilgang')}</h1>
        <p style={{ marginBottom: 20 }}>{t('vakt.innloggetSom', { hvem })}</p>
        <div className="adm-status adm-status--feil" style={{ marginBottom: 20, display: 'block' }}>
          {t('vakt.leggInn')}
          <div className="adm-kode" style={{ display: 'block', marginTop: 10, padding: '10px 12px' }}>
            insert into admin_epost (epost) values ('{epost ?? 'din@epost.no'}');
          </div>
        </div>
        <button className="adm-knapp" style={{ width: '100%' }} onClick={() => void loggUt()}>
          {t('meny.loggUt')}
        </button>
      </div>
    </div>
  )
}

/** Slipper bare admin inn; andre sendes videre eller får forklaringen over. */
export function Vakt({
  okt,
  erAdmin,
  children,
}: {
  okt: Session | null | undefined
  erAdmin: boolean | undefined
  children: ReactNode
}) {
  const { pathname } = useLocation()
  const { t } = useSprak()

  if (okt === undefined) return <Venter tekst={t('vakt.sjekkerInn')} />
  if (!okt) return <Navigate to="/admin/logg-inn" replace state={{ fra: pathname }} />
  if (erAdmin === undefined) return <Venter tekst={t('vakt.sjekkerTilgang')} />
  if (!erAdmin) return <UtenTilgang epost={okt.user?.email ?? undefined} />

  return <>{children}</>
}
