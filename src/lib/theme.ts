// Eksakte verdier hentet fra Figma-filen «Redesign pagina web Malerdelius»
// via Figma REST API. Ikke endre uten å sjekke mot designet.

export const C = {
  navy: '#022269', // hovedtekst, nav, footer
  navyH1: '#020369', // H1 i hero
  gold: '#ffc300',
  goldAlt: '#ffc717', // knapp i kontaktskjema, overskrifter på Om oss
  goldText: '#ffb000', // «Høy Kvalitet»
  brown: '#4e280a', // brødtekst i tjenestekort
  cream: '#fef5e9', // hero-bakgrunn (#f8c17e @17% over hvitt)
  contactBlue: '#2653b5', // kontaktseksjonen på forsiden
  panelBlue: '#224fb1', // Om oss-panel, overskrifter i portefølje
  teamMeta: '#0051ff', // «16 års erfaring»
  reasonBody: '#001381',
  formText: '#002f96', // tekst i skjemaknappen
  mittanbud: '#0036ac',
  placeholder: '#9a9ac3',
  white: '#ffffff',
  black: '#000000',
  cardWhite: 'rgba(255,255,255,0.54)',

  // Porteføljens fem bånd, ovenfra og ned
  pf: ['#fff0da', '#ffe4bc', '#ffd89e', '#fec56f', '#faad39'],
}

/**
 * Figma-gradienter med fyllopasitet under 1 blander seg annerledes enn CSS
 * (Figma interpolerer i premultiplisert alfa). Disse stoppene er derfor
 * samplet direkte fra Figmas egen 1:1-eksport, så resultatet blir identisk.
 */
const stops = (list: string[]) =>
  `linear-gradient(180deg, ${list
    .map((c, i) => `${c} ${((i / (list.length - 1)) * 100).toFixed(1)}%`)
    .join(', ')})`

export const G = {
  team: stops([
    '#eff3fc', '#eaeff9', '#e4eaf7', '#dfe6f6', '#e0e7f6', '#e2e9f8',
    '#e5ecfa', '#e3ebfc', '#dee8fc', '#dae6fe', '#d6e3ff',
  ]),
  tjenester: stops([
    '#fef9f3', '#fef6eb', '#fef4e3', '#fcf1d9', '#fdeece', '#feecc2',
    '#fee9b5', '#fee6a7', '#fee497', '#fee187', '#ffde75',
  ]),
  // Kontakt-siden: rene stopp uten alfa, så CSS treffer eksakt
  kontakt: 'linear-gradient(to top, #ffffff 0%, #7aa3fd 100%)',
  // #f8c17e @17% → #0051ff, fyllopasitet 0.54 over hvitt. Regnet ut punkt for
  // punkt og kontrollert mot Figmas egen eksport (avvik under 1/255).
  malertjenester: stops([
    '#fef9f3', '#fbf5ef', '#f5f0ec', '#ede9eb', '#e2e2ea', '#d6daeb',
    '#c7d0ec', '#b6c6ef', '#a2bbf3', '#8daef9', '#75a1ff',
  ]),
}

/**
 * Gradient som skal ligge oppå noe annet (f.eks. akvarellsølet). CSS
 * interpolerer gradienter i premultiplisert alfa, Figma gjør det ikke, så
 * fargene sklir fra hverandre med bare to stopp. Med mange stopp blir
 * avviket borte.
 */
const alphaStops = (
  c0: [number, number, number],
  a0: number,
  c1: [number, number, number],
  a1: number,
  op: number,
  n = 21
) => {
  const deler: string[] = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const c = c0.map((v, k) => Math.round(v + (c1[k] - v) * t))
    const a = ((a0 + (a1 - a0) * t) * op).toFixed(4)
    deler.push(`rgba(${c[0]},${c[1]},${c[2]},${a}) ${(t * 100).toFixed(1)}%`)
  }
  return `linear-gradient(180deg, ${deler.join(', ')})`
}

/** Malertjenester-siden: gradienten ligger oppå akvarellsølet i designet. */
export const MT_OVERLAY = alphaStops([248, 193, 126], 0.17, [0, 81, 255], 1, 0.54)

export const FONT = "'Montserrat', system-ui, sans-serif"
export const FONT_MUKTA = "'Mukta', 'Montserrat', system-ui, sans-serif"

export const DESIGN_WIDTH = 1430

/** Bedriftens data. Adressen er den som står i kontaktraden i designet. */
export const BEDRIFT = {
  navn: 'Maler Delius AS',
  adresse: 'Ullevålsveien 76, 0454 Oslo',
  telefon: '+47 966 93 780',
  telefonLenke: 'tel:+4796693780',
  epost: 'info@malerdelius.no',
  nettsted: 'malerdelius.no',
  orgnr: 'Org nr. 934 409 256',
  facebook: '', // adresa reala vine de la kunden
  instagram: '', // adresa reala vine de la kunden
  kart: 'https://www.google.com/maps/search/?api=1&query=Ullev%C3%A5lsveien+76,+0454+Oslo',
}
