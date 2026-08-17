import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Newspaper, Images, Link2, BarChart3, Pencil } from 'lucide-react'
import { supabase, type BloggInnlegg } from '../../lib/supabase'
import { Laster, Sidetopp, Status } from '../deler'
import { Sparklinje } from '../diagram'
import { hentStatistikk, serieTilPunkter, type Statistikk as Stat } from '../statistikkData'
import { folkeligFeil } from '../verktoy'
import { useSprak } from '../sprak'

/** Oversikten: dagen i dag, siste 30 dager og snarveier til alt. */
export default function Dashbord() {
  const { t } = useSprak()
  const [stat, setStat] = useState<Stat | null>(null)
  const [innlegg, setInnlegg] = useState<BloggInnlegg[] | null>(null)
  const [feil, setFeil] = useState<string | null>(null)

  useEffect(() => {
    let aktiv = true
    async function hent() {
      try {
        const s = await hentStatistikk(30)
        if (aktiv) setStat(s)
      } catch (f) {
        if (aktiv) setFeil((f as Error).message)
      }
      const { data, error } = await supabase!
        .from('blogg_innlegg')
        .select('*')
        .order('oppdatert', { ascending: false })
        .limit(5)
      if (aktiv) {
        if (error) setFeil((gammel) => gammel ?? error.message)
        setInnlegg((data ?? []) as BloggInnlegg[])
      }
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [])

  const serie = useMemo(() => (stat ? serieTilPunkter(stat, 'dag') : []), [stat])
  const iDag = serie.length ? serie[serie.length - 1] : null
  const uke = serie.slice(-7).reduce((a, p) => a + p.visninger, 0)

  return (
    <>
      <Sidetopp tittel={t('meny.oversikt')} under={t('dash.under')}>
        <Link to="/admin/blogg/ny" className="adm-knapp">
          <Plus size={18} />
          {t('dash.nytt')}
        </Link>
      </Sidetopp>

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{folkeligFeil(feil, t)}</Status>}
      {!feil && (!stat || innlegg === null) && <Laster tekst={t('dash.henter')} />}

      {stat && innlegg !== null && (
        <div className="adm-rute">
          <div className="adm-tall">
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">{t('dash.iDag')}</span>
              <span className="adm-tall-verdi">{iDag?.visninger ?? 0}</span>
              <span className="adm-tall-detalj">
                {t('dash.visningerUnike', { unike: iDag?.unike ?? 0 })}
              </span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">{t('dash.siste7')}</span>
              <span className="adm-tall-verdi">{uke}</span>
              <span className="adm-tall-detalj">{t('dash.visninger')}</span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">{t('dash.siste30')}</span>
              <span className="adm-tall-verdi">{stat.totalt.visninger}</span>
              <span className="adm-tall-detalj">
                {t('dash.unikeBesok', { antall: stat.totalt.unike })}
              </span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">{t('dash.siste30')}</span>
              <Sparklinje verdier={serie.map((p) => p.visninger)} />
              <span className="adm-tall-detalj">
                <Link to="/admin/statistikk" style={{ fontWeight: 700 }}>
                  {t('dash.seStatistikk')}
                </Link>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div className="adm-kort">
              <div className="adm-diagram-tittel">{t('dash.sisteInnlegg')}</div>
              {innlegg.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--tekst-svak)' }}>{t('dash.ingenInnlegg')}</p>
              ) : (
                <div className="adm-tabell-rull">
                  <table className="adm-tabell">
                    <tbody>
                    {innlegg.map((i) => (
                      <tr key={i.id}>
                        <td style={{ fontWeight: 700 }}>{i.tittel}</td>
                        <td>
                          {i.publisert ? (
                            <span className="adm-merke adm-merke--gronn">{t('felles.publisert')}</span>
                          ) : (
                            <span className="adm-merke adm-merke--graa">{t('felles.kladd')}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }} className="adm-nowrap">
                          <Link className="adm-knapp adm-knapp--stille adm-knapp--liten" to={`/admin/blogg/${i.id}`}>
                            <Pencil size={14} />
                            {t('felles.rediger')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="adm-kort">
              <div className="adm-diagram-tittel">{t('dash.snarveier')}</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <Link to="/admin/blogg" className="adm-knapp adm-knapp--stille" style={{ justifyContent: 'flex-start' }}>
                  <Newspaper size={17} />
                  {t('dash.snarveiBlogg')}
                </Link>
                <Link to="/admin/galleri" className="adm-knapp adm-knapp--stille" style={{ justifyContent: 'flex-start' }}>
                  <Images size={17} />
                  {t('dash.snarveiGalleri')}
                </Link>
                <Link to="/admin/lenker" className="adm-knapp adm-knapp--stille" style={{ justifyContent: 'flex-start' }}>
                  <Link2 size={17} />
                  {t('dash.snarveiLenker')}
                </Link>
                <Link to="/admin/statistikk" className="adm-knapp adm-knapp--stille" style={{ justifyContent: 'flex-start' }}>
                  <BarChart3 size={17} />
                  {t('dash.snarveiStatistikk')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
