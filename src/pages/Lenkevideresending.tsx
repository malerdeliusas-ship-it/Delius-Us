import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { rpc } from '../lib/rest'
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
      const data = await rpc<string | null>('slaa_opp_lenke', { p_kode: kode })
      // bare interne stier godtas, så en kode aldri kan sende folk ut av
      // nettstedet selv om noe skulle stå feil i databasen
      const mal =
        typeof data === 'string' && /^\/[a-z0-9/-]*$/i.test(data) ? data : '/'
      if (aktiv) navigate(mal, { replace: true })
    }

    // Databasen kan være treg eller nede. Etter halvannet sekund gir vi opp
    // og sender folk til forsiden i stedet for å la dem stå på en blank side.
    const nodutgang = setTimeout(() => {
      if (aktiv) {
        aktiv = false
        navigate('/', { replace: true })
      }
    }, 1500)

    void videre().finally(() => clearTimeout(nodutgang))
    return () => {
      aktiv = false
      clearTimeout(nodutgang)
    }
  }, [kode]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
