import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const THEME_STORAGE_KEY = 'orchestrator-theme'

const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
const initialTheme = savedTheme === 'dark' || savedTheme === 'light'
  ? savedTheme
  : window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

document.documentElement.dataset.theme = initialTheme
document.documentElement.style.colorScheme = initialTheme

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
