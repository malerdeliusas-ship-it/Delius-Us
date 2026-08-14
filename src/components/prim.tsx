import type { CSSProperties, ReactNode } from 'react'
import { FONT } from '../lib/theme'

/**
 * Hvilket HTML-element som brukes. Utseendet er identisk uansett: den globale
 * resetten nuller marger/padding, og all typografi settes rett på elementet.
 * Taggen finnes bare for søkemotorer og skjermlesere.
 */
type Tag = 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'header' | 'footer' | 'nav' | 'section'

/** Absolutt-plassert boks med eksakte Figma-koordinater. */
export function Abs({
  l,
  t,
  w,
  h,
  as: TagNavn = 'div',
  style,
  className,
  children,
}: {
  l: number
  t: number
  w?: number
  h?: number
  as?: Tag
  style?: CSSProperties
  className?: string
  children?: ReactNode
}) {
  return (
    <TagNavn
      className={className}
      style={{ position: 'absolute', left: l, top: t, width: w, height: h, ...style }}
    >
      {children}
    </TagNavn>
  )
}

/** Absolutt-plassert tekst med eksakte typografi-verdier fra Figma. */
export function Txt({
  l,
  t,
  w,
  size,
  weight = 400,
  lh,
  ls = 0,
  color,
  align = 'left',
  italic,
  font = FONT,
  as: TagNavn = 'div',
  style,
  children,
}: {
  l: number
  t: number
  w?: number
  size: number
  weight?: number
  lh?: number
  ls?: number
  color: string
  align?: 'left' | 'center' | 'right'
  italic?: boolean
  font?: string
  as?: Tag
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <TagNavn
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: w,
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        lineHeight: lh ? `${lh}px` : undefined,
        letterSpacing: ls ? `${ls}px` : undefined,
        color,
        textAlign: align,
        fontStyle: italic ? 'italic' : undefined,
        // pre-wrap, ikke pre-line: Figma beholder også doble mellomrom
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    >
      {children}
    </TagNavn>
  )
}

/** Absolutt-plassert bilde med eksakt ramme fra Figma. */
export function Img({
  src,
  alt = '',
  l,
  t,
  w,
  h,
  r,
  fit = 'cover',
  style,
  loading = 'lazy',
}: {
  src: string
  alt?: string
  l: number
  t: number
  w: number
  h: number
  /** Figma cornerRadius. Nettleseren klipper den ned på samme måte som Figma. */
  r?: number
  fit?: CSSProperties['objectFit']
  style?: CSSProperties
  loading?: 'lazy' | 'eager'
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: w,
        height: h,
        objectFit: fit,
        borderRadius: r,
        ...style,
      }}
    />
  )
}

/**
 * Bilde med Figmas egen beskjæring.
 *
 * Når et bildefyll står i STRETCH-modus, lagrer Figma en `imageTransform`
 * [[sx,0,tx],[0,sy,ty]] som forteller hvilken del av bildet som vises:
 * utsnittet starter på (tx,ty) og dekker (sx,sy) av bildet, i 0–1-koordinater.
 * Vi regner om til et bilde i full størrelse som forskyves inne i en boks som
 * klipper – da blir utsnittet nøyaktig som i designet.
 */
export function CropImg({
  src,
  alt = '',
  l,
  t,
  w,
  h,
  r,
  tf,
  style,
  loading = 'lazy',
}: {
  src: string
  alt?: string
  l: number
  t: number
  w: number
  h: number
  r?: number
  tf: [[number, number, number], [number, number, number]]
  style?: CSSProperties
  loading?: 'lazy' | 'eager'
}) {
  const sx = tf[0][0]
  const tx = tf[0][2]
  const sy = tf[1][1]
  const ty = tf[1][2]
  const fullW = w / sx
  const fullH = h / sy

  return (
    <div
      style={{
        position: 'absolute',
        left: l,
        top: t,
        width: w,
        height: h,
        borderRadius: r,
        overflow: 'hidden',
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        style={{
          position: 'absolute',
          left: -tx * fullW,
          top: -ty * fullH,
          width: fullW,
          height: fullH,
          objectFit: 'fill',
        }}
      />
    </div>
  )
}

/** Farget flate (rektangel) fra designet. */
export function Rect({
  l,
  t,
  w,
  h,
  bg,
  r,
  style,
}: {
  l: number
  t: number
  w: number
  h: number
  bg: string
  r?: number
  style?: CSSProperties
}) {
  return <Abs l={l} t={t} w={w} h={h} style={{ background: bg, borderRadius: r, ...style }} />
}
