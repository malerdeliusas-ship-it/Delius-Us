import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bold,
  Italic,
  Heading2,
  List,
  Link as LenkeIkon,
  ImagePlus,
  Trash2,
  Save,
} from 'lucide-react'
import { supabase, type BloggInnlegg } from '../../lib/supabase'
import MdTekst from '../../lib/markdown'
import { lastOppBilde } from '../bilder'
import { Felt, Laster, Status } from '../deler'
import { folkeligFeil, slugifiser } from '../verktoy'

/**
 * Skriving og redigering av ett innlegg. Venstre side er teksten (enkel
 * Markdown med knapperad), høyre side viser innlegget slik det blir
 * seende ut på nettstedet – samme visning som bloggen bruker.
 */
export default function BloggRedigering() {
  const { id } = useParams()
  const ny = !id
  const navigate = useNavigate()
  const tekstRef = useRef<HTMLTextAreaElement>(null)
  const bildeInnholdRef = useRef<HTMLInputElement>(null)
  const bildeToppRef = useRef<HTMLInputElement>(null)

  const [laster, setLaster] = useState(!ny)
  const [tittel, setTittel] = useState('')
  const [slug, setSlug] = useState('')
  const [slugLaast, setSlugLaast] = useState(!ny) // redigerte innlegg beholder adressen
  const [ingress, setIngress] = useState('')
  const [innhold, setInnhold] = useState('')
  const [bildeUrl, setBildeUrl] = useState<string | null>(null)
  const [publisert, setPublisert] = useState(false)
  const [publisertDato, setPublisertDato] = useState<string | null>(null)

  const [lagrer, setLagrer] = useState(false)
  const [lasterBilde, setLasterBilde] = useState(false)
  const [melding, setMelding] = useState<{ type: 'ok' | 'feil'; tekst: string } | null>(null)

  useEffect(() => {
    if (ny) return
    let aktiv = true
    async function hent() {
      const { data, error } = await supabase!
        .from('blogg_innlegg')
        .select('*')
        .eq('id', id)
        .maybeSingle<BloggInnlegg>()
      if (!aktiv) return
      if (error || !data) {
        setMelding({ type: 'feil', tekst: error ? folkeligFeil(error.message) : 'Fant ikke innlegget.' })
      } else {
        setTittel(data.tittel)
        setSlug(data.slug)
        setIngress(data.ingress)
        setInnhold(data.innhold)
        setBildeUrl(data.bilde_url)
        setPublisert(data.publisert)
        setPublisertDato(data.publisert_dato)
      }
      setLaster(false)
    }
    void hent()
    return () => {
      aktiv = false
    }
  }, [id, ny])

  function settTittel(t: string) {
    setTittel(t)
    if (!slugLaast) setSlug(slugifiser(t))
  }

  /** Legg tekst rundt/inn i markeringen i tekstfeltet. */
  function skrivInn(foran: string, bak = '', plassholder = '') {
    const felt = tekstRef.current
    if (!felt) return
    const fra = felt.selectionStart
    const til = felt.selectionEnd
    const valgt = innhold.slice(fra, til) || plassholder
    const neste = innhold.slice(0, fra) + foran + valgt + bak + innhold.slice(til)
    setInnhold(neste)
    requestAnimationFrame(() => {
      felt.focus()
      felt.setSelectionRange(fra + foran.length, fra + foran.length + valgt.length)
    })
  }

  async function lastOppTilInnhold(e: ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0]
    e.target.value = ''
    if (!fil) return
    setLasterBilde(true)
    setMelding(null)
    try {
      const url = await lastOppBilde(fil, 'blogg')
      skrivInn(`\n\n![Skriv en bildetekst her](${url})\n\n`)
    } catch (feil) {
      setMelding({ type: 'feil', tekst: folkeligFeil((feil as Error).message) })
    }
    setLasterBilde(false)
  }

  async function lastOppTopp(e: ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0]
    e.target.value = ''
    if (!fil) return
    setLasterBilde(true)
    setMelding(null)
    try {
      setBildeUrl(await lastOppBilde(fil, 'blogg'))
    } catch (feil) {
      setMelding({ type: 'feil', tekst: folkeligFeil((feil as Error).message) })
    }
    setLasterBilde(false)
  }

  async function lagre() {
    if (!tittel.trim()) {
      setMelding({ type: 'feil', tekst: 'Innlegget trenger en tittel.' })
      return
    }
    const renSlug = slugifiser(slug || tittel)
    if (!renSlug) {
      setMelding({ type: 'feil', tekst: 'Adressen (slug) kan ikke være tom.' })
      return
    }
    setLagrer(true)
    setMelding(null)

    const rad = {
      tittel: tittel.trim(),
      slug: renSlug,
      ingress: ingress.trim(),
      innhold,
      bilde_url: bildeUrl,
      publisert,
      // første gang noe publiseres stemples datoen; den beholdes siden
      publisert_dato: publisert ? publisertDato ?? new Date().toISOString() : publisertDato,
    }

    if (ny) {
      const { data, error } = await supabase!
        .from('blogg_innlegg')
        .insert(rad)
        .select('id')
        .single<{ id: string }>()
      setLagrer(false)
      if (error) {
        setMelding({ type: 'feil', tekst: folkeligFeil(error.message) })
      } else {
        navigate(`/admin/blogg/${data.id}`, { replace: true })
        setMelding({ type: 'ok', tekst: publisert ? 'Innlegget er lagret og publisert.' : 'Kladden er lagret.' })
      }
    } else {
      const { error } = await supabase!.from('blogg_innlegg').update(rad).eq('id', id)
      setLagrer(false)
      if (error) {
        setMelding({ type: 'feil', tekst: folkeligFeil(error.message) })
      } else {
        setSlug(renSlug)
        if (publisert && !publisertDato) setPublisertDato(rad.publisert_dato)
        setMelding({ type: 'ok', tekst: publisert ? 'Innlegget er lagret og ligger ute.' : 'Lagret som kladd.' })
      }
    }
  }

  async function slett() {
    if (!id) return
    if (!window.confirm('Slette innlegget for godt? Dette kan ikke angres.')) return
    const { error } = await supabase!.from('blogg_innlegg').delete().eq('id', id)
    if (error) setMelding({ type: 'feil', tekst: folkeligFeil(error.message) })
    else navigate('/admin/blogg')
  }

  if (laster) return <Laster tekst="Henter innlegget …" />

  return (
    <>
      <div className="adm-topp">
        <div>
          <Link
            to="/admin/blogg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}
          >
            <ArrowLeft size={16} />
            Alle innlegg
          </Link>
          <h1 style={{ marginTop: 8 }}>{ny ? 'Nytt innlegg' : 'Rediger innlegg'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="adm-bryter">
            <input type="checkbox" checked={publisert} onChange={(e) => setPublisert(e.target.checked)} />
            <span className="adm-bryter-spor" />
            <b>{publisert ? 'Publisert' : 'Kladd'}</b>
          </label>
          <button className="adm-knapp" onClick={() => void lagre()} disabled={lagrer || lasterBilde}>
            <Save size={17} />
            {lagrer ? 'Lagrer …' : 'Lagre'}
          </button>
        </div>
      </div>

      {melding && (
        <Status type={melding.type} style={{ marginBottom: 18 }}>
          {melding.tekst}
        </Status>
      )}

      <div className="adm-redigering">
        <div className="adm-kort">
          <Felt navn="Tittel">
            <input
              className="adm-inn"
              value={tittel}
              onChange={(e) => settTittel(e.target.value)}
              placeholder="F.eks. Slik velger du riktig hvitfarge"
            />
          </Felt>

          <Felt navn="Adresse (slug)" hjelp={`Innlegget får adressen malerdelius.no/blogg/${slug || '…'}`}>
            <input
              className="adm-inn"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugLaast(true)
              }}
            />
          </Felt>

          <Felt navn="Ingress" hjelp="Én–to setninger som vises i bloggoversikten.">
            <textarea
              className="adm-inn"
              rows={2}
              value={ingress}
              onChange={(e) => setIngress(e.target.value)}
            />
          </Felt>

          <Felt navn="Toppbilde">
            <div className="adm-slipp">
              {bildeUrl && <img src={bildeUrl} alt="" />}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="adm-knapp adm-knapp--stille adm-knapp--liten"
                  onClick={() => bildeToppRef.current?.click()}
                  disabled={lasterBilde}
                >
                  <ImagePlus size={15} />
                  {lasterBilde ? 'Laster opp …' : bildeUrl ? 'Bytt bilde' : 'Velg bilde'}
                </button>
                {bildeUrl && (
                  <button
                    type="button"
                    className="adm-knapp adm-knapp--fare adm-knapp--liten"
                    onClick={() => setBildeUrl(null)}
                  >
                    Fjern
                  </button>
                )}
              </div>
            </div>
            <input ref={bildeToppRef} type="file" accept="image/*" hidden onChange={(e) => void lastOppTopp(e)} />
          </Felt>

          <Felt navn="Innhold">
            <div>
              <div className="adm-verktoyrad">
                <button type="button" onClick={() => skrivInn('**', '**', 'fet tekst')} title="Fet">
                  <Bold size={15} />
                </button>
                <button type="button" onClick={() => skrivInn('*', '*', 'kursiv tekst')} title="Kursiv">
                  <Italic size={15} />
                </button>
                <button type="button" onClick={() => skrivInn('\n\n## ', '', 'Overskrift')} title="Overskrift">
                  <Heading2 size={15} />
                </button>
                <button type="button" onClick={() => skrivInn('\n\n- ', '', 'punkt')} title="Punktliste">
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => skrivInn('[', '](https://)', 'lenketekst')}
                  title="Lenke"
                >
                  <LenkeIkon size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => bildeInnholdRef.current?.click()}
                  disabled={lasterBilde}
                  title="Sett inn bilde"
                >
                  <ImagePlus size={15} />
                  {lasterBilde ? 'Laster opp …' : 'Bilde'}
                </button>
              </div>
              <textarea
                ref={tekstRef}
                className="adm-inn"
                rows={16}
                value={innhold}
                onChange={(e) => setInnhold(e.target.value)}
                placeholder={
                  'Skriv innlegget her.\n\nTomme linjer gir nye avsnitt. Bruk knappene over for fet, kursiv, overskrifter, lister, lenker og bilder.'
                }
              />
              <input
                ref={bildeInnholdRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => void lastOppTilInnhold(e)}
              />
            </div>
          </Felt>

          {!ny && (
            <button className="adm-knapp adm-knapp--fare adm-knapp--liten" onClick={() => void slett()}>
              <Trash2 size={15} />
              Slett innlegget
            </button>
          )}
        </div>

        <div>
          <div className="adm-diagram-tittel">Slik ser det ut på nettstedet</div>
          <div className="adm-forhand">
            {tittel && (
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--marine)', marginBottom: 6 }}>
                {tittel}
              </div>
            )}
            {ingress && (
              <div style={{ fontSize: 15, color: 'var(--tekst-svak)', marginBottom: 16 }}>{ingress}</div>
            )}
            {bildeUrl && (
              <img
                src={bildeUrl}
                alt=""
                style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 18, marginBottom: 18 }}
              />
            )}
            <div className="blogg-innhold">
              {innhold.trim() ? (
                <MdTekst kilde={innhold} />
              ) : (
                <p style={{ color: 'var(--tekst-svak)' }}>Forhåndsvisningen dukker opp når du skriver.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
