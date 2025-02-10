import { createContext, useContext } from "react"

  interface ToastContextProps {
    showToast: (message: string, type: "success" | "error") => void
  }
  

export const ToastContext = createContext<ToastContextProps | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
