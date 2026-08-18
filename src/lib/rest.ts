/**
 * Liten REST-klient mot Supabase for den offentlige delen av nettstedet.
 *
 * Hvorfor ikke @supabase/supabase-js her? Fordi hele biblioteket – innlogging,
 * sanntid, fillagring – da havner i hovedbunten og lastes ned av hver eneste
 * besøkende, for tre enkle spørringer. Sanntidsdelen brukes ikke i det hele
 * tatt. Disse tjue linjene gjør nøyaktig det samme over vanlig fetch, og
 * biblioteket blir liggende i admin-bunten, der det faktisk trengs.
 *
 * Sikkerheten er den samme: det er den offentlige anon-nøkkelen som brukes,
 * og alt den får lov til styres av Row Level Security (supabase/oppsett.sql).
 */
const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
const nokkel = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Er databasen i det hele tatt satt opp? Uten nøkler faller alt stille tilbake. */
export const harBase = Boolean(base && nokkel)

function hoder(ekstra?: Record<string, string>) {
  return {
    apikey: nokkel as string,
    Authorization: `Bearer ${nokkel}`,
    'Content-Type': 'application/json',
    ...ekstra,
  }
}

/** GET mot en tabell. `sporring` er PostgREST-syntaks, f.eks. «select=*&id=eq.1». */
export async function les<T>(tabell: string, sporring: string): Promise<T[] | null> {
  if (!harBase) return null
  try {
    const svar = await fetch(`${base}/rest/v1/${tabell}?${sporring}`, { headers: hoder() })
    if (!svar.ok) return null
    return (await svar.json()) as T[]
  } catch {
    return null
  }
}

/** POST en rad inn i en tabell. Sier bare fra om det gikk bra. */
export async function settInn(tabell: string, rad: unknown): Promise<boolean> {
  if (!harBase) return false
  try {
    const svar = await fetch(`${base}/rest/v1/${tabell}`, {
      method: 'POST',
      headers: hoder({ Prefer: 'return=minimal' }),
      body: JSON.stringify(rad),
    })
    return svar.ok
  } catch {
    return false
  }
}

/** Kall en databasefunksjon. Returnerer undefined om noe gikk galt. */
export async function rpc<T>(navn: string, args: unknown): Promise<T | undefined> {
  if (!harBase) return undefined
  try {
    const svar = await fetch(`${base}/rest/v1/rpc/${navn}`, {
      method: 'POST',
      headers: hoder(),
      body: JSON.stringify(args),
    })
    if (!svar.ok) return undefined
    const tekst = await svar.text()
    return tekst ? (JSON.parse(tekst) as T) : undefined
  } catch {
    return undefined
  }
}
