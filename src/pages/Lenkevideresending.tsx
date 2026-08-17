import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, type Lenke } from '../lib/supabase'
import { huskLenkekode } from '../lib/spor'

/**
 * Sporingslenkene: malerdelius.no/l/facebook-host o.l. Husker koden for
 * økta (så statistikken kan fordele trafikken per lenke) og sender den
 * besøkende rett videre til siden lenken peker på. Selve tellingen skjer
 * i useSporing når målsiden vises – her telles ingenting, ellers ville
 * hvert klikk blitt to visninger.
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
        const { data } = await supabase
          .from('lenker')
          .select('mal')
          .eq('kode', kode.toLowerCase())
          .maybeSingle<Pick<Lenke, 'mal'>>()
        if (data?.mal) mal = data.mal
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
