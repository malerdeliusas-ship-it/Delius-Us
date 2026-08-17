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
import { useSprak } from '../sprak'

/**
 * Skriving og redigering av ett innlegg. Venstre side er teksten (enkel
 * Markdown med knapperad), høyre side viser innlegget slik det blir
 * seende ut på nettstedet – samme visning som bloggen bruker.
 */
export default function BloggRedigering() {
  const { t } = useSprak()
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
        setMelding({ type: 'feil', tekst: error ? folkeligFeil(error.message, t) : t('red.fantIkke') })
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
  }, [id, ny]) // eslint-disable-line react-hooks/exhaustive-deps

  function settTittel(tekst: string) {
    setTittel(tekst)
    if (!slugLaast) setSlug(slugifiser(tekst))
  }

  /**
   * Legg tekst rundt/inn i markeringen i tekstfeltet.
   *
   * Teksten leses fra feltet selv, ikke fra `innhold`-variabelen. Det er
   * viktig for bildeknappen: den venter på at opplastingen blir ferdig, og
   * rekker man å skrive i mellomtiden, ville den gamle verdien fra
   * variabelen ha overskrevet det man nettopp skrev.
   */
  function skrivInn(foran: string, bak = '', plassholder = '') {
    const felt = tekstRef.current
    if (!felt) return
    const kilde = felt.value
    const fra = felt.selectionStart
    const til = felt.selectionEnd
    const valgt = kilde.slice(fra, til) || plassholder

    setInnhold(kilde.slice(0, fra) + foran + valgt + bak + kilde.slice(til))
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
      skrivInn(`\n\n![${t('red.bildetekst')}](${url})\n\n`)
    } catch (feil) {
      setMelding({ type: 'feil', tekst: folkeligFeil((feil as Error).message, t) })
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
      setMelding({ type: 'feil', tekst: folkeligFeil((feil as Error).message, t) })
    }
    setLasterBilde(false)
  }

  async function lagre() {
    if (!tittel.trim()) {
      setMelding({ type: 'feil', tekst: t('red.trengerTittel') })
      return
    }
    const renSlug = slugifiser(slug || tittel)
    if (!renSlug) {
      setMelding({ type: 'feil', tekst: t('red.tomSlug') })
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
        setMelding({ type: 'feil', tekst: folkeligFeil(error.message, t) })
      } else {
        // Adressen er nå i bruk: den skal ikke lenger endre seg av seg selv
        // når tittelen justeres, ellers bytter innlegget lenke under føttene
        // på den som alt har delt den.
        setSlugLaast(true)
        navigate(`/admin/blogg/${data.id}`, { replace: true })
        setMelding({ type: 'ok', tekst: publisert ? t('red.lagretPublisert') : t('red.lagretKladd') })
      }
    } else {
      const { error } = await supabase!.from('blogg_innlegg').update(rad).eq('id', id)
      setLagrer(false)
      if (error) {
        setMelding({ type: 'feil', tekst: folkeligFeil(error.message, t) })
      } else {
        setSlug(renSlug)
        if (publisert && !publisertDato) setPublisertDato(rad.publisert_dato)
        setMelding({ type: 'ok', tekst: publisert ? t('red.lagretUte') : t('red.lagretSomKladd') })
      }
    }
  }

  async function slett() {
    if (!id) return
    if (!window.confirm(t('red.slettSporsmal'))) return
    const { error } = await supabase!.from('blogg_innlegg').delete().eq('id', id)
    if (error) setMelding({ type: 'feil', tekst: folkeligFeil(error.message, t) })
    else navigate('/admin/blogg')
  }

  if (laster) return <Laster tekst={t('red.henter')} />

  return (
    <>
      <div className="adm-topp">
        <div>
          <Link
            to="/admin/blogg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700 }}
          >
            <ArrowLeft size={16} />
            {t('red.alle')}
          </Link>
          <h1 style={{ marginTop: 8 }}>{ny ? t('red.nytt') : t('red.rediger')}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="adm-bryter">
            <input type="checkbox" checked={publisert} onChange={(e) => setPublisert(e.target.checked)} />
            <span className="adm-bryter-spor" />
            <b>{publisert ? t('felles.publisert') : t('felles.kladd')}</b>
          </label>
          <button className="adm-knapp" onClick={() => void lagre()} disabled={lagrer || lasterBilde}>
            <Save size={17} />
            {lagrer ? t('felles.lagrer') : t('felles.lagre')}
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
          <Felt navn={t('red.tittel')} id="f-tittel">
            <input
              id="f-tittel"
              className="adm-inn"
              value={tittel}
              onChange={(e) => settTittel(e.target.value)}
              placeholder={t('red.tittelPlassholder')}
            />
          </Felt>

          <Felt navn={t('red.slug')} id="f-slug" hjelp={t('red.slugHjelp', { slug: slug || '…' })}>
            <input
              id="f-slug"
              className="adm-inn"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugLaast(true)
              }}
            />
          </Felt>

          <Felt navn={t('red.ingress')} id="f-ingress" hjelp={t('red.ingressHjelp')}>
            <textarea
              id="f-ingress"
              className="adm-inn"
              rows={2}
              value={ingress}
              onChange={(e) => setIngress(e.target.value)}
            />
          </Felt>

          <Felt navn={t('red.toppbilde')}>
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
                  {lasterBilde ? t('red.lasterOpp') : bildeUrl ? t('red.byttBilde') : t('red.velgBilde')}
                </button>
                {bildeUrl && (
                  <button
                    type="button"
                    className="adm-knapp adm-knapp--fare adm-knapp--liten"
                    onClick={() => setBildeUrl(null)}
                  >
                    {t('red.fjern')}
                  </button>
                )}
              </div>
            </div>
            <input ref={bildeToppRef} type="file" accept="image/*" hidden onChange={(e) => void lastOppTopp(e)} />
          </Felt>

          <Felt navn={t('red.innhold')} id="f-innhold">
            <div>
              <div className="adm-verktoyrad">
                <button type="button" onClick={() => skrivInn('**', '**', t('red.fetTekst'))} title={t('red.fet')}>
                  <Bold size={15} />
                </button>
                <button type="button" onClick={() => skrivInn('*', '*', t('red.kursivTekst'))} title={t('red.kursiv')}>
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => skrivInn('\n\n## ', '', t('red.overskriftTekst'))}
                  title={t('red.overskrift')}
                >
                  <Heading2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => skrivInn('\n\n- ', '', t('red.punktTekst'))}
                  title={t('red.punktliste')}
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => skrivInn('[', '](https://)', t('red.lenkeTekst'))}
                  title={t('red.lenke')}
                >
                  <LenkeIkon size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => bildeInnholdRef.current?.click()}
                  disabled={lasterBilde}
                  title={t('red.settInnBilde')}
                >
                  <ImagePlus size={15} />
                  {lasterBilde ? t('red.lasterOpp') : t('red.bilde')}
                </button>
              </div>
              <textarea
                id="f-innhold"
                ref={tekstRef}
                className="adm-inn"
                rows={16}
                value={innhold}
                onChange={(e) => setInnhold(e.target.value)}
                placeholder={t('red.innholdPlassholder')}
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
              {t('red.slett')}
            </button>
          )}
        </div>

        <div>
          <div className="adm-diagram-tittel">{t('red.forhandTittel')}</div>
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
                <p style={{ color: 'var(--tekst-svak)' }}>{t('red.forhandTom')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
