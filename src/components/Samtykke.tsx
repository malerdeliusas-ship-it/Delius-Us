import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { harAnalyse } from '../lib/analyse'
import { APNE_HENDELSE, settSamtykke, useSamtykke, type Valg } from '../lib/samtykke'

/**
 * Banneret som spør om informasjonskapsler.
 *
 * Laget etter Datatilsynets krav til et gyldig samtykke: «Bare nødvendige»
 * står like stort og like lett tilgjengelig som «Godta alle», ingenting er
 * krysset av på forhånd, hvert formål kan velges for seg under «Tilpass»,
 * og siden er fullt brukbar uten å svare. Svaret kan endres når som helst
 * fra siden /informasjonskapsler, som åpner det samme banneret igjen.
 *
 * Banneret vises ikke i admin-panelet eller på sporingslenkene, og det
 * finnes ikke i forhåndsrendrede skall (se tools/forhaandsrender.mjs).
 */
export default function Samtykke() {
  const samtykke = useSamtykke()
  const { pathname } = useLocation()
  const [tvunget, setTvunget] = useState(false)
  const [tilpass, setTilpass] = useState(false)
  const [valg, setValg] = useState<Valg>({ statistikk: false, markedsforing: false, eksternt: false })
  const boks = useRef<HTMLDivElement>(null)

  // Cookie-siden ber banneret åpne seg igjen, med valgene synlige
  useEffect(() => {
    const apne = () => {
      setValg({
        statistikk: samtykke?.statistikk === true,
        markedsforing: samtykke?.markedsforing === true,
        eksternt: samtykke?.eksternt === true,
      })
      setTilpass(true)
      setTvunget(true)
    }
    window.addEventListener(APNE_HENDELSE, apne)
    return () => window.removeEventListener(APNE_HENDELSE, apne)
  }, [samtykke])

  // Åpnet av besøkeren selv: da skal tastaturet lande i banneret
  useEffect(() => {
    if (tvunget) boks.current?.focus()
  }, [tvunget])

  if (pathname.startsWith('/admin') || pathname.startsWith('/l/')) return null
  if (samtykke && !tvunget) return null

  const lagre = (v: Valg) => {
    settSamtykke(v)
    setTvunget(false)
    setTilpass(false)
  }

  return (
    <div
      ref={boks}
      className="samtykke"
      role="dialog"
      aria-labelledby="samtykke-tittel"
      aria-describedby="samtykke-tekst"
      tabIndex={-1}
    >
      <h2 id="samtykke-tittel" className="samtykke-tittel">
        Informasjonskapsler
      </h2>
      <p id="samtykke-tekst" className="samtykke-tekst">
        Nettstedet fungerer uten at du godtar noe. Sier du ja, bruker vi
        {harAnalyse
          ? ' Google Analytics til besøksstatistikk, Google Ads-måling til å se om annonsene våre virker, og'
          : ''}{' '}
        Google Maps til kartet på kontaktsiden. Aldri personlig tilpassede annonser. Du kan
        ombestemme deg når som helst.{' '}
        <Link to="/informasjonskapsler" className="samtykke-lenke">
          Les om informasjonskapslene
        </Link>
      </p>

      {tilpass && (
        <ul className="samtykke-valg">
          <li>
            <label>
              <input type="checkbox" checked disabled />
              <span>
                <strong>Nødvendige</strong> – husker valget ditt her og om du har skrudd av
                musikken. Alltid på.
              </span>
            </label>
          </li>
          {harAnalyse && (
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={valg.statistikk}
                  onChange={(e) => setValg({ ...valg, statistikk: e.target.checked })}
                />
                <span>
                  <strong>Statistikk</strong> – Google Analytics teller besøk og hvilke sider
                  som leses. Setter kapslene _ga og _ga_… i inntil to år.
                </span>
              </label>
            </li>
          )}
          {harAnalyse && (
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={valg.markedsforing}
                  onChange={(e) => setValg({ ...valg, markedsforing: e.target.checked })}
                />
                <span>
                  <strong>Markedsføring</strong> – Google Ads får vite om et besøk kom fra en
                  annonse og om det førte til en henvendelse. Kapslene _gcl_… i inntil tre
                  måneder. Ingen personlig tilpassede annonser.
                </span>
              </label>
            </li>
          )}
          <li>
            <label>
              <input
                type="checkbox"
                checked={valg.eksternt}
                onChange={(e) => setValg({ ...valg, eksternt: e.target.checked })}
              />
              <span>
                <strong>Innhold fra Google</strong> – kartet på kontaktsiden hentes fra Google
                Maps, som da setter sine egne kapsler.
              </span>
            </label>
          </li>
        </ul>
      )}

      <div className="samtykke-knapper">
        {tilpass ? (
          <button type="button" className="samtykke-knapp samtykke-knapp--gul" onClick={() => lagre(valg)}>
            Lagre valgene mine
          </button>
        ) : (
          <button
            type="button"
            className="samtykke-knapp samtykke-knapp--gul"
            onClick={() => lagre({ statistikk: harAnalyse, markedsforing: harAnalyse, eksternt: true })}
          >
            Godta alle
          </button>
        )}
        <button
          type="button"
          className="samtykke-knapp samtykke-knapp--hvit"
          onClick={() => lagre({ statistikk: false, markedsforing: false, eksternt: false })}
        >
          Bare nødvendige
        </button>
        {!tilpass && (
          <button
            type="button"
            className="samtykke-knapp samtykke-knapp--tekst"
            onClick={() => setTilpass(true)}
            aria-expanded={tilpass}
          >
            Tilpass
          </button>
        )}
      </div>
    </div>
  )
}
