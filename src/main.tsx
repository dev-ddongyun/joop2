import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { checkBackendConnection } from './lib/backendConnection.ts'
import { useReportsStore } from './store/reportsStore.ts'
import './index.css'

void checkBackendConnection()
void useReportsStore.getState().fetchReports()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
