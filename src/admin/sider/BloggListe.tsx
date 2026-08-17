import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ExternalLink, Pencil } from 'lucide-react'
import { supabase, type BloggInnlegg } from '../../lib/supabase'
import { Laster, Sidetopp, Status } from '../deler'
import { datoKort, folkeligFeil } from '../verktoy'

/** Alle innleggene – både publiserte og kladder. */
export default function BloggListe() {
  const [liste, setListe] = useState<BloggInnlegg[] | null>(null)
  const [feil, setFeil] = useState<string | null>(null)

  useEffect(() => {
    let aktiv = true
    async function hent() {
      const { data, error } = await supabase!
        .from('blogg_innlegg')
        .select('*')
        .order('opprettet', { ascending: false })
      if (!aktiv) return
      if (error) setFeil(folkeligFeil(error.message))
      else setListe((data ?? []) as BloggInnlegg[])
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [])

  return (
    <>
      <Sidetopp
        tittel="Blogg"
        under="Skriv nytt, rediger og publiser innlegg på nettstedet."
      >
        <Link to="/admin/blogg/ny" className="adm-knapp">
          <Plus size={18} />
          Nytt innlegg
        </Link>
      </Sidetopp>

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{feil}</Status>}
      {!feil && liste === null && <Laster tekst="Henter innleggene …" />}

      {liste !== null && liste.length === 0 && (
        <div className="adm-kort" style={{ textAlign: 'center', padding: '54px 30px' }}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>Ingen innlegg ennå</div>
          <p style={{ marginTop: 8, color: 'var(--tekst-svak)', fontSize: 14.5 }}>
            Trykk «Nytt innlegg» og skriv det første – det tar bare noen minutter.
          </p>
        </div>
      )}

      {liste !== null && liste.length > 0 && (
        <div className="adm-kort" style={{ padding: '10px 6px' }}>
          <div className="adm-tabell-rull">
          <table className="adm-tabell">
            <thead>
              <tr>
                <th>Tittel</th>
                <th>Status</th>
                <th>Publisert</th>
                <th>Sist endret</th>
                <th aria-label="Handlinger" />
              </tr>
            </thead>
            <tbody>
              {liste.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 700, maxWidth: 340 }}>{i.tittel}</td>
                  <td>
                    {i.publisert ? (
                      <span className="adm-merke adm-merke--gronn">Publisert</span>
                    ) : (
                      <span className="adm-merke adm-merke--graa">Kladd</span>
                    )}
                  </td>
                  <td className="adm-nowrap">{datoKort(i.publisert_dato)}</td>
                  <td className="adm-nowrap">{datoKort(i.oppdatert)}</td>
                  <td className="adm-nowrap" style={{ textAlign: 'right' }}>
                    {i.publisert && (
                      <a
                        className="adm-knapp adm-knapp--stille adm-knapp--liten"
                        href={`/blogg/${i.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ marginRight: 8 }}
                      >
                        <ExternalLink size={15} />
                        Se
                      </a>
                    )}
                    <Link className="adm-knapp adm-knapp--liten" to={`/admin/blogg/${i.id}`}>
                      <Pencil size={15} />
                      Rediger
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </>
  )
}
