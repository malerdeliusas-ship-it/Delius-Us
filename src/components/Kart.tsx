import { useEffect, useRef, useState } from 'react'
import { BEDRIFT } from '../lib/theme'
import { settSamtykke, useSamtykke } from '../lib/samtykke'

/**
 * Google Maps-innbyggingen på Kontakt-siden.
 *
 * Kartet hentes fra Google, og Google setter sine egne informasjonskapsler
 * så snart rammen er lastet. Etter ekomloven § 3-15 må besøkeren ha sagt ja
 * til det først. Derfor står det en rolig flate i nøyaktig samme størrelse
 * her til besøkeren enten har godtatt «innhold fra Google» i banneret, eller
 * trykker på knappen i flaten. Adressen er uansett lenket rett til Google
 * Maps i en ny fane, så ingen trenger kartet for å finne fram.
 *
 * Når kartet er tillatt, holdes rammen likevel tilbake til besøkeren nærmer
 * seg den: Google laster rundt 380 kB med skript så snart rammen finnes i
 * dokumentet, og kartet står nederst på en lang side.
 *
 * Vi peker rett på /maps/embed: den korte /maps?q=…&output=embed-varianten
 * svarer med en omdirigering som har `X-Frame-Options: SAMEORIGIN`, og da
 * nekter nettleseren å vise rammen.
 */
const KART_EMBED = `https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1s${encodeURIComponent(
  BEDRIFT.adresse
)}`

export default function Kart() {
  const samtykke = useSamtykke()
  const tillatt = samtykke?.eksternt === true
  const ref = useRef<HTMLDivElement>(null)
  const [naer, setNaer] = useState(false)

  useEffect(() => {
    if (!tillatt || naer) return
    const el = ref.current
    // Uten IntersectionObserver (eldre nettlesere) viser vi kartet med en gang
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNaer(true)
      return
    }
    const io = new IntersectionObserver(
      (poster) => {
        if (poster.some((p) => p.isIntersecting)) {
          setNaer(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [tillatt, naer])

  const tillat = () =>
    settSamtykke({
      statistikk: samtykke?.statistikk === true,
      markedsforing: samtykke?.markedsforing === true,
      eksternt: true,
    })

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', background: '#e8ecf4' }}>
      {tillatt && naer ? (
        <iframe
          title="Maler Delius AS på kartet"
          src={KART_EMBED}
          style={{ border: 0, display: 'block', width: '100%', height: '100%' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        !tillatt && (
          <div className="kart-vent">
            <p>
              Kartet hentes fra Google Maps. Google setter sine egne informasjonskapsler når
              det vises, så vi venter til du sier ja.
            </p>
            <div className="kart-vent-knapper">
              <button type="button" className="kart-vent-knapp" onClick={tillat}>
                Vis kartet fra Google Maps
              </button>
              <a href={BEDRIFT.kart} target="_blank" rel="noreferrer" className="kart-vent-lenke">
                Åpne adressen i Google Maps i en ny fane
              </a>
            </div>
          </div>
        )
      )}
    </div>
  )
}
