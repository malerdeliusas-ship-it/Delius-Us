import { Link, useParams } from 'react-router-dom'
import BloggStage from '../components/BloggStage'
import MdTekst from '../lib/markdown'
import { C, FONT, FONT_MUKTA } from '../lib/theme'
import { useInnlegg, datoTekst } from '../lib/blogg'
import { useIkkeIndekser, useInnleggSeo } from '../lib/seo'

/** Ett blogginnlegg på desktop. */
export default function BloggInnleggSide() {
  const { slug = '' } = useParams()
  const innlegg = useInnlegg(slug)

  useInnleggSeo(innlegg?.tittel, innlegg?.ingress)
  // en adresse uten innlegg skal ikke bli liggende som en tom side i Google
  useIkkeIndekser(innlegg === null)

  return (
    <BloggStage>
      <div style={{ padding: '48px 235px 96px', width: 1430 }}>
        <Link
          to="/blogg"
          className="navlink"
          style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: C.navy }}
        >
          ← Alle innlegg
        </Link>

        {innlegg === undefined && (
          <div style={{ fontFamily: FONT_MUKTA, fontSize: 22, color: C.navy, padding: '80px 0', textAlign: 'center' }}>
            Laster innlegg …
          </div>
        )}

        {innlegg === null && (
          <div style={{ padding: '70px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.navy }}>
              Fant ikke innlegget
            </div>
            <div style={{ fontFamily: FONT_MUKTA, fontSize: 20, color: C.navy, marginTop: 10 }}>
              Innlegget kan være avpublisert eller adressen skrevet feil.
            </div>
          </div>
        )}

        {innlegg && (
          <article>
            <h1
              style={{
                fontFamily: FONT,
                fontSize: 44,
                fontWeight: 800,
                lineHeight: '56px',
                color: C.navy,
                margin: '30px 0 14px',
              }}
            >
              {innlegg.tittel}
            </h1>
            <div style={{ fontFamily: FONT_MUKTA, fontSize: 18, color: C.teamMeta, marginBottom: 34 }}>
              {datoTekst(innlegg.publisert_dato)}
            </div>
            {innlegg.bilde_url && (
              <img
                src={innlegg.bilde_url}
                alt=""
                style={{
                  width: '100%',
                  maxHeight: 540,
                  objectFit: 'cover',
                  borderRadius: 57,
                  marginBottom: 44,
                }}
              />
            )}
            <div className="blogg-innhold">
              <MdTekst kilde={innlegg.innhold} />
            </div>
          </article>
        )}
      </div>
    </BloggStage>
  )
}
