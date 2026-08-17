import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Newspaper, Images, Link2, BarChart3, Pencil } from 'lucide-react'
import { supabase, type BloggInnlegg } from '../../lib/supabase'
import { Laster, Sidetopp, Status } from '../deler'
import { Sparklinje } from '../diagram'
import { hentStatistikk, dagStart, dagSerie, type Statistikk as Stat } from '../statistikkData'
import { datoKort, folkeligFeil } from '../verktoy'

/** Oversikten: dagen i dag, siste 30 dager og snarveier til alt. */
export default function Dashbord() {
  const [stat, setStat] = useState<Stat | null>(null)
  const [innlegg, setInnlegg] = useState<BloggInnlegg[] | null>(null)
  const [feil, setFeil] = useState<string | null>(null)

  useEffect(() => {
    let aktiv = true
    async function hent() {
      try {
        const s = await hentStatistikk(dagStart(29), new Date(Date.now() + 60_000))
        if (aktiv) setStat(s)
      } catch (f) {
        if (aktiv) setFeil(folkeligFeil((f as Error).message))
      }
      const { data, error } = await supabase!
        .from('blogg_innlegg')
        .select('*')
        .order('oppdatert', { ascending: false })
        .limit(5)
      if (aktiv) {
        if (error) setFeil((gammel) => gammel ?? folkeligFeil(error.message))
        setInnlegg((data ?? []) as BloggInnlegg[])
      }
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [])

  const serie = useMemo(() => (stat ? dagSerie(stat, 30) : []), [stat])
  const iDag = serie.length ? serie[serie.length - 1] : null
  const uke = serie.slice(-7).reduce((a, p) => a + p.visninger, 0)

  return (
    <>
      <Sidetopp tittel="Oversikt" under="Velkommen tilbake! Slik står det til med nettstedet akkurat nå.">
        <Link to="/admin/blogg/ny" className="adm-knapp">
          <Plus size={18} />
          Nytt innlegg
        </Link>
      </Sidetopp>

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{feil}</Status>}
      {!feil && (!stat || innlegg === null) && <Laster tekst="Henter tallene …" />}

      {stat && innlegg !== null && (
        <div className="adm-rute">
          <div className="adm-tall">
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">I dag</span>
              <span className="adm-tall-verdi">{iDag?.visninger ?? 0}</span>
              <span className="adm-tall-detalj">sidevisninger ({iDag?.unike ?? 0} unike)</span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">Siste 7 dager</span>
              <span className="adm-tall-verdi">{uke}</span>
              <span className="adm-tall-detalj">sidevisninger</span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">Siste 30 dager</span>
              <span className="adm-tall-verdi">{stat.totalt.visninger}</span>
              <span className="adm-tall-detalj">{stat.totalt.unike} unike besøk</span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">Siste 30 dager</span>
              <Sparklinje verdier={serie.map((p) => p.visninger)} />
              <span className="adm-tall-detalj">
                <Link to="/admin/statistikk" style={{ fontWeight: 700 }}>
                  Se hele statistikken →
                </Link>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div className="adm-kort">
              <div className="adm-diagram-tittel">Siste innlegg</div>
              {innlegg.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--tekst-svak)' }}>
                  Ingen innlegg ennå – trykk «Nytt innlegg» og kom i gang!
                </p>
              ) : (
                <table className="adm-tabell">
                  <tbody>
                    {innlegg.map((i) => (
                      <tr key={i.id}>
                        <td style={{ fontWeight: 700 }}>{i.tittel}</td>
                        <td>
                          {i.publisert ? (
                            <span className="adm-merke adm-merke--gronn">Publisert</span>
                          ) : (
                            <span className="adm-merke adm-merke--graa">Kladd</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--tekst-svak)' }}>{datoKort(i.oppdatert)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <Link className="adm-knapp adm-knapp--stille adm-knapp--liten" to={`/admin/blogg/${i.id}`}>
                            <Pencil size={14} />
                            Rediger
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="adm-kort">
              <div className="adm-diagram-tittel">Snarveier</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <Link to="/admin/blogg" className="adm-knapp adm-knapp--stille" style={{ justifyContent: 'flex-start' }}>
                  <Newspaper size={17} />
                  Skriv og rediger blogginnlegg
                </Link>
                <Link to="/admin/galleri" className="adm-knapp adm-knapp--stille" style={{ justifyContent: 'flex-start' }}>
                  <Images size={17} />
                  Bytt bilder i galleriet
                </Link>
                <Link to="/admin/lenker" className="adm-knapp adm-knapp--stille" style={{ justifyContent: 'flex-start' }}>
                  <Link2 size={17} />
                  Lag delbare sporingslenker
                </Link>
                <Link to="/admin/statistikk" className="adm-knapp adm-knapp--stille" style={{ justifyContent: 'flex-start' }}>
                  <BarChart3 size={17} />
                  Se besøkstallene
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
