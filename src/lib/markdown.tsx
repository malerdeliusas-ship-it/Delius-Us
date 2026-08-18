import type { ReactNode } from 'react'

/**
 * Liten og trygg Markdown-visning for blogginnleggene. Teksten fra admin-
 * panelet gjøres om til ekte React-elementer – aldri rå HTML – så innhold
 * kan ikke smugle med seg skript eller stiler.
 *
 * Støtter det et blogginnlegg trenger:
 *   ## Overskrift        ### Mellomoverskrift
 *   **fet**  *kursiv*    [lenketekst](https://…)
 *   - punktliste         1. nummerert liste
 *   > sitat              ![bildetekst](bilde-url)
 * Avsnitt skilles med blank linje.
 */

const INLINE = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)\s]+)\))/g

function trygLenke(url: string): string | null {
  // «/\evil.com» ser ut som en intern sti, men nettleseren leser skråstreken
  // baklengs som en vanlig en og sender folk til evil.com. Derfor må begge
  // tegnene sperres, ikke bare dobbel skråstrek.
  if (url.startsWith('/') && !/^\/[/\\]/.test(url)) return url
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null
  } catch {
    return null
  }
}

/** Fet, kursiv og lenker inne i en tekstlinje. */
function inline(tekst: string): ReactNode[] {
  const ut: ReactNode[] = []
  let sist = 0
  let n = 0
  for (const m of tekst.matchAll(INLINE)) {
    const start = m.index ?? 0
    if (start > sist) ut.push(tekst.slice(sist, start))
    if (m[2] !== undefined) {
      ut.push(<strong key={n++}>{inline(m[2])}</strong>)
    } else if (m[4] !== undefined) {
      ut.push(<em key={n++}>{inline(m[4])}</em>)
    } else if (m[6] !== undefined) {
      const url = trygLenke(m[7])
      if (url) {
        const ekstern = !url.startsWith('/')
        ut.push(
          <a key={n++} href={url} target={ekstern ? '_blank' : undefined} rel={ekstern ? 'noreferrer' : undefined}>
            {m[6]}
          </a>
        )
      } else {
        ut.push(m[6])
      }
    }
    sist = start + m[0].length
  }
  if (sist < tekst.length) ut.push(tekst.slice(sist))
  return ut
}

/** Enkeltlinjer i et avsnitt beholdes som myke linjeskift. */
function linjer(tekst: string): ReactNode[] {
  const deler = tekst.split('\n')
  const ut: ReactNode[] = []
  deler.forEach((l, i) => {
    if (i > 0) ut.push(<br key={`br-${i}`} />)
    ut.push(...inline(l))
  })
  return ut
}

const BILDE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/

export default function MdTekst({ kilde }: { kilde: string }) {
  const blokker = kilde.replace(/\r\n/g, '\n').split(/\n{2,}/)
  const ut: ReactNode[] = []

  blokker.forEach((blokk, i) => {
    const b = blokk.trim()
    if (!b) return

    const bilde = b.match(BILDE)
    if (bilde) {
      const url = trygLenke(bilde[2])
      if (url) {
        ut.push(
          <figure key={i}>
            <img src={url} alt={bilde[1]} loading="lazy" />
            {bilde[1] && <figcaption>{bilde[1]}</figcaption>}
          </figure>
        )
      }
      return
    }

    if (b.startsWith('### ')) {
      ut.push(<h3 key={i}>{inline(b.slice(4))}</h3>)
      return
    }
    if (b.startsWith('## ')) {
      ut.push(<h2 key={i}>{inline(b.slice(3))}</h2>)
      return
    }
    if (b.startsWith('# ')) {
      // et innlegg har alt en H1 (tittelen) – en # i teksten blir en H2
      ut.push(<h2 key={i}>{inline(b.slice(2))}</h2>)
      return
    }

    const alleLinjer = b.split('\n')
    if (alleLinjer.every((l) => /^[-*] /.test(l))) {
      ut.push(
        <ul key={i}>
          {alleLinjer.map((l, j) => (
            <li key={j}>{inline(l.slice(2))}</li>
          ))}
        </ul>
      )
      return
    }
    if (alleLinjer.every((l) => /^\d+[.)] /.test(l))) {
      ut.push(
        <ol key={i}>
          {alleLinjer.map((l, j) => (
            <li key={j}>{inline(l.replace(/^\d+[.)] /, ''))}</li>
          ))}
        </ol>
      )
      return
    }
    if (alleLinjer.every((l) => l.startsWith('> '))) {
      ut.push(
        <blockquote key={i}>
          {linjer(alleLinjer.map((l) => l.slice(2)).join('\n'))}
        </blockquote>
      )
      return
    }

    ut.push(<p key={i}>{linjer(b)}</p>)
  })

  return <>{ut}</>
}
