import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, Undo2, ExternalLink, Smartphone } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { GALLERI, glemGalleriBufferen } from '../../lib/galleri'
import { C } from '../../lib/theme'
import { lastOppBilde } from '../bilder'
import { Laster, Sidetopp, Status } from '../deler'
import { folkeligFeil } from '../verktoy'
import { useSprak } from '../sprak'

/**
 * Galleristyring, tegnet som Portefølje-siden i miniatyr: de samme fargede
 * båndene, kortene og bildene på nøyaktig samme plass som på nettstedet.
 * Da trenger ingen å gjette hvilket bilde som er hvilket – man peker på
 * bildet der det faktisk står, og bytter det der.
 *
 * Miniatyren er de ekte koordinatene fra designet (1430px bredt), krympet
 * med CSS-zoom til å passe panelet – samme knep som nettstedet selv bruker.
 */

/** Utsnittet av siden som vises: fra første bånd til under siste bilde. */
const TOPP = 340
const BUNN = 3351
const HOYDE = BUNN - TOPP

/** Fargebåndene og kortene fra Portefølje-siden, som ren kulisse. */
const BAND = [
  { l: -5, t: 376, w: 1435, h: 669, bg: C.pf[0] },
  { l: 0, t: 990, w: 1430, h: 669, bg: C.pf[1] },
  { l: 0, t: 1609, w: 1432, h: 669, bg: C.pf[2] },
  { l: 0, t: 2246, w: 1427, h: 669, bg: C.pf[3] },
  { l: 0, t: 2874, w: 1432, h: 477, bg: C.pf[4] },
]

const KORT = [
  { l: 495, t: 460, w: 816, h: 466 },
  { l: 119, t: 1086, w: 784, h: 453 },
  { l: 936, t: 1727, w: 715, h: 453 },
  { l: 119, t: 2310, w: 784, h: 526 },
]

export default function Galleri() {
  const { t } = useSprak()
  const [overstyrt, setOverstyrt] = useState<Record<string, string> | null>(null)
  const [feil, setFeil] = useState<string | null>(null)
  const [jobber, setJobber] = useState<string | null>(null) // plassen det jobbes med
  const filRef = useRef<HTMLInputElement>(null)
  const valgtPlass = useRef<string | null>(null)

  // miniatyrens målestokk: fyll bredden på feltet, akkurat som Stage gjør
  const rammeRef = useRef<HTMLDivElement>(null)
  const [skala, setSkala] = useState(0.6)

  useLayoutEffect(() => {
    const el = rammeRef.current
    if (!el) return
    const oppdater = () => setSkala(Math.max(0.2, el.clientWidth / 1430))
    oppdater()
    const ro = new ResizeObserver(oppdater)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let aktiv = true
    async function hent() {
      const { data, error } = await supabase!.from('galleri_bilder').select('plass, bilde_url')
      if (!aktiv) return
      if (error) {
        setFeil(error.message)
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
      setFeil((f as Error).message)
    }
    setJobber(null)
  }

  async function tilbakestill(plass: string) {
    setJobber(plass)
    setFeil(null)
    const { error } = await supabase!.from('galleri_bilder').delete().eq('plass', plass)
    if (error) {
      setFeil(error.message)
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
      <Sidetopp tittel={t('meny.galleri')} under={t('gal.under')}>
        <a className="adm-knapp adm-knapp--stille" href="/portefolje" target="_blank" rel="noreferrer">
          <ExternalLink size={17} />
          {t('gal.seSiden')}
        </a>
      </Sidetopp>

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{folkeligFeil(feil, t)}</Status>}
      {overstyrt === null && <Laster tekst={t('gal.henter')} />}

      {overstyrt !== null && (
        <div className="adm-kort" style={{ padding: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--tekst-svak)',
              marginBottom: 14,
            }}
          >
            <Smartphone size={15} />
            {t('gal.gjelderBegge')}
          </div>

          <div ref={rammeRef} className="adm-kart-ramme">
            <div className="adm-kart" style={{ zoom: skala, height: HOYDE }}>
              {/* kulissene: fargede bånd og hvite kort, som på siden */}
              {BAND.map((b) => (
                <div
                  key={b.t}
                  style={{
                    position: 'absolute',
                    left: b.l,
                    top: b.t - TOPP,
                    width: b.w,
                    height: b.h,
                    borderRadius: 83,
                    background: b.bg,
                  }}
                />
              ))}
              {KORT.map((k) => (
                <div
                  key={k.t}
                  style={{
                    position: 'absolute',
                    left: k.l,
                    top: k.t - TOPP,
                    width: k.w,
                    height: k.h,
                    borderRadius: 67,
                    background: C.cardWhite,
                  }}
                />
              ))}

              {/* bildene, på plassene sine, med knappene rett på */}
              {GALLERI.map((b, i) => {
                const url = overstyrt[b.plass]
                const opptatt = jobber === b.plass
                return (
                  <div
                    key={b.plass}
                    className="adm-kart-plass"
                    style={{
                      left: b.pos.l,
                      top: b.pos.t - TOPP,
                      width: b.pos.w,
                      height: b.pos.h,
                      borderRadius: b.pos.r,
                    }}
                    aria-label={t('gal.plass', { nr: i + 1, navn: b.navn })}
                  >
                    <img src={url ?? b.original} alt={b.navn} loading="lazy" />

                    <span className="adm-kart-nr">{i + 1}</span>
                    {url && <span className="adm-kart-byttet">{t('gal.byttet')}</span>}

                    <span className="adm-kart-knapper">
                      <button
                        type="button"
                        className="adm-kart-knapp"
                        onClick={() => velgFil(b.plass)}
                        disabled={opptatt}
                      >
                        <ImagePlus size={22} />
                        {opptatt ? t('gal.jobber') : t('gal.bytt')}
                      </button>
                      {url && (
                        <button
                          type="button"
                          className="adm-kart-knapp adm-kart-knapp--lys"
                          onClick={() => void tilbakestill(b.plass)}
                          disabled={opptatt}
                        >
                          <Undo2 size={22} />
                          {t('gal.original')}
                        </button>
                      )}
                    </span>

                    {opptatt && <span className="adm-kart-slor" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <input ref={filRef} type="file" accept="image/*" hidden onChange={(e) => void byttBilde(e)} />
    </>
  )
}
