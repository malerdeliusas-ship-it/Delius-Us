import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import useIsMobile from './lib/useIsMobile'
import useSeo from './lib/seo'
import { useMykScroll } from './lib/mykScroll'
import { useSporing } from './lib/spor'
import { useTilbudSkjema } from './lib/tilbud'
import { useAnalyse } from './lib/analyse'

import Home from './pages/Home'
import OmOss from './pages/OmOss'
import Portefolje from './pages/Portefolje'
import Malertjenester from './pages/Malertjenester'
import Kontakt from './pages/Kontakt'
import Blogg from './pages/Blogg'
import BloggInnleggSide from './pages/BloggInnleggSide'
import Lenkevideresending from './pages/Lenkevideresending'
import Personvern from './pages/Personvern'
import Informasjonskapsler from './pages/Informasjonskapsler'
import Vilkar from './pages/Vilkar'
import Angrerett from './pages/Angrerett'
import Musikk from './components/Musikk'
import Samtykke from './components/Samtykke'

import HomeMobil from './pages/mobile/HomeMobil'
import OmOssMobil from './pages/mobile/OmOssMobil'
import PortefoljeMobil from './pages/mobile/PortefoljeMobil'
import MalertjenesterMobil from './pages/mobile/MalertjenesterMobil'
import KontaktMobil from './pages/mobile/KontaktMobil'
import BloggMobil from './pages/mobile/BloggMobil'
import BloggInnleggMobil from './pages/mobile/BloggInnleggMobil'

/**
 * Admin-panelet lastes kun når noen faktisk går til /admin – koden ligger i
 * en egen fil som besøkende på nettstedet aldri laster ned.
 */
const Admin = lazy(() => import('./admin/AdminApp'))

/**
 * Figma-designet er tegnet for desktop og vises 1:1 der. På smale skjermer
 * bygges de samme sidene opp som én kolonne, med samme farger, fonter,
 * bilder og tekster.
 */
export default function App() {
  const mobil = useIsMobile()
  useSeo()
  useMykScroll()
  useSporing()
  // Google Analytics, bare etter samtykke (src/lib/analyse.ts)
  useAnalyse()
  const { pathname } = useLocation()
  /* Tilbudsskjemaet står både på forsiden og på Kontakt-siden, og bytter
     utgave når vinduet krysser mobilgrensen. Tilstanden bor derfor her, så
     det kunden har skrevet ikke forsvinner i byttet. */
  const skjema = useTilbudSkjema()

  // Bakgrunnsmusikken hører til nettstedet, ikke til admin-panelet og
  // ikke til sporingslenkene som bare sender videre.
  const medMusikk = !pathname.startsWith('/admin') && !pathname.startsWith('/l/')

  const sider = {
    forside: mobil ? <HomeMobil s={skjema} /> : <Home s={skjema} />,
    omOss: mobil ? <OmOssMobil /> : <OmOss />,
    portefolje: mobil ? <PortefoljeMobil /> : <Portefolje />,
    malertjenester: mobil ? <MalertjenesterMobil /> : <Malertjenester />,
    kontakt: mobil ? <KontaktMobil s={skjema} /> : <Kontakt s={skjema} />,
    blogg: mobil ? <BloggMobil /> : <Blogg />,
    innlegg: mobil ? <BloggInnleggMobil /> : <BloggInnleggSide />,
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={sider.forside} />
        <Route path="/om-oss" element={sider.omOss} />
        <Route path="/portefolje" element={sider.portefolje} />
        <Route path="/malertjenester" element={sider.malertjenester} />
        <Route path="/kontakt" element={sider.kontakt} />
        <Route path="/blogg" element={sider.blogg} />
        <Route path="/blogg/:slug" element={sider.innlegg} />
        <Route path="/personvern" element={<Personvern />} />
        <Route path="/informasjonskapsler" element={<Informasjonskapsler />} />
        <Route path="/vilkar" element={<Vilkar />} />
        <Route path="/angrerett" element={<Angrerett />} />
        {/* /tilbud var en egen side fram til designet flyttet det lange
            skjemaet til Kontakt-siden. Lenker som allerede er delt, og
            oppføringen i søkemotorene, sendes dit skjemaet står nå.
            vercel.json gjør det samme på serveren, med 308. */}
        <Route path="/tilbud" element={<Navigate to="/kontakt" replace />} />
        {/* sporingslenker: teller besøket og sender videre */}
        <Route path="/l/:kode" element={<Lenkevideresending />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          }
        />
        {/* Ukjente adresser sendes hjem, så tastefeil ikke blir stående som
            egne kopier av forsiden (myk 404) i søkemotorene. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {medMusikk && <Musikk />}
      {/* Banneret om informasjonskapsler. Holder seg selv borte fra admin og /l/. */}
      <Samtykke />
    </>
  )
}
