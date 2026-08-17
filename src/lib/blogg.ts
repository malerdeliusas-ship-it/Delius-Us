import { useEffect, useState } from 'react'
import { supabase, type BloggInnlegg } from './supabase'

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
      if (!supabase) {
        if (aktiv) setListe([])
        return
      }
      const { data, error } = await supabase
        .from('blogg_innlegg')
        .select('id, tittel, slug, ingress, bilde_url, publisert, publisert_dato, opprettet, oppdatert, innhold')
        .eq('publisert', true)
        .order('publisert_dato', { ascending: false, nullsFirst: false })
      if (aktiv) setListe(error ? [] : ((data ?? []) as BloggInnlegg[]))
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
      if (!supabase) {
        if (aktiv) setInnlegg(null)
        return
      }
      const { data } = await supabase
        .from('blogg_innlegg')
        .select('*')
        .eq('slug', slug)
        .eq('publisert', true)
        .maybeSingle<BloggInnlegg>()
      if (aktiv) setInnlegg(data ?? null)
    }
    setInnlegg(undefined)
    void hent()
    return () => {
      aktiv = false
    }
  }, [slug])

  return innlegg
}
