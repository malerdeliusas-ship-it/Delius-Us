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

/** Besøkstallene: hvor mange, hvilke sider, hvor de kom fra. */

const PERIODER = [
  { navn: '7 dager', dager: 7 },
  { navn: '30 dager', dager: 30 },
  { navn: '90 dager', dager: 90 },
  { navn: '12 måneder', maneder: 12 },
] as const

export default function Statistikk() {
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
        const s = perManed
          ? await hentStatistikkManeder(valgt.maneder)
          : await hentStatistikk(valgt.dager)
        if (aktiv) setStat(s)
      } catch (f) {
        if (aktiv) setFeil(folkeligFeil((f as Error).message))
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
      <Sidetopp
        tittel="Statistikk"
        under="Besøk på nettstedet, uten informasjonskapsler og uten å lagre noe om den enkelte."
      >
        <div className="adm-perioder">
          {PERIODER.map((p, i) => (
            <button
              key={p.navn}
              className={i === periode ? 'adm-aktiv' : undefined}
              aria-pressed={i === periode}
              onClick={() => setPeriode(i)}
            >
              {p.navn}
            </button>
          ))}
        </div>
      </Sidetopp>

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{feil}</Status>}
      {!feil && !stat && <Laster tekst="Teller opp besøkene …" />}

      {stat && (
        <div className="adm-rute">
          <div className="adm-tall">
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">Sidevisninger</span>
              <span className="adm-tall-verdi">{stat.totalt.visninger}</span>
              <span className="adm-tall-detalj">siste {valgt.navn}</span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">Unike besøk</span>
              <span className="adm-tall-verdi">{stat.totalt.unike}</span>
              <span className="adm-tall-detalj">økter – én per besøkende per fane</span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">Mest sett</span>
              <span className="adm-tall-verdi" style={{ fontSize: 22 }}>
                {stat.sider[0] ? sideNavn(stat.sider[0].sti) : '–'}
              </span>
              <span className="adm-tall-detalj">
                {stat.sider[0] ? `${stat.sider[0].visninger} visninger` : 'ingen besøk ennå'}
              </span>
            </div>
            <div className="adm-tall-kort">
              <span className="adm-tall-navn">Fra mobil</span>
              <span className="adm-tall-verdi">{mobilAndel === null ? '–' : `${mobilAndel} %`}</span>
              <span className="adm-tall-detalj">andel av øktene</span>
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
                Besøk per {perManed ? 'måned' : 'dag'}
              </div>
              <button
                className="adm-knapp adm-knapp--stille adm-knapp--liten"
                onClick={() => setSomTabell((v) => !v)}
              >
                <Table2 size={15} />
                {somTabell ? 'Vis diagram' : 'Vis tabell'}
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
                  Ingen besøk registrert i perioden ennå. Tallene begynner å rulle
                  inn så snart noen åpner nettstedet.
                </div>
              ) : somTabell ? (
                <div className="adm-tabell-rull">
                  <table className="adm-tabell">
                    <thead>
                      <tr>
                        <th>{perManed ? 'Måned' : 'Dag'}</th>
                        <th style={{ textAlign: 'right' }}>Sidevisninger</th>
                        <th style={{ textAlign: 'right' }}>Unike besøk</th>
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
              <div className="adm-diagram-tittel">Mest sette sider</div>
              <Stolper
                rader={stat.sider.slice(0, 8).map((s) => ({
                  navn: sideNavn(s.sti),
                  verdi: s.visninger,
                }))}
              />
            </div>
            <div className="adm-kort">
              <div className="adm-diagram-tittel">Hvor besøkene kom fra</div>
              <Stolper
                rader={stat.kilder.slice(0, 8).map((k) => ({
                  navn: k.kilde === 'direkte' ? 'Direkte / skrev inn adressen' : k.kilde,
                  verdi: k.okter,
                }))}
                tom="Ingen kilder registrert ennå."
              />
            </div>
            <div className="adm-kort">
              <div className="adm-diagram-tittel">Enheter</div>
              <Stolper
                rader={stat.enheter.map((e) => ({
                  navn: e.enhet === 'mobil' ? 'Mobil' : 'Datamaskin',
                  verdi: e.okter,
                }))}
              />
            </div>
            <div className="adm-kort">
              <div className="adm-diagram-tittel">Trafikk fra lenkene dine</div>
              {stat.lenker.length === 0 ? (
                <div style={{ fontSize: 13.5, color: 'var(--tekst-svak)' }}>
                  Ingen besøk via sporingslenker i perioden. Lag lenker under «Lenker»
                  og del dem – så dukker tallene opp her.
                </div>
              ) : (
                <div className="adm-tabell-rull">
                  <table className="adm-tabell">
                    <thead>
                      <tr>
                        <th>Lenke</th>
                        <th style={{ textAlign: 'right' }}>Besøk</th>
                        <th style={{ textAlign: 'right' }}>Visninger</th>
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
