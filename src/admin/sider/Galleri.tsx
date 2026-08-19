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

/** Under dette blir knappene for små til å trykke på. */
const MINSTE_SKALA = 0.55

const KORT = [
  { l: 495, t: 460, w: 816, h: 466, r: 67, bg: C.cardWhite },
  { l: 119, t: 1086, w: 784, h: 453, r: 67, bg: C.cardWhite },
  { l: 936, t: 1727, w: 715, h: 453, r: 67, bg: C.cardWhite },
  { l: 119, t: 2310, w: 784, h: 526, r: 67, bg: C.cardWhite },
  // de to tallkortene nederst, så bunnen av siden er til å kjenne igjen
  { l: 732, t: 2983, w: 273, h: 326, r: 67, bg: C.white },
  { l: 1038, t: 2990, w: 273, h: 326, r: 67, bg: C.white },
]

export default function Galleri() {
  const { t } = useSprak()
  const [overstyrt, setOverstyrt] = useState<Record<string, string> | null>(null)
  const [feil, setFeil] = useState<string | null>(null)
  /* Hvilke plasser det jobbes med akkurat nå. Et sett, ikke én verdi:
     opplastinger tar tid, og starter man en til mens den første er
     underveis, ville én delt verdi ha slettet markeringen for begge og
     latt den første plassen stå «ferdig» før den var det. */
  const [jobber, setJobber] = useState<ReadonlySet<string>>(() => new Set())

  const merkJobber = (plass: string, aktiv: boolean) =>
    setJobber((forrige) => {
      const neste = new Set(forrige)
      if (aktiv) neste.add(plass)
      else neste.delete(plass)
      return neste
    })
  const filRef = useRef<HTMLInputElement>(null)
  const valgtPlass = useRef<string | null>(null)

  /*
   * Miniatyrens målestokk: fyll bredden på feltet, akkurat som Stage gjør på
   * nettstedet. Men aldri under MINSTE_SKALA – da blir knappene på bildene
   * for små til å treffe med fingeren (på en telefon havnet de på ti piksler).
   * Blir det for trangt, ruller kartet sidelengs i stedet.
   */
  /* Callback-ref, ikke useRef: kartet tegnes først når bildene er hentet,
     så et vanlig oppsett ved montering ville målt et element som ennå ikke
     fantes – og målestokken hadde blitt stående på startverdien. */
  const [ramme, setRamme] = useState<HTMLDivElement | null>(null)
  const [skala, setSkala] = useState(MINSTE_SKALA)

  useLayoutEffect(() => {
    if (!ramme) return
    const oppdater = () => setSkala(Math.max(MINSTE_SKALA, ramme.clientWidth / 1430))
    oppdater()
    const ro = new ResizeObserver(oppdater)
    ro.observe(ramme)
    return () => ro.disconnect()
  }, [ramme])

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
    merkJobber(plass, true)
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
    merkJobber(plass, false)
  }

  async function tilbakestill(plass: string) {
    merkJobber(plass, true)
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
    merkJobber(plass, false)
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
            <Smartphone size={15} style={{ flexShrink: 0 }} />
            {t('gal.gjelderBegge')}
          </div>

          <div ref={setRamme} className="adm-kart-ramme">
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
                    borderRadius: k.r,
                    background: k.bg,
                  }}
                />
              ))}

              {/* bildene, på plassene sine, med knappene rett på */}
              {GALLERI.map((b, i) => {
                const url = overstyrt[b.plass]
                const opptatt = jobber.has(b.plass)
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

          {/* Telefonutgaven: kartet over er tegnet for brede skjermer, og på
              en telefon ble bare halvparten synlig. Her er de samme tretten
              plassene som en enkel liste – bilde, nummer, navn og de samme
              knappene. CSS-en avgjør hvilken av de to som vises; bildene er
              «lazy», så den skjulte utgaven laster ingenting ekstra. */}
          <div className="adm-galleri-liste">
            {GALLERI.map((b, i) => {
              const url = overstyrt[b.plass]
              const opptatt = jobber.has(b.plass)
              return (
                <div key={b.plass} className="adm-galleri-rad">
                  <div className="adm-galleri-rad-info">
                    <span className="adm-galleri-nr">{i + 1}</span>
                    {b.navn}
                    {url && <span className="adm-merke adm-merke--gronn">{t('gal.byttet')}</span>}
                  </div>
                  <div style={{ padding: '10px 14px 0' }}>
                    <img
                      src={url ?? b.original}
                      alt={b.navn}
                      loading="lazy"
                      decoding="async"
                      style={{ borderRadius: 12, opacity: opptatt ? 0.5 : 1 }}
                    />
                  </div>
                  <div className="adm-galleri-rad-knapper">
                    <button
                      type="button"
                      className="adm-knapp adm-knapp--liten"
                      onClick={() => velgFil(b.plass)}
                      disabled={opptatt}
                    >
                      <ImagePlus size={16} />
                      {opptatt ? t('gal.jobber') : t('gal.bytt')}
                    </button>
                    {url && (
                      <button
                        type="button"
                        className="adm-knapp adm-knapp--liten adm-knapp--stille"
                        onClick={() => void tilbakestill(b.plass)}
                        disabled={opptatt}
                      >
                        <Undo2 size={16} />
                        {t('gal.original')}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <input ref={filRef} type="file" accept="image/*" hidden onChange={(e) => void byttBilde(e)} />
    </>
  )
}
