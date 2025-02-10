import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './hooks/auth/useAuth.tsx'
import './utils/aws/aws-config.ts'
import { ToastProvider } from './utils/toast/ToastProvider.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
      </AuthProvider>
  </StrictMode>,
)
