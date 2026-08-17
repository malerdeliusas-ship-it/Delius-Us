import { Link } from 'react-router-dom'
import MobilSide from '../../components/mobile/Shell'
import { useInnleggListe, datoTekst } from '../../lib/blogg'

/** Bloggoversikten på mobil: samme innhold som desktop, i én kolonne. */
export default function BloggMobil() {
  const liste = useInnleggListe()

  return (
    <MobilSide>
      <div className="m-inn m-seksjon">
        <h1 style={{ textAlign: 'center', marginBottom: 28 }}>Blogg</h1>

        {liste === null && <p style={{ textAlign: 'center' }}>Laster innlegg …</p>}

        {liste !== null && liste.length === 0 && (
          <div className="m-kort" style={{ textAlign: 'center' }}>
            <h3>Ingen innlegg ennå</h3>
            <p style={{ marginTop: 8 }}>
              Her kommer det snart nytt fra hverdagen vår – tips, prosjekter og ferske resultater.
            </p>
          </div>
        )}

        <div className="m-rutenett">
          {(liste ?? []).map((i) => (
            <Link key={i.id} to={`/blogg/${i.slug}`} className="m-kort" style={{ display: 'block' }}>
              {i.bilde_url && (
                <img
                  className="m-bilde"
                  src={i.bilde_url}
                  alt=""
                  loading="lazy"
                  style={{ aspectRatio: '3 / 2', objectFit: 'cover', marginBottom: 16 }}
                />
              )}
              <div style={{ fontSize: 14, color: 'var(--team-meta)', marginBottom: 6 }}>
                {datoTekst(i.publisert_dato)}
              </div>
              <h3>{i.tittel}</h3>
              {i.ingress && <p style={{ marginTop: 8 }}>{i.ingress}</p>}
              <span className="m-knapp" style={{ marginTop: 16 }}>
                Les mer
              </span>
            </Link>
          ))}
        </div>
      </div>
    </MobilSide>
  )
}
