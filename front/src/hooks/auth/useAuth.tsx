import { useEffect, useState, ReactNode } from 'react'
import { AuthContext } from './useAuth'
import { User } from '../../types/user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/session", {
          method: "GET",
          credentials: "include",
        })
  
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          console.error("セッションが無効です:", await res.json())
        }
      } catch (err) {
        console.error("❌ セッション取得失敗:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSession()
  }, [])
  

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:3000/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('サインインに失敗しました')
      const data = await res.json()
      localStorage.setItem("token", data.token)
      setUser(data.user)
    } catch (err) {
      console.error('サインイン失敗:', err)
    }
  }
  const signOut = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/signout", {
        method: "POST",
        credentials: "include",
      })
  
      if (!res.ok) {
        throw new Error("サーバーログアウトに失敗しました")
      }
  
      setUser(undefined)
    } catch (err) {
      console.error("❌ ログアウト失敗:", err)
    }
  }
  

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
