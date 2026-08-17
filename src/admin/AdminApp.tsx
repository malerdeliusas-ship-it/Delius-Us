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
import { useOkt, loggUt, Vakt } from './auth'
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
 */

const MENY = [
  { til: '/admin', tekst: 'Oversikt', Ikon: LayoutDashboard, slutt: true },
  { til: '/admin/blogg', tekst: 'Blogg', Ikon: Newspaper },
  { til: '/admin/galleri', tekst: 'Galleri', Ikon: Images },
  { til: '/admin/statistikk', tekst: 'Statistikk', Ikon: BarChart3 },
  { til: '/admin/lenker', tekst: 'Lenker', Ikon: Link2 },
]

function Ramme({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-side-logo">
          <img src={logo} alt="Maler Delius AS" />
          <span>Admin</span>
        </div>

        <nav className="adm-meny" aria-label="Admin-meny">
          {MENY.map(({ til, tekst, Ikon, slutt }) => (
            <NavLink
              key={til}
              to={til}
              end={slutt}
              className={({ isActive }) => (isActive ? 'adm-aktiv' : undefined)}
            >
              <Ikon size={19} />
              <span>{tekst}</span>
            </NavLink>
          ))}
        </nav>

        <div className="adm-side-bunn">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            <span>Se nettstedet</span>
          </a>
          <button onClick={() => void loggUt()}>
            <LogOut size={18} />
            <span>Logg ut</span>
          </button>
        </div>
      </aside>

      <main className="adm-hoved">{children}</main>
    </div>
  )
}

export default function AdminApp() {
  const okt = useOkt()

  useEffect(() => {
    document.title = 'Admin – Maler Delius AS'
  }, [])

  // uten nøkler i .env kan ingenting virke – si det tydelig
  if (!supabase) {
    return (
      <div className="adm">
        <div className="adm-inngang">
          <div className="adm-inngang-kort">
            <h1>Admin er ikke satt opp</h1>
            <p>
              Legg VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY i .env-filen
              (se .env.example) og start utviklingsserveren på nytt.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="logg-inn"
        element={okt ? <Navigate to="/admin" replace /> : <LoggInn />}
      />
      <Route
        path="*"
        element={
          <Vakt okt={okt}>
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
