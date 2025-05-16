import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRouter from './router/AppRouter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>
      <AppRouter />
    </div>
  </StrictMode>
)
