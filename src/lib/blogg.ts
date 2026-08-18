import { useEffect, useState } from 'react'
import { les } from './rest'
import type { BloggInnlegg } from './supabase'

/** Felles datahenting for bloggen (samme på desktop og mobil). */

export function datoTekst(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Publiserte innlegg, nyeste først. null = laster fortsatt. */
export function useInnleggListe() {
  const [liste, setListe] = useState<BloggInnlegg[] | null>(null)

  useEffect(() => {
    let aktiv = true
    async function hent() {
      // Listesiden viser tittel, ingress og bilde. Selve brødteksten hentes
      // ikke: den kan være lang, og på oversikten vises den aldri.
      const data = await les<BloggInnlegg>(
        'blogg_innlegg',
        'select=id,tittel,slug,ingress,bilde_url,publisert,publisert_dato,opprettet,oppdatert' +
          '&publisert=eq.true&order=publisert_dato.desc.nullslast',
      )
      if (aktiv) setListe(data ?? [])
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [])

  return liste
}

/** Ett innlegg etter slug. undefined = laster, null = finnes ikke. */
export function useInnlegg(slug: string) {
  const [innlegg, setInnlegg] = useState<BloggInnlegg | null | undefined>(undefined)

  useEffect(() => {
    let aktiv = true
    async function hent() {
      const rader = await les<BloggInnlegg>(
        'blogg_innlegg',
        `select=*&slug=eq.${encodeURIComponent(slug)}&publisert=eq.true&limit=1`,
      )
      // rader === null betyr at spørringen feilet (nett nede, database nede).
      // Da er svaret «vet ikke», ikke «finnes ikke»: siden fortsetter å laste
      // i stedet for å påstå at innlegget er borte og be Google glemme det.
      if (!aktiv) return
      if (rader === null) setInnlegg(undefined)
      else setInnlegg(rader[0] ?? null)
    }
    setInnlegg(undefined)
    void hent()
    return () => {
      aktiv = false
    }
  }, [slug])

  return innlegg
}
