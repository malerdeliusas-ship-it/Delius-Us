import { supabase } from '../lib/supabase'
import { slugifiser } from './verktoy'

/**
 * Bildeopplasting: bildene krympes i nettleseren før de sendes opp, så
 * nettstedet aldri serverer 8 MB rett fra mobilkameraet. Lange sider over
 * 1600 piksler skaleres ned og alt lagres som WebP med god kvalitet.
 */
async function krymp(fil: File, maks = 1600, kvalitet = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(fil)
  const skala = Math.min(1, maks / Math.max(bitmap.width, bitmap.height))
  const b = Math.max(1, Math.round(bitmap.width * skala))
  const h = Math.max(1, Math.round(bitmap.height * skala))

  const lerret = document.createElement('canvas')
  lerret.width = b
  lerret.height = h
  const ctx = lerret.getContext('2d')
  if (!ctx) throw new Error('Fikk ikke tegnet bildet')
  ctx.drawImage(bitmap, 0, 0, b, h)
  bitmap.close()

  const blob = await new Promise<Blob | null>((løs) =>
    lerret.toBlob(løs, 'image/webp', kvalitet)
  )
  if (!blob) throw new Error('Fikk ikke komprimert bildet')
  return blob
}

/**
 * Krymper og laster opp et bilde til bøtta «bilder». Returnerer den
 * offentlige adressen. Kaster feil med melding hvis noe går galt.
 */
export async function lastOppBilde(fil: File, mappe: 'blogg' | 'galleri'): Promise<string> {
  if (!supabase) throw new Error('Supabase er ikke satt opp.')
  if (!fil.type.startsWith('image/')) throw new Error('Filen er ikke et bilde.')

  let blob: Blob
  let etternavn = 'webp'
  try {
    blob = await krymp(fil)
  } catch {
    // formater nettleseren ikke kan tegne (sjeldent) lastes opp som de er
    blob = fil
    etternavn = (fil.name.split('.').pop() || 'jpg').toLowerCase()
  }

  const grunnavn = slugifiser(fil.name.replace(/\.[^.]+$/, '')) || 'bilde'
  const sti = `${mappe}/${Date.now()}-${grunnavn}.${etternavn}`

  const { error } = await supabase.storage.from('bilder').upload(sti, blob, {
    contentType: blob.type || 'application/octet-stream',
    cacheControl: '31536000',
  })
  if (error) throw new Error(error.message)

  return supabase.storage.from('bilder').getPublicUrl(sti).data.publicUrl
}
