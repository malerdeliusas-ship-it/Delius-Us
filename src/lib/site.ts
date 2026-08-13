// Innhold og eksakte Figma-koordinater. Tekstene er ordrett fra designet.
import icReparasjon from '../assets/figma/ic-reparasjon.png'
import icDekorative from '../assets/figma/ic-dekorative.png'
import icEco from '../assets/figma/ic-eco.png'
import icInterior from '../assets/figma/ic-interior.png'
import icFargevalg from '../assets/figma/ic-fargevalg.png'
import icFasade from '../assets/figma/ic-fasade.png'

import bildeLucia from '../assets/figma/team-lucia.jpg'
import bildeNicolae from '../assets/figma/team-nicolae.jpg'
import bildeSergiu from '../assets/figma/team-sergiu.jpg'
import bildeLilia from '../assets/figma/team-lilia.jpg'
import bildeVictoria from '../assets/figma/team-victoria.jpg'
import bildeGhita from '../assets/figma/team-ghita.jpg'

export type Tf = [[number, number, number], [number, number, number]]

export type Person = {
  navn: string; meta: string; bilde: string
  iL: number; iT: number; iW: number; iH: number; r: number
  nL: number; nT: number; nW: number
  mL: number; mT: number; mW: number
  /** Navnet står midtstilt i sin egen ramme (Nicolae) */
  senter?: boolean
  /** Undertittelen står midtstilt i sin egen ramme (Victoria) */
  metaSenter?: boolean
  /** Figmas beskjæring, når bildefyllet står i STRETCH-modus */
  tf?: Tf
}

/**
 * Teamet på forsiden. Koordinatene er absolutte i 1430px-designet.
 * Oppdatert etter Figma-versjonen fra 4. august 2026: Victoria kom til,
 * bildene ble større og seksjonen 294px høyere.
 */
export const TEAM: Person[] = [
  { navn: 'Lucia', meta: 'Maler med 16 års erfaring', bilde: bildeLucia, iL: 119.5, iT: 1867, iW: 271, iH: 406, r: 177, nL: 217, nT: 2288, nW: 76, mL: 135, mT: 2326, mW: 240 },
  { navn: 'Nicolae', meta: '            Daglig leder    \n Maler med 9 års erfaring', bilde: bildeNicolae, iL: 580.5, iT: 1866, iW: 271, iH: 406, r: 186, nL: 596, nT: 2287, nW: 240, senter: true, mL: 596, mT: 2325, mW: 240 },
  { navn: 'Sergiu', meta: 'Maler med 7 års erfaring', bilde: bildeSergiu, iL: 1004, iT: 1867, iW: 270, iH: 405, r: 232.5, nL: 1095, nT: 2287, nW: 88, mL: 1019, mT: 2325, mW: 240 },
  { navn: ' Lilia', meta: 'Maler med 14 års erfaring', bilde: bildeLilia, iL: 119.5, iT: 2414, iW: 271, iH: 406, r: 177, nL: 221, nT: 2835, nW: 68, mL: 135, mT: 2873, mW: 240 },
  { navn: 'Victoria', meta: 'Kreativ leder\nInteriørarkitekt, fotograf og innholdsprodusent', bilde: bildeVictoria, iL: 580, iT: 2414, iW: 271, iH: 407, r: 177, nL: 662.5, nT: 2836, nW: 106, mL: 595.5, mT: 2874, mW: 240, metaSenter: true },
  { navn: 'Ghita', meta: ' Maler med 10 års erfaring', bilde: bildeGhita, iL: 1010.5, iT: 2414, iW: 271, iH: 406, r: 177, nL: 1110, nT: 2835, nW: 72, mL: 1017, mT: 2873, mW: 258 },
]

type Tittel = { l: number; t: number; w: number; align: 'left' | 'center'; tekst: string }

/** De seks tjenestekortene. Koordinatene gjelder forsiden. */
export const TJENESTER: {
  id: string
  ikon: string
  iL: number; iT: number; iW: number; iH: number
  titler: Tittel[]
  bL: number; bT: number; bW: number
  brod: string
  /** Kort tittel, brukt på mobil og på Malertjenester-siden */
  tittel: string
}[] = [
  {
    id: 'reparasjon', ikon: icReparasjon, iL: 231, iT: 3234, iW: 148, iH: 81,
    tittel: 'Reparasjon og restaurering',
    titler: [
      { l: 195, t: 3349, w: 220, align: 'left', tekst: 'Reparasjon og ' },
      { l: 195, t: 3391, w: 220, align: 'center', tekst: 'restaurering ' },
    ],
    bL: 165, bT: 3448, bW: 280,
    brod: '– Utbedring av sprekker og defekter.\n– Forberedelse av overflater for maling.\n– Omfattende arbeid for å forbedre tilstanden til vegger og tak.',
  },
  {
    id: 'dekorative', ikon: icDekorative, iL: 647.5, iT: 3234, iW: 143, iH: 79,
    tittel: 'Dekorative teknikker',
    titler: [
      { l: 635, t: 3347, w: 168, align: 'left', tekst: 'Dekorative ' },
      { l: 635, t: 3389, w: 168, align: 'center', tekst: 'teknikker' },
    ],
    bL: 588, bT: 3446, bW: 262,
    brod: '– Et bredt utvalg av dekorative teknikker og stiler.\n– Skapelse av aksentvegger og dekorative elementer.\n– Individuell tilnærming til hvert prosjekt.',
  },
  {
    id: 'eco', ikon: icEco, iL: 1047, iT: 3234, iW: 154, iH: 81,
    tittel: 'Miljøvennlige løsninger',
    titler: [
      { l: 1020, t: 3349, w: 208, align: 'left', tekst: 'Miljøvennlige' },
      { l: 1020, t: 3390, w: 208, align: 'center', tekst: 'løsninger' },
    ],
    bL: 993, bT: 3447, bW: 262,
    brod: '– Bruk av sertifiserte miljømaterialer.\n– Støtte for en bærekraftig og sunn livsstil.\n– Rådgivning om valg av helsevennlige materialer.',
  },
  {
    id: 'interior', ikon: icInterior, iL: 228, iT: 3813, iW: 136, iH: 79,
    tittel: 'Interiørmaling',
    titler: [{ l: 165, t: 3926, w: 262, align: 'center', tekst: 'Interiørmaling' }],
    bL: 165, bT: 3982, bW: 262,
    brod: '-Valg av fargeløsninger som harmonisk passer inn i ditt interiør.\n-Rask og kvalitetsmessig utførelse av arbeidet.\n-Minimalt inngrep i din daglige rutine.',
  },
  {
    id: 'fargevalg', ikon: icFargevalg, iL: 623, iT: 3813, iW: 156, iH: 79,
    tittel: 'Fargevalg konsultasjoner',
    titler: [
      { l: 570, t: 3926, w: 262, align: 'center', tekst: 'Fargevalg ' },
      { l: 570, t: 3965, w: 262, align: 'center', tekst: 'konsultasjoner' },
    ],
    bL: 570, bT: 4022, bW: 262,
    brod: '– Profesjonell hjelp til å velge fargepaletter.\n– Vurdering av moderne trender og dine personlige preferanser.\n– Mulighet for prøvepåføring for visuell vurdering.',
  },
  {
    id: 'fasade', ikon: icFasade, iL: 1009.5, iT: 3813, iW: 209, iH: 79,
    tittel: 'Fasadearbeid',
    titler: [{ l: 983, t: 3934, w: 262, align: 'center', tekst: 'Fasadearbeid' }],
    bL: 983, bT: 3994, bW: 262,
    brod: '– Bruk av værbestandige materialer.\n– Forsterkning og beskyttelse av fasadeoverflater.\n– Profesjonell vurdering av fasadens tilstand.',
  },
]

/** «Hvorfor velge oss?»-punktene. Brukes på forsiden og på Om oss. */
export const GRUNNER = [
  { tittel: 'Individuell tilnærming', brod: 'Vi lytter til våre kunder og tilbyr løsninger som passer perfekt til dine behov.' },
  { tittel: 'Miljøansvar', brod: 'Vi bruker kun miljøvennlige materialer og tar hensyn til både din helse og miljøet.' },
  { tittel: 'Kvalitet og pålitelighet', brod: 'Vi garanterer høy kvalitet og varighet på vårt.' },
  { tittel: 'Garantier og støtte', brod: 'Vi tilbyr garantier på alt vårt arbeid og er alltid klare til å gi støtte etter prosjektets avslutning.' },
  { tittel: 'Lokal erfaring', brod: 'Som et selskap som opererer i Oslo, har vi god kjennskap til de lokale forholdene og kan tilby de mest effektive løsningene for ditt prosjekt.' },
]
