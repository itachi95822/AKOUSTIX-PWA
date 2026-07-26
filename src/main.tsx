import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { EraProvider } from './eras/EraProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <EraProvider>
        <App />
      </EraProvider>
    </BrowserRouter>
  </React.StrictMode>
)
