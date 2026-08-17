import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, Undo2, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { GALLERI, glemGalleriBufferen } from '../../lib/galleri'
import { lastOppBilde } from '../bilder'
import { Laster, Sidetopp, Status } from '../deler'
import { folkeligFeil } from '../verktoy'

/**
 * Galleristyring: de tretten bildeplassene på Portefølje-siden. Hvert bilde
 * kan byttes med ett trykk, og like enkelt settes tilbake til originalen
 * fra designet. Selve plasseringen på siden ligger fast i designet.
 */
export default function Galleri() {
  const [overstyrt, setOverstyrt] = useState<Record<string, string> | null>(null)
  const [feil, setFeil] = useState<string | null>(null)
  const [jobber, setJobber] = useState<string | null>(null) // plass det jobbes med
  const filRef = useRef<HTMLInputElement>(null)
  const valgtPlass = useRef<string | null>(null)

  useEffect(() => {
    let aktiv = true
    async function hent() {
      const { data, error } = await supabase!.from('galleri_bilder').select('plass, bilde_url')
      if (!aktiv) return
      if (error) {
        setFeil(folkeligFeil(error.message))
        setOverstyrt({})
      } else {
        const kart: Record<string, string> = {}
        for (const rad of data ?? []) kart[rad.plass] = rad.bilde_url
        setOverstyrt(kart)
      }
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [])

  function velgFil(plass: string) {
    valgtPlass.current = plass
    filRef.current?.click()
  }

  async function byttBilde(e: ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0]
    e.target.value = ''
    const plass = valgtPlass.current
    if (!fil || !plass) return
    setJobber(plass)
    setFeil(null)
    try {
      const url = await lastOppBilde(fil, 'galleri')
      const { error } = await supabase!
        .from('galleri_bilder')
        .upsert({ plass, bilde_url: url, oppdatert: new Date().toISOString() })
      if (error) throw new Error(error.message)
      setOverstyrt((o) => ({ ...(o ?? {}), [plass]: url }))
      glemGalleriBufferen()
    } catch (f) {
      setFeil(folkeligFeil((f as Error).message))
    }
    setJobber(null)
  }

  async function tilbakestill(plass: string) {
    setJobber(plass)
    setFeil(null)
    const { error } = await supabase!.from('galleri_bilder').delete().eq('plass', plass)
    if (error) {
      setFeil(folkeligFeil(error.message))
    } else {
      setOverstyrt((o) => {
        const neste = { ...(o ?? {}) }
        delete neste[plass]
        return neste
      })
      glemGalleriBufferen()
    }
    setJobber(null)
  }

  return (
    <>
      <Sidetopp
        tittel="Galleri"
        under="Bildene på Portefølje-siden. Bytt et bilde, eller sett tilbake originalen fra designet."
      >
        <a className="adm-knapp adm-knapp--stille" href="/portefolje" target="_blank" rel="noreferrer">
          <ExternalLink size={17} />
          Se siden
        </a>
      </Sidetopp>

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{feil}</Status>}
      {overstyrt === null && <Laster tekst="Henter galleriet …" />}

      {overstyrt !== null && (
        <div className="adm-galleri">
          {GALLERI.map((b) => {
            const url = overstyrt[b.plass]
            const opptatt = jobber === b.plass
            return (
              <div key={b.plass} className="adm-galleri-kort">
                <img src={url ?? b.original} alt={b.navn} loading="lazy" />
                <div className="adm-galleri-info">
                  <div className="adm-galleri-navn">
                    {b.navn}{' '}
                    {url && <span className="adm-merke adm-merke--gronn" style={{ marginLeft: 4 }}>Byttet</span>}
                  </div>
                  <div className="adm-galleri-knapper">
                    <button
                      className="adm-knapp adm-knapp--liten"
                      onClick={() => velgFil(b.plass)}
                      disabled={opptatt}
                    >
                      <ImagePlus size={15} />
                      {opptatt ? 'Jobber …' : 'Bytt bilde'}
                    </button>
                    {url && (
                      <button
                        className="adm-knapp adm-knapp--stille adm-knapp--liten"
                        onClick={() => void tilbakestill(b.plass)}
                        disabled={opptatt}
                      >
                        <Undo2 size={15} />
                        Original
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <input ref={filRef} type="file" accept="image/*" hidden onChange={(e) => void byttBilde(e)} />
    </>
  )
}
