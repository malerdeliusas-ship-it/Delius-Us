import { Link, useParams } from 'react-router-dom'
import MobilSide from '../../components/mobile/Shell'
import MdTekst from '../../lib/markdown'
import { useInnlegg, datoTekst } from '../../lib/blogg'
import { useIkkeIndekser, useInnleggSeo } from '../../lib/seo'

/** Ett blogginnlegg på mobil. */
export default function BloggInnleggMobil() {
  const { slug = '' } = useParams()
  const innlegg = useInnlegg(slug)

  useInnleggSeo(innlegg?.tittel, innlegg?.ingress)
  useIkkeIndekser(innlegg === null)

  return (
    <MobilSide>
      <div className="m-inn m-seksjon">
        <Link to="/blogg" style={{ fontWeight: 600, fontSize: 16 }}>
          ← Alle innlegg
        </Link>

        {innlegg === undefined && (
          <p style={{ textAlign: 'center', marginTop: 40 }}>Laster innlegg …</p>
        )}

        {innlegg === null && (
          <div className="m-kort" style={{ textAlign: 'center', marginTop: 24 }}>
            <h3>Fant ikke innlegget</h3>
            <p style={{ marginTop: 8 }}>
              Innlegget kan være avpublisert eller adressen skrevet feil.
            </p>
          </div>
        )}

        {innlegg && (
          <article>
            <h1 style={{ textAlign: 'left', margin: '20px 0 8px' }}>{innlegg.tittel}</h1>
            <div style={{ fontSize: 14, color: 'var(--team-meta)', marginBottom: 18 }}>
              {datoTekst(innlegg.publisert_dato)}
            </div>
            {innlegg.bilde_url && (
              <img
                className="m-bilde"
                src={innlegg.bilde_url}
                alt=""
                style={{ marginBottom: 20 }}
              />
            )}
            <div className="blogg-innhold">
              <MdTekst kilde={innlegg.innhold} />
            </div>
          </article>
        )}
      </div>
    </MobilSide>
  )
}
