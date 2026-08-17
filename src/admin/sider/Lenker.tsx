import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Copy, Check, Trash2, Plus } from 'lucide-react'
import { supabase, type Lenke } from '../../lib/supabase'
import { Felt, Laster, Sidetopp, Status } from '../deler'
import { hentLenkeklikk, sideNavn, type Statistikk } from '../statistikkData'
import { datoKort, folkeligFeil, slugifiser } from '../verktoy'
import { useSprak, type Nokkel } from '../sprak'

/**
 * Sporingslenker: lag en kort adresse (malerdelius.no/l/kode), del den i en
 * annonse, en post eller en e-post – og se her hvor mange som kom via
 * akkurat den.
 */

const MAL_SIDER: { sti: string; nokkel: Nokkel }[] = [
  { sti: '/', nokkel: 'side.forsiden' },
  { sti: '/om-oss', nokkel: 'side.omOss' },
  { sti: '/portefolje', nokkel: 'side.portefolje' },
  { sti: '/malertjenester', nokkel: 'side.malertjenester' },
  { sti: '/kontakt', nokkel: 'side.kontakt' },
  { sti: '/blogg', nokkel: 'side.blogg' },
]

export default function Lenker() {
  const { t, locale } = useSprak()
  const [lenker, setLenker] = useState<Lenke[] | null>(null)
  const [klikk, setKlikk] = useState<Statistikk['lenker']>([])
  const [feil, setFeil] = useState<string | null>(null)

  const [navn, setNavn] = useState('')
  const [kode, setKode] = useState('')
  const [kodeLaast, setKodeLaast] = useState(false)
  const [mal, setMal] = useState('/')
  const [lagrer, setLagrer] = useState(false)
  const [kopiert, setKopiert] = useState<string | null>(null)

  useEffect(() => {
    let aktiv = true
    async function hent() {
      const { data, error } = await supabase!
        .from('lenker')
        .select('*')
        .order('opprettet', { ascending: false })
      if (!aktiv) return
      if (error) setFeil(error.message)
      setLenker((data ?? []) as Lenke[])
      try {
        // klikktallene dekker hele historikken, ikke en fast periode
        const k = await hentLenkeklikk()
        if (aktiv) setKlikk(k)
      } catch {
        /* uten tallene vises lenkene likevel */
      }
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [])

  function settNavn(tekst: string) {
    setNavn(tekst)
    if (!kodeLaast) setKode(slugifiser(tekst).slice(0, 40))
  }

  async function opprett(e: FormEvent) {
    e.preventDefault()
    const renKode = slugifiser(kode || navn).slice(0, 40)
    if (!navn.trim() || !renKode) {
      setFeil(t('len.giNavn'))
      return
    }
    setLagrer(true)
    setFeil(null)
    const { data, error } = await supabase!
      .from('lenker')
      .insert({ navn: navn.trim(), kode: renKode, mal })
      .select('*')
      .single<Lenke>()
    setLagrer(false)
    if (error) {
      setFeil(error.message)
    } else {
      setLenker((l) => [data, ...(l ?? [])])
      setNavn('')
      setKode('')
      setKodeLaast(false)
      setMal('/')
    }
  }

  async function slett(l: Lenke) {
    if (!window.confirm(t('len.slettSporsmal', { navn: l.navn }))) return
    const { error } = await supabase!.from('lenker').delete().eq('id', l.id)
    if (error) setFeil(error.message)
    else setLenker((liste) => (liste ?? []).filter((x) => x.id !== l.id))
  }

  async function kopier(l: Lenke) {
    const adresse = `${window.location.origin}/l/${l.kode}`
    try {
      await navigator.clipboard.writeText(adresse)
      setKopiert(l.id)
      setTimeout(() => setKopiert(null), 1600)
    } catch {
      window.prompt(t('len.kopierManuelt'), adresse)
    }
  }

  const tall = useMemo(() => {
    const kart = new Map<string, { visninger: number; okter: number }>()
    for (const r of klikk) kart.set(r.kode, { visninger: r.visninger, okter: r.okter })
    return kart
  }, [klikk])

  return (
    <>
      <Sidetopp tittel={t('meny.lenker')} under={t('len.under')} />

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{folkeligFeil(feil, t)}</Status>}

      <div className="adm-rute">
        <form className="adm-kort" onSubmit={(e) => void opprett(e)}>
          <div className="adm-diagram-tittel">{t('len.ny')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 18px' }}>
            <Felt navn={t('len.navn')} id="l-navn" hjelp={t('len.navnHjelp')}>
              <input
                id="l-navn"
                className="adm-inn"
                value={navn}
                onChange={(e) => settNavn(e.target.value)}
                placeholder={t('len.navnPlassholder')}
              />
            </Felt>
            <Felt
              navn={t('len.kode')}
              id="l-kode"
              hjelp={t('len.kodeHjelp', { vert: window.location.host, kode: kode || '…' })}
            >
              <input
                id="l-kode"
                className="adm-inn"
                value={kode}
                onChange={(e) => {
                  setKode(e.target.value)
                  setKodeLaast(true)
                }}
              />
            </Felt>
            <Felt navn={t('len.malside')} id="l-mal">
              <select id="l-mal" className="adm-inn" value={mal} onChange={(e) => setMal(e.target.value)}>
                {MAL_SIDER.map((s) => (
                  <option key={s.sti} value={s.sti}>
                    {t(s.nokkel)}
                  </option>
                ))}
              </select>
            </Felt>
          </div>
          <button className="adm-knapp" disabled={lagrer}>
            <Plus size={17} />
            {lagrer ? t('len.lager') : t('len.lag')}
          </button>
        </form>

        {lenker === null && <Laster tekst={t('len.henter')} />}

        {lenker !== null && lenker.length > 0 && (
          <div className="adm-kort" style={{ padding: '10px 6px' }}>
            <div className="adm-tabell-rull">
            <table className="adm-tabell">
              <thead>
                <tr>
                  <th>{t('len.navn')}</th>
                  <th>{t('len.adresse')}</th>
                  <th>{t('len.gaarTil')}</th>
                  <th>{t('len.laget')}</th>
                  <th style={{ textAlign: 'right' }}>{t('stat.besok')}</th>
                  <th style={{ textAlign: 'right' }}>{t('stat.visningerKol')}</th>
                  <th aria-hidden />
                </tr>
              </thead>
              <tbody>
                {lenker.map((l) => {
                  const kTall = tall.get(l.kode)
                  return (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 700 }}>{l.navn}</td>
                      <td>
                        <span className="adm-kode">/l/{l.kode}</span>
                      </td>
                      <td>{sideNavn(l.mal, t)}</td>
                      <td className="adm-nowrap" style={{ color: 'var(--tekst-svak)' }}>
                        {datoKort(l.opprettet, locale)}
                      </td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{kTall?.okter ?? 0}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{kTall?.visninger ?? 0}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="adm-knapp adm-knapp--liten"
                          onClick={() => void kopier(l)}
                          style={{ marginRight: 8 }}
                        >
                          {kopiert === l.id ? <Check size={15} /> : <Copy size={15} />}
                          {kopiert === l.id ? t('len.kopiert') : t('len.kopier')}
                        </button>
                        <button className="adm-knapp adm-knapp--fare adm-knapp--liten" onClick={() => void slett(l)}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {lenker !== null && lenker.length === 0 && (
          <div className="adm-kort" style={{ textAlign: 'center', padding: '44px 30px' }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{t('len.tomTittel')}</div>
            <p style={{ marginTop: 8, color: 'var(--tekst-svak)', fontSize: 14.5 }}>
              {t('len.tomTekst')}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
