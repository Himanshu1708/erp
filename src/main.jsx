import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { HeadProvider } from 'react-head'
import { AppContextProvider } from './context/AppContext.jsx'
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <HeadProvider>
      <AppContextProvider>
        <ThemeProvider>
            <App />
        </ThemeProvider>
      </AppContextProvider>
    </HeadProvider>
  </BrowserRouter>,
)
