import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Én delt Supabase-klient for hele nettstedet: bloggen, galleriet,
 * besøksstatistikken og admin-panelet. Nøklene er «anon»-nøkler som er
 * laget for å ligge åpent i nettleseren – alt de får lov til styres av
 * Row Level Security i databasen (se supabase/oppsett.sql).
 *
 * Mangler nøklene (f.eks. i et byggmiljø uten .env) blir klienten null,
 * og alt som bruker den faller stille tilbake: bloggen viser ingenting,
 * galleriet bruker originalbildene, statistikken hopper over.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const nokkel = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && nokkel ? createClient(url, nokkel) : null

/** Et blogginnlegg slik det ligger i tabellen blogg_innlegg. */
export type BloggInnlegg = {
  id: string
  tittel: string
  slug: string
  ingress: string
  innhold: string
  bilde_url: string | null
  publisert: boolean
  publisert_dato: string | null
  opprettet: string
  oppdatert: string
}

/** Et overstyrt galleribilde (tabellen galleri_bilder). */
export type GalleriBilde = {
  plass: string
  bilde_url: string
  oppdatert: string
}

/** En sporingslenke (tabellen lenker). */
export type Lenke = {
  id: string
  kode: string
  navn: string
  mal: string
  opprettet: string
}
