import { useEffect, useMemo, useState } from 'react'
import { Table2 } from 'lucide-react'
import { supabase, type Lenke } from '../../lib/supabase'
import { Laster, Sidetopp, Status } from '../deler'
import { LinjeDiagram, Stolper } from '../diagram'
import {
  hentStatistikk,
  hentStatistikkManeder,
  serieTilPunkter,
  sideNavn,
  type Statistikk as Stat,
} from '../statistikkData'
import { folkeligFeil } from '../verktoy'
import { useSprak, type Nokkel } from '../sprak'

/** Besøkstallene: hvor mange, hvilke sider, hvor de kom fra. */

const PERIODER: ({ nokkel: Nokkel } & ({ dager: number } | { maneder: number }))[] = [
  { nokkel: 'stat.p7', dager: 7 },
  { nokkel: 'stat.p30', dager: 30 },
  { nokkel: 'stat.p90', dager: 90 },
  { nokkel: 'stat.p12', maneder: 12 },
]

export default function Statistikk() {
  const { t, tell } = useSprak()
  const [periode, setPeriode] = useState(1) // 30 dager
  const [stat, setStat] = useState<Stat | null>(null)
  const [lenker, setLenker] = useState<Lenke[]>([])
  const [feil, setFeil] = useState<string | null>(null)
  const [somTabell, setSomTabell] = useState(false)

  const valgt = PERIODER[periode]
  const perManed = 'maneder' in valgt

  useEffect(() => {
    let aktiv = true
    setStat(null)
    setFeil(null)
    async function hent() {
      try {
        const s = 'maneder' in valgt
          ? await hentStatistikkManeder(valgt.maneder)
          : await hentStatistikk(valgt.dager)
        if (aktiv) setStat(s)
      } catch (f) {
        if (aktiv) setFeil((f as Error).message)
      }
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [periode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void supabase!
      .from('lenker')
      .select('*')
      .then(({ data }) => setLenker((data ?? []) as Lenke[]))
  }, [])

  const punkter = useMemo(
    () => (stat ? serieTilPunkter(stat, perManed ? 'maned' : 'dag') : []),
    [stat, perManed]
  )

  /**
   * Andel av øktene som kom fra mobil. Nevneren er totalt antall unike økter,
   * ikke summen av enhetsradene: bytter noen skjermbredde midt i besøket
   * (eller snur telefonen), får økta en rad i begge båsene, og en sum av dem
   * ville gitt en nevner som er større enn antallet besøk.
   */
  const mobilAndel = useMemo(() => {
    if (!stat || !stat.totalt.unike) return null
    const mobil = stat.enheter.find((e) => e.enhet === 'mobil')?.okter ?? 0
    return Math.round((mobil / stat.totalt.unike) * 100)
  }, [stat])

  const lenkeNavn = (kode: string) => lenker.find((l) => l.kode === kode)?.navn ?? kode

  return (
    <>
      <Sidetopp tittel={t('meny.statistikk')} under={t('stat.under')}>
        <div className="adm-perioder">
          {PERIODER.map((p, i) => (
            <button
              key={p.nokkel}
              className={i === periode ? 'adm-aktiv' : undefined}
              aria-pressed={i === periode}
              onClick={() => setPeriode(i)}
            >
              {t(p.nokkel)}
            </button>
          ))}
        </div>
      </Sidetopp>

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{folkeligFeil(feil, t)}</Status>}
      {!feil && !stat && <Laster tekst={t('stat.teller')} />}

      {stat && (
        <div className="adm-rute">
          <div className="adm-tall">
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">{t('stat.sidevisninger')}</span>
              <span className="adm-tall-verdi">{stat.totalt.visninger}</span>
              <span className="adm-tall-detalj">
                {t('stat.sisteX', { periode: t(valgt.nokkel) })}
              </span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">{t('stat.unike')}</span>
              <span className="adm-tall-verdi">{stat.totalt.unike}</span>
              <span className="adm-tall-detalj">{t('stat.unikeDetalj')}</span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">{t('stat.mestSett')}</span>
              <span className="adm-tall-verdi" style={{ fontSize: 22 }}>
                {stat.sider[0] ? sideNavn(stat.sider[0].sti, t) : '–'}
              </span>
              <span className="adm-tall-detalj">
                {stat.sider[0] ? tell(stat.sider[0].visninger, 'visninger') : t('stat.ingenBesok')}
              </span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">{t('stat.fraMobil')}</span>
              <span className="adm-tall-verdi">{mobilAndel === null ? '–' : `${mobilAndel} %`}</span>
              <span className="adm-tall-detalj">{t('stat.andel')}</span>
            </div>
          </div>

          <div className="adm-kort">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div className="adm-diagram-tittel" style={{ marginBottom: 0 }}>
                {perManed ? t('stat.besokPerManed') : t('stat.besokPerDag')}
              </div>
              <button
                className="adm-knapp adm-knapp--stille adm-knapp--liten"
                onClick={() => setSomTabell((v) => !v)}
              >
                <Table2 size={15} />
                {somTabell ? t('stat.visDiagram') : t('stat.visTabell')}
              </button>
            </div>
            <div style={{ marginTop: 16 }}>
              {stat.totalt.visninger === 0 ? (
                <div
                  style={{
                    padding: '34px 0',
                    textAlign: 'center',
                    color: 'var(--tekst-svak)',
                    fontSize: 14.5,
                  }}
                >
                  {t('stat.tomPeriode')}
                </div>
              ) : somTabell ? (
                <div className="adm-tabell-rull">
                  <table className="adm-tabell">
                    <thead>
                      <tr>
                        <th>{perManed ? t('stat.maned') : t('stat.dag')}</th>
                        <th style={{ textAlign: 'right' }}>{t('stat.sidevisninger')}</th>
                        <th style={{ textAlign: 'right' }}>{t('stat.unike')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {punkter.map((p, i) => (
                        <tr key={i}>
                          <td>{p.etikett}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {p.visninger}
                          </td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {p.unike}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <LinjeDiagram punkter={punkter} />
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20,
            }}
          >
            <div className="adm-kort">
              <div className="adm-diagram-tittel">{t('stat.mestSette')}</div>
              <Stolper
                rader={stat.sider.slice(0, 8).map((s) => ({
                  navn: sideNavn(s.sti, t),
                  verdi: s.visninger,
                }))}
                tom={t('stat.ingenting')}
              />
            </div>
            <div className="adm-kort">
              <div className="adm-diagram-tittel">{t('stat.kilder')}</div>
              <Stolper
                rader={stat.kilder.slice(0, 8).map((k) => ({
                  navn: k.kilde === 'direkte' ? t('stat.direkte') : k.kilde,
                  verdi: k.okter,
                }))}
                tom={t('stat.ingenKilder')}
              />
            </div>
            <div className="adm-kort">
              <div className="adm-diagram-tittel">{t('stat.enheter')}</div>
              <Stolper
                rader={stat.enheter.map((e) => ({
                  navn: e.enhet === 'mobil' ? t('stat.mobil') : t('stat.datamaskin'),
                  verdi: e.okter,
                }))}
                tom={t('stat.ingenting')}
              />
            </div>
            <div className="adm-kort">
              <div className="adm-diagram-tittel">{t('stat.lenketrafikk')}</div>
              {stat.lenker.length === 0 ? (
                <div style={{ fontSize: 13.5, color: 'var(--tekst-svak)' }}>{t('stat.lenkeTom')}</div>
              ) : (
                <div className="adm-tabell-rull">
                  <table className="adm-tabell">
                    <thead>
                      <tr>
                        <th>{t('stat.lenke')}</th>
                        <th style={{ textAlign: 'right' }}>{t('stat.besok')}</th>
                        <th style={{ textAlign: 'right' }}>{t('stat.visningerKol')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stat.lenker.map((l) => (
                        <tr key={l.kode}>
                          <td style={{ fontWeight: 600 }}>{lenkeNavn(l.kode)}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {l.okter}
                          </td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {l.visninger}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
