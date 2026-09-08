// Innhold og eksakte Figma-koordinater. Tekstene er ordrett fra designet,
// med fire unntak fra 8. september 2026 (se README, «Tekst som avviker»):
// den avkuttede setningen «… varighet på vår» er fullført, og tre absolutte
// miljøpåstander («kun miljøvennlige materialer», «sertifiserte
// miljømaterialer») er gjort konkrete, fordi markedsføringsloven krever at
// slike påstander kan dokumenteres.
import { C } from './theme'
import icReparasjon from '../assets/figma/ic-reparasjon.webp'
import icDekorative from '../assets/figma/ic-dekorative.webp'
import icEco from '../assets/figma/ic-eco.webp'
import icInterior from '../assets/figma/ic-interior.webp'
import icFargevalg from '../assets/figma/ic-fargevalg.webp'
import icFasade from '../assets/figma/ic-fasade.webp'

import bildeLucia from '../assets/figma/team-lucia.webp'
import bildeNicolae from '../assets/figma/team-nicolae.webp'
import bildeSergiu from '../assets/figma/team-sergiu.webp'
import bildeLilia from '../assets/figma/team-lilia.webp'
import bildeVictoria from '../assets/figma/team-victoria.webp'
import bildeGhita from '../assets/figma/team-ghita.webp'
import icTeam from '../assets/figma/ic-team.webp'
import icKvalitet from '../assets/figma/ic-kvalitet.webp'
import icGaranti from '../assets/figma/ic-garanti.webp'

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
    brod: '– Miljømerkede produkter når du ønsker det.\n– Støtte for en bærekraftig og sunn livsstil.\n– Rådgivning om valg av helsevennlige materialer.',
  },
  {
    id: 'interior', ikon: icInterior, iL: 228, iT: 3813, iW: 136, iH: 79,
    tittel: 'Interiørmaling',
    titler: [{ l: 165, t: 3926, w: 262, align: 'center', tekst: 'Interiørmaling' }],
    bL: 165, bT: 3982, bW: 262,
    brod: '– Valg av fargeløsninger som harmonisk passer inn i ditt interiør.\n– Rask og kvalitetsmessig utførelse av arbeidet.\n– Minimalt inngrep i din daglige rutine.',
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

export const BADGES = [
  { l: 100, bg: C.gold, ic: icTeam, icL: 146.5, op: 0.86, txtL: 280.5, w: 183, farge: C.navy, tekst: 'Profesjonelt \nTeam' },
  { l: 510, bg: C.navy, ic: icKvalitet, icL: 593.5, op: 1, txtL: 727.5, w: 109, farge: C.goldText, tekst: 'Høy \nKvalitet' },
  { l: 920, bg: C.gold, ic: icGaranti, icL: 974.5, op: 0.86, txtL: 1108.5, w: 167, farge: C.navy, tekst: 'Garanti og \nPålitelighet' },
]

/** «Hvorfor velge oss?» – tittel og brødtekst med hver sin ramme fra Figma. */
export const GRUNNER = [
  { l: 716, t: 1161, w: 295, bT: 1203, bW: 295, tittel: 'Individuell tilnærming', brod: 'Vi lytter til våre kunder og tilbyr løsninger som passer perfekt til dine behov.', farge: C.reasonBody },
  { l: 716, t: 1321, w: 295, bT: 1363, bW: 295, tittel: 'Miljøansvar', brod: 'Vi tar hensyn til både din helse og miljøet når vi velger materialer og arbeidsmåte.', farge: C.navy },
  { l: 716, t: 1471, w: 281, bT: 1513, bW: 281, tittel: 'Kvalitet og pålitelighet', brod: 'Vi garanterer høy kvalitet og varighet på vårt arbeid.', farge: C.navy },
  { l: 1033, t: 1161, w: 277, bT: 1203, bW: 277, tittel: 'Garantier og støtte', brod: 'Vi tilbyr garantier på alt vårt arbeid og er alltid klare til å gi støtte etter prosjektets avslutning.', farge: C.navy },
  { l: 1033, t: 1354, w: 277, bT: 1396, bW: 277, tittel: 'Lokal erfaring', brod: 'Som et selskap som opererer i Oslo, har vi god kjennskap til de lokale forholdene og kan tilby de mest effektive løsningene for ditt prosjekt.', farge: C.navy },
]

/** «Hvorfor velge oss?» – to spalter, med egne rammer fra Figma. */
export const GRUNNER_OMOSS = [
  { l: 734, t: 607, w: 274, bT: 649, bW: 274, farge: C.gold, tittel: 'Individuell tilnærming', brod: 'Vi lytter til våre kunder og tilbyr løsninger som passer perfekt til dine behov.' },
  { l: 734, t: 758, w: 295, bT: 800, bW: 286, farge: C.gold, tittel: 'Miljøansvar', brod: 'Vi tar hensyn til både din helse og miljøet når vi velger materialer og arbeidsmåte.' },
  { l: 734, t: 908, w: 281, bT: 950, bW: 281, farge: C.gold, tittel: 'Kvalitet og pålitelighet', brod: 'Vi garanterer høy kvalitet og varighet på vårt arbeid.' },
  { l: 1040, t: 607, w: 256, bT: 649, bW: 256, farge: C.goldAlt, tittel: 'Garantier og støtte', brod: 'Vi tilbyr garantier på alt vårt arbeid og er alltid klare til å gi støtte etter prosjektets avslutning.' },
  { l: 1040, t: 800, w: 256, bT: 842, bW: 256, farge: C.goldAlt, tittel: 'Lokal erfaring', brod: 'Som et selskap som opererer i Oslo, har vi god kjennskap til de lokale forholdene og kan tilby de mest effektive løsningene for ditt prosjekt.' },
]

export const TRINN = [
  {
    kort: 125,
    tittel: { l: 189, t: 1796, w: 363, tekst: 'Konsultasjon og planlegging' },
    punkter: [
      { l: 189, t: 1923, w: 262, tekst: 'Gratis innledende konsultasjon' },
      { l: 189, t: 1997, w: 217, tekst: 'Vurdering av rommet' },
      { l: 189, t: 2041, w: 277, tekst: 'Valg av farger og materialer' },
      { l: 189, t: 2077, w: 267, tekst: 'Utarbeidelse av forslag og kostnadsoverslag' },
    ],
    merke: { l: 222, t: 2181, w: 159, tekst: 'TRINN 1' },
  },
  {
    kort: 531,
    tittel: { l: 604, t: 1797, w: 260, tekst: 'Forberedelse og utførelse' },
    punkter: [
      { l: 600, t: 1916, w: 262, tekst: 'Forberedelse av overflater' },
      { l: 599, t: 1953, w: 259, tekst: 'Beskyttelse av tilstøtende områder' },
      { l: 600, t: 2012, w: 277, tekst: 'Utførelse av malerarbeid' },
      { l: 600, t: 2052, w: 267, tekst: 'Kvalitetskontroll under arbeidet' },
    ],
    merke: { l: 639, t: 2180, w: 164, tekst: 'TRINN 2' },
  },
  {
    kort: 945,
    tittel: { l: 1001, t: 1796, w: 263, tekst: 'Fullføring og støtte' },
    punkter: [
      { l: 1001, t: 1896, w: 262, tekst: 'Endelig kvalitetskontroll' },
      { l: 1001, t: 1930, w: 320, tekst: 'Rydding og overlevering av prosjektet — vi rydder alltid etter oss' },
      { l: 1001, t: 2033, w: 201, tekst: 'Sikring av garantier' },
      { l: 1000, t: 2076, w: 235, tekst: 'Støtte etter prosjektets avslutning' },
    ],
    merke: { l: 1053, t: 2181, w: 158, tekst: 'TRINN 3' },
  },
]
export const KORT = [
  {
    boks: { l: 495, t: 460, w: 816, h: 466 }, ikon: { l: 1107.5, t: 487 },
    tittel: { l: 1004, t: 683, w: 273, tekst: 'Profesjonell interiørmaling' },
    brod: { l: 1004, t: 780, w: 295, tekst: 'Med nøye fargevalg og profesjonelt håndverk skaper vi harmoniske rom med et elegant og varig resultat.' },
  },
  {
    boks: { l: 119, t: 1086, w: 784, h: 453 }, ikon: { l: 273.5, t: 1113 },
    tittel: { l: 170, t: 1284, w: 273, tekst: 'Renovering av rom' },
    brod: { l: 170, t: 1396, w: 295, tekst: 'Vi oppgraderer eksisterende rom for å forbedre funksjonalitet, estetikk og komfort.' },
  },
  {
    boks: { l: 936, t: 1727, w: 715, h: 453 }, ikon: { l: 1141.5, t: 1754 },
    tittel: { l: 1038, t: 1904, w: 273, tekst: 'Restaurering av detaljer' },
    brod: { l: 1038, t: 2016, w: 295, tekst: 'Med presist håndverk bevarer og fremhever vi historiske takdetaljer, rosetter og dekorative elementer.' },
  },
  {
    boks: { l: 119, t: 2310, w: 784, h: 526 }, ikon: { l: 320.5, t: 2337 },
    tittel: { l: 217, t: 2487, w: 273, tekst: 'Materialer av høy kvalitet' },
    brod: { l: 217, t: 2599, w: 295, tekst: 'Vi bruker nøye utvalgte produkter og materialer av høy kvalitet for å sikre et jevnt, slitesterkt og profesjonelt resultat.' },
  },
]
