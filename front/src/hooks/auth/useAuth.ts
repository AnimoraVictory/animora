import { createContext, useContext } from "react"
import { User } from "../../types/user"

interface AuthContextType {
    user: User | undefined
    isAuthenticated: boolean
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
  }
  
  export const AuthContext = createContext<AuthContextType | undefined>(undefined)
  
  export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
  }
  