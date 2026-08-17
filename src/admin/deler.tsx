import type { ReactNode } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

/** Små byggeklosser som brukes over hele admin-panelet. */

export function Laster({ tekst = 'Laster …' }: { tekst?: string }) {
  return (
    <div className="adm-laster">
      <div className="adm-snurr" />
      {tekst}
    </div>
  )
}

export function Status({
  type,
  children,
  style,
}: {
  type: 'ok' | 'feil'
  children: ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div className={`adm-status adm-status--${type}`} role={type === 'feil' ? 'alert' : 'status'} style={style}>
      {type === 'ok' ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
      <div>{children}</div>
    </div>
  )
}

export function Sidetopp({
  tittel,
  under,
  children,
}: {
  tittel: string
  under?: string
  children?: ReactNode
}) {
  return (
    <div className="adm-topp">
      <div>
        <h1>{tittel}</h1>
        {under && <p>{under}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{children}</div>}
    </div>
  )
}

export function Felt({
  navn,
  hjelp,
  children,
}: {
  navn: string
  hjelp?: string
  children: ReactNode
}) {
  return (
    <label className="adm-felt">
      <span>{navn}</span>
      {children}
      {hjelp && <small>{hjelp}</small>}
    </label>
  )
}
