import { useState, ReactNode } from "react"
import Toast from "./Toast"
import { ToastContext } from "./useToast"

interface ToastState {
  message: string
  type: "success" | "error"
  show: boolean
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | undefined>(undefined)

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, show: true })
    setTimeout(() => setToast(undefined), 4000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(undefined)}
        />
      )}
    </ToastContext.Provider>
  )
}
