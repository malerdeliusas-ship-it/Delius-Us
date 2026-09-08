import type { ReactNode } from 'react'
import BloggStage from './BloggStage'
import Shell from './mobile/Shell'
import useIsMobile from '../lib/useIsMobile'

/**
 * Rammen rundt de juridiske sidene: personvern, informasjonskapsler, vilkår
 * og angrerett. Samme skall som bloggen på desktop (målt høyde, header og
 * footer som på de andre sidene) og den vanlige mobilrammen på telefon.
 * Teksten er vanlig flytende HTML, stilt av `.jus` i index.css.
 */
export default function JuridiskSide({
  tittel,
  oppdatert,
  ingress,
  children,
}: {
  tittel: string
  /** Datoen teksten sist ble endret, skrevet ut som «8. september 2026». */
  oppdatert: string
  ingress: ReactNode
  children: ReactNode
}) {
  const mobil = useIsMobile()

  const innhold = (
    <div className={`jus ${mobil ? 'jus--mobil' : 'jus--pc'}`}>
      <p className="jus-ingress">
        Sist oppdatert {oppdatert}. {ingress}
      </p>
      {children}
    </div>
  )

  if (mobil) {
    return (
      <Shell>
        <section className="m-seksjon">
          <h1 className="m-balanse">{tittel}</h1>
          {innhold}
        </section>
      </Shell>
    )
  }

  return (
    <BloggStage tittel={tittel}>
      <div style={{ padding: '64px 119px 96px' }}>{innhold}</div>
    </BloggStage>
  )
}
