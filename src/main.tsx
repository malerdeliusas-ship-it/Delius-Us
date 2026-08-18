import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import Feilgrense from './components/Feilgrense'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Feilgrense>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Feilgrense>
  </React.StrictMode>,
)
