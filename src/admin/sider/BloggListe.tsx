import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ExternalLink, Pencil } from 'lucide-react'
import { supabase, type BloggInnlegg } from '../../lib/supabase'
import { Laster, Sidetopp, Status } from '../deler'
import { datoKort, folkeligFeil } from '../verktoy'
import { useSprak } from '../sprak'

/** Alle innleggene – både publiserte og kladder. */
export default function BloggListe() {
  const { t, locale } = useSprak()
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
      if (error) setFeil(error.message)
      else setListe((data ?? []) as BloggInnlegg[])
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [])

  return (
    <>
      <Sidetopp tittel={t('meny.blogg')} under={t('liste.under')}>
        <Link to="/admin/blogg/ny" className="adm-knapp">
          <Plus size={18} />
          {t('dash.nytt')}
        </Link>
      </Sidetopp>

      {feil && <Status type="feil" style={{ marginBottom: 18 }}>{folkeligFeil(feil, t)}</Status>}
      {!feil && liste === null && <Laster tekst={t('liste.henter')} />}

      {liste !== null && liste.length === 0 && (
        <div className="adm-kort" style={{ textAlign: 'center', padding: '54px 30px' }}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>{t('liste.tomTittel')}</div>
          <p style={{ marginTop: 8, color: 'var(--tekst-svak)', fontSize: 14.5 }}>
            {t('liste.tomTekst')}
          </p>
        </div>
      )}

      {liste !== null && liste.length > 0 && (
        <div className="adm-kort" style={{ padding: '10px 6px' }}>
          <div className="adm-tabell-rull">
          <table className="adm-tabell">
            <thead>
              <tr>
                <th>{t('liste.tittel')}</th>
                <th>{t('liste.status')}</th>
                <th>{t('felles.publisert')}</th>
                <th>{t('liste.sistEndret')}</th>
                <th aria-hidden />
              </tr>
            </thead>
            <tbody>
              {liste.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 700, maxWidth: 340 }}>{i.tittel}</td>
                  <td>
                    {i.publisert ? (
                      <span className="adm-merke adm-merke--gronn">{t('felles.publisert')}</span>
                    ) : (
                      <span className="adm-merke adm-merke--graa">{t('felles.kladd')}</span>
                    )}
                  </td>
                  <td className="adm-nowrap">{datoKort(i.publisert_dato, locale)}</td>
                  <td className="adm-nowrap">{datoKort(i.oppdatert, locale)}</td>
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
                        {t('liste.se')}
                      </a>
                    )}
                    <Link className="adm-knapp adm-knapp--liten" to={`/admin/blogg/${i.id}`}>
                      <Pencil size={15} />
                      {t('felles.rediger')}
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
