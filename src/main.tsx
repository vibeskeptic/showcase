import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@mantine/core/styles.css'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import App from './App'

// Handle GitHub Pages 404 redirect (see public/404.html)
const redirectPath = new URLSearchParams(window.location.search).get('p')
if (redirectPath) {
  window.history.replaceState(null, '', redirectPath)
}

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" />
    <MantineProvider defaultColorScheme="auto">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
