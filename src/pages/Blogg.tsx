import { Link } from 'react-router-dom'
import BloggStage from '../components/BloggStage'
import { C, FONT, FONT_MUKTA } from '../lib/theme'
import { useInnleggListe, datoTekst } from '../lib/blogg'

/**
 * Bloggoversikten på desktop: kort med bilde, dato, tittel og ingress,
 * i samme formspråk som resten av nettstedet (kremfarger, store runde
 * hjørner, gullknapper).
 */
export default function Blogg() {
  const liste = useInnleggListe()

  return (
    <BloggStage tittel="Blogg">
      <div style={{ padding: '64px 119px 96px' }}>
        {liste === null && (
          <div style={{ fontFamily: FONT_MUKTA, fontSize: 22, color: C.navy, textAlign: 'center', padding: '80px 0' }}>
            Laster innlegg …
          </div>
        )}

        {liste !== null && liste.length === 0 && (
          <div
            style={{
              background: C.cream,
              borderRadius: 57,
              padding: '72px 60px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.navy }}>
              Ingen innlegg ennå
            </div>
            <div style={{ fontFamily: FONT_MUKTA, fontSize: 21, color: C.navy, marginTop: 12 }}>
              Her kommer det snart nytt fra hverdagen vår – tips, prosjekter og ferske resultater.
            </div>
          </div>
        )}

        {(liste ?? []).map((i) => (
          <Link
            key={i.id}
            to={`/blogg/${i.slug}`}
            className="blogg-kort"
            style={{
              display: 'grid',
              gridTemplateColumns: i.bilde_url ? '440px 1fr' : '1fr',
              gap: 48,
              alignItems: 'center',
              background: C.cream,
              borderRadius: 57,
              padding: 44,
              marginBottom: 44,
            }}
          >
            {i.bilde_url && (
              <img
                src={i.bilde_url}
                alt=""
                loading="lazy"
                style={{ width: 440, height: 300, objectFit: 'cover', borderRadius: 40 }}
              />
            )}
            <div>
              <div style={{ fontFamily: FONT_MUKTA, fontSize: 17, color: C.teamMeta, marginBottom: 10 }}>
                {datoTekst(i.publisert_dato)}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 800, lineHeight: '42px', color: C.navy }}>
                {i.tittel}
              </div>
              {i.ingress && (
                <div
                  style={{
                    fontFamily: FONT_MUKTA,
                    fontSize: 21,
                    lineHeight: '32px',
                    color: C.navy,
                    marginTop: 14,
                  }}
                >
                  {i.ingress}
                </div>
              )}
              <span
                className="btn-press"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 26,
                  height: 52,
                  padding: '0 36px',
                  background: C.gold,
                  borderRadius: 65,
                  fontFamily: FONT,
                  fontSize: 19,
                  fontWeight: 600,
                  color: C.navy,
                }}
              >
                Les mer
              </span>
            </div>
          </Link>
        ))}
      </div>
    </BloggStage>
  )
}
