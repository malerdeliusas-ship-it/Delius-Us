import { useEffect } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import {
  LayoutDashboard,
  Newspaper,
  Images,
  BarChart3,
  Link2,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import './admin.css'
import { supabase } from '../lib/supabase'
import { useOkt, useErAdmin, loggUt, Vakt } from './auth'
import { SprakGiver, SprakVelger, useSprak, type Nokkel } from './sprak'
import logo from '../assets/figma/logo.png'

import LoggInn from './sider/LoggInn'
import Dashbord from './sider/Dashbord'
import BloggListe from './sider/BloggListe'
import BloggRedigering from './sider/BloggRedigering'
import Galleri from './sider/Galleri'
import Statistikk from './sider/Statistikk'
import Lenker from './sider/Lenker'

/**
 * Admin-panelet: eget lite «kontor» på /admin, i nettstedets farger.
 * Lastes som egen bunt (lazy i App.tsx), så besøkende aldri laster det ned.
 * Alt synlig er på norsk eller rumensk – valget sitter i SprakGiver.
 */

const MENY: { til: string; nokkel: Nokkel; Ikon: typeof LayoutDashboard; slutt?: boolean }[] = [
  { til: '/admin', nokkel: 'meny.oversikt', Ikon: LayoutDashboard, slutt: true },
  { til: '/admin/blogg', nokkel: 'meny.blogg', Ikon: Newspaper },
  { til: '/admin/galleri', nokkel: 'meny.galleri', Ikon: Images },
  { til: '/admin/statistikk', nokkel: 'meny.statistikk', Ikon: BarChart3 },
  { til: '/admin/lenker', nokkel: 'meny.lenker', Ikon: Link2 },
]

function Ramme({ children }: { children: React.ReactNode }) {
  const { t } = useSprak()

  return (
    <div className="adm">
      <aside className="adm-side">
        {/* Den kremhvite toppen med firmamerket: logoen er marineblå og
            trenger lys bunn for å synes. Gullstreken under er skillet
            mot resten av stolpen, som beholder marinefargen. */}
        <div className="adm-side-topp">
          <img src={logo} alt="Maler Delius AS" />
          <span className="adm-side-ord">Admin</span>
        </div>

        <nav className="adm-meny" aria-label={t('meny.aria')}>
          {MENY.map(({ til, nokkel, Ikon, slutt }) => (
            <NavLink
              key={til}
              to={til}
              end={slutt}
              className={({ isActive }) => (isActive ? 'adm-aktiv' : undefined)}
              /* under 940px vises bare ikonet – navnet må da ligge her, ellers
                 står skjermleseren og musepekeren igjen uten noe å lese */
              title={t(nokkel)}
              aria-label={t(nokkel)}
            >
              <Ikon size={19} />
              <span>{t(nokkel)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="adm-side-bunn">
          <SprakVelger />
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            title={t('meny.seNettstedet')}
            aria-label={t('meny.seNettstedet')}
          >
            <ExternalLink size={18} />
            <span>{t('meny.seNettstedet')}</span>
          </a>
          <button onClick={() => void loggUt()} title={t('meny.loggUt')} aria-label={t('meny.loggUt')}>
            <LogOut size={18} />
            <span>{t('meny.loggUt')}</span>
          </button>
        </div>
      </aside>

      <main className="adm-hoved">{children}</main>
    </div>
  )
}

function ManglerOppsett() {
  const { t } = useSprak()
  return (
    <div className="adm">
      <div className="adm-inngang">
        <div className="adm-inngang-kort">
          <h1>{t('oppsett.tittel')}</h1>
          <p>{t('oppsett.tekst')}</p>
        </div>
      </div>
    </div>
  )
}

function AdminInnhold() {
  const okt = useOkt()
  const erAdmin = useErAdmin(okt)

  useEffect(() => {
    document.title = 'Admin – Maler Delius AS'
  }, [])

  // uten nøkler i .env kan ingenting virke – si det tydelig
  if (!supabase) return <ManglerOppsett />

  return (
    <Routes>
      <Route
        path="logg-inn"
        element={okt ? <Navigate to="/admin" replace /> : <LoggInn />}
      />
      <Route
        path="*"
        element={
          <Vakt okt={okt} erAdmin={erAdmin}>
            <Ramme>
              <Routes>
                <Route index element={<Dashbord />} />
                <Route path="blogg" element={<BloggListe />} />
                <Route path="blogg/ny" element={<BloggRedigering />} />
                <Route path="blogg/:id" element={<BloggRedigering />} />
                <Route path="galleri" element={<Galleri />} />
                <Route path="statistikk" element={<Statistikk />} />
                <Route path="lenker" element={<Lenker />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Ramme>
          </Vakt>
        }
      />
    </Routes>
  )
}

export default function AdminApp() {
  return (
    <SprakGiver>
      <AdminInnhold />
    </SprakGiver>
  )
}
