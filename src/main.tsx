import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { EraProvider } from './eras/EraProvider'
import { SplashScreen } from './components/splash/SplashScreen'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <EraProvider>
        <App />
      </EraProvider>
    </BrowserRouter>
    <SplashScreen />
  </React.StrictMode>
)
