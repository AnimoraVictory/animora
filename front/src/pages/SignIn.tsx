import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"
import {zodResolver} from "@hookform/resolvers/zod"

import "./styles/SignIn.scss"
import { useForm } from "react-hook-form"
import { useToast } from "../utils/toast/useToast"
const signInInputSchema = z.object({
    email: z.string().email({message: "正しいメールアドレスを入力してください。"}),
    password: z.string()
})

type SignInInputData = z.infer<typeof signInInputSchema>

const SignIn = () => {
  const navigate = useNavigate()
  const{ showToast } = useToast()

  const {
    register,
    handleSubmit: handleSignIn,
    setError
  } = useForm<SignInInputData>({
    resolver: zodResolver(signInInputSchema),
  })
  const [loading, setLoading] = useState(false)

  const onSignIn = async (data: SignInInputData) => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:3000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }
      localStorage.setItem("accessToken", responseData.accessToken)
      localStorage.setItem("idToken", responseData.idToken)
      localStorage.setItem("refreshToken", responseData.refreshToken)
      showToast("認証に成功しました。", "success")
      navigate("/home")
      navigate(0)
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "不明なエラー"
        setError("password", {
            type:"manual",
            message: errorMessage
        })
        showToast("認証に失敗しました。", "error")
        console.log("ここは実行されてます")
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <div className="signin-container">
      <h2>ログイン</h2>
  <form onSubmit={handleSignIn(onSignIn)}>
      <input
        type="email"
        {...register("email")}
        placeholder="メールアドレス"
      />

      <input
        type="password"
        {...register("password")}
        placeholder="パスワード"
      />
      <button type="submit" disabled={loading}>
        {loading ? "認証中..." : "ログイン"}
      </button>
      </form>
      <p>
        <button className="signup-link" onClick={() => navigate("/signup")}>
          サインアップはこちら
        </button>
      </p>
    </div>
  )
}

export default SignIn
