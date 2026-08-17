import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { huskLenkekode } from '../lib/spor'

/**
 * Sporingslenkene: malerdelius.no/l/facebook-host o.l. Husker koden for
 * økta (så statistikken kan fordele trafikken per lenke) og sender den
 * besøkende rett videre til siden lenken peker på. Selve tellingen skjer
 * i useSporing når målsiden vises – her telles ingenting, ellers ville
 * hvert klikk blitt to visninger.
 *
 * Oppslaget går gjennom funksjonen slaa_opp_lenke, ikke rett på tabellen:
 * da får den besøkende bare vite hvor denne ene koden peker, og ikke se
 * resten av kampanjelenkene våre.
 */
export default function Lenkevideresending() {
  const { kode = '' } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    let aktiv = true
    huskLenkekode(kode)

    async function videre() {
      let mal = '/'
      if (supabase) {
        const { data } = await supabase.rpc('slaa_opp_lenke', { p_kode: kode })
        // bare interne stier godtas, så en kode aldri kan sende folk ut av
        // nettstedet selv om noe skulle stå feil i databasen
        if (typeof data === 'string' && /^\/[a-z0-9/-]*$/i.test(data)) mal = data
      }
      if (aktiv) navigate(mal, { replace: true })
    }

    void videre()
    return () => {
      aktiv = false
    }
  }, [kode]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
