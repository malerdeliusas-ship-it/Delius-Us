import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Copy, Check, Trash2, Plus } from 'lucide-react'
import { supabase, type Lenke } from '../../lib/supabase'
import { Felt, Laster, Sidetopp, Status } from '../deler'
import { hentStatistikk, sideNavn, type Statistikk as Stat } from '../statistikkData'
import { datoKort, folkeligFeil, slugifiser } from '../verktoy'

/**
 * Sporingslenker: lag en kort adresse (malerdelius.no/l/kode), del den i en
 * annonse, en post eller en e-post – og se her hvor mange som kom via
 * akkurat den.
 */

const MAL_SIDER = [
  { sti: '/', navn: 'Forsiden' },
  { sti: '/om-oss', navn: 'Om oss' },
  { sti: '/portefolje', navn: 'Portefølje' },
  { sti: '/malertjenester', navn: 'Malertjenester' },
  { sti: '/kontakt', navn: 'Kontakt' },
  { sti: '/blogg', navn: 'Blogg' },
]

export default function Lenker() {
  const [lenker, setLenker] = useState<Lenke[] | null>(null)
  const [stat, setStat] = useState<Stat | null>(null)
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
      if (error) setFeil(folkeligFeil(error.message))
      setLenker((data ?? []) as Lenke[])
      try {
        // klikktallene: hele historikken, ikke bare siste tida
        const s = await hentStatistikk(new Date('2026-01-01'), new Date(Date.now() + 60_000))
        if (aktiv) setStat(s)
      } catch {
        /* uten statistikk vises lenkene likevel */
      }
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [])

  function settNavn(t: string) {
    setNavn(t)
    if (!kodeLaast) setKode(slugifiser(t).slice(0, 40))
  }

  async function opprett(e: FormEvent) {
    e.preventDefault()
    const renKode = slugifiser(kode || navn).slice(0, 40)
    if (!navn.trim() || !renKode) {
      setFeil('Gi lenken et navn – koden lages av seg selv.')
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
      setFeil(folkeligFeil(error.message))
    } else {
      setLenker((l) => [data, ...(l ?? [])])
      setNavn('')
      setKode('')
      setKodeLaast(false)
      setMal('/')
    }
  }

  async function slett(l: Lenke) {
    if (!window.confirm(`Slette lenken «${l.navn}»? Gamle delinger av den vil da gå til forsiden.`)) return
    const { error } = await supabase!.from('lenker').delete().eq('id', l.id)
    if (error) setFeil(folkeligFeil(error.message))
    else setLenker((liste) => (liste ?? []).filter((x) => x.id !== l.id))
  }

  async function kopier(l: Lenke) {
    const adresse = `${window.location.origin}/l/${l.kode}`
    try {
      await navigator.clipboard.writeText(adresse)
      setKopiert(l.id)
      setTimeout(() => setKopiert(null), 1600)
    } catch {
      window.prompt('Kopier adressen:', adresse)
    }
  }

  const tall = useMemo(() => {
    const kart = new Map<string, { visninger: number; okter: number }>()
    for (const r of stat?.lenker ?? []) kart.set(r.kode, { visninger: r.visninger, okter: r.okter })
    return kart
  }, [stat])

  return (
    <>
      <Sidetopp
        tittel="Lenker"
        under="Lag en egen adresse for hver deling – annonse, innlegg, e-post – og se hvor mange som kom via hver av dem."
      />

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{feil}</Status>}

      <div className="adm-rute">
        <form className="adm-kort" onSubmit={(e) => void opprett(e)}>
          <div className="adm-diagram-tittel">Ny lenke</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 18px' }}>
            <Felt navn="Navn" hjelp="Bare for deg, f.eks. «Facebook-annonse august».">
              <input
                className="adm-inn"
                value={navn}
                onChange={(e) => settNavn(e.target.value)}
                placeholder="Facebook-annonse august"
              />
            </Felt>
            <Felt navn="Kode" hjelp={`Adressen blir ${window.location.host}/l/${kode || '…'}`}>
              <input
                className="adm-inn"
                value={kode}
                onChange={(e) => {
                  setKode(e.target.value)
                  setKodeLaast(true)
                }}
              />
            </Felt>
            <Felt navn="Sender besøkende til">
              <select className="adm-inn" value={mal} onChange={(e) => setMal(e.target.value)}>
                {MAL_SIDER.map((s) => (
                  <option key={s.sti} value={s.sti}>
                    {s.navn}
                  </option>
                ))}
              </select>
            </Felt>
          </div>
          <button className="adm-knapp" disabled={lagrer}>
            <Plus size={17} />
            {lagrer ? 'Lager …' : 'Lag lenken'}
          </button>
        </form>

        {lenker === null && <Laster tekst="Henter lenkene …" />}

        {lenker !== null && lenker.length > 0 && (
          <div className="adm-kort" style={{ padding: '10px 6px' }}>
            <table className="adm-tabell">
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Adresse</th>
                  <th>Går til</th>
                  <th>Laget</th>
                  <th style={{ textAlign: 'right' }}>Besøk</th>
                  <th style={{ textAlign: 'right' }}>Visninger</th>
                  <th aria-label="Handlinger" />
                </tr>
              </thead>
              <tbody>
                {lenker.map((l) => {
                  const t = tall.get(l.kode)
                  return (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 700 }}>{l.navn}</td>
                      <td>
                        <span className="adm-kode">/l/{l.kode}</span>
                      </td>
                      <td>{sideNavn(l.mal)}</td>
                      <td style={{ color: 'var(--tekst-svak)' }}>{datoKort(l.opprettet)}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{t?.okter ?? 0}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{t?.visninger ?? 0}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="adm-knapp adm-knapp--liten"
                          onClick={() => void kopier(l)}
                          style={{ marginRight: 8 }}
                        >
                          {kopiert === l.id ? <Check size={15} /> : <Copy size={15} />}
                          {kopiert === l.id ? 'Kopiert!' : 'Kopier'}
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
        )}

        {lenker !== null && lenker.length === 0 && (
          <div className="adm-kort" style={{ textAlign: 'center', padding: '44px 30px' }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Ingen lenker ennå</div>
            <p style={{ marginTop: 8, color: 'var(--tekst-svak)', fontSize: 14.5 }}>
              Lag den første over – gi den et navn, kopier adressen og del den
              der du vil måle effekten.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
