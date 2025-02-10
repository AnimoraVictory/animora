import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import "./styles/VerifyEmail.scss"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const verifyEmailInputSchema = z.object({
    email: z.string().email({message: "正しいメールアドレスを入力してください。"}),
    code: z.string().min(6, { message: "6桁の認証コードを入力してください。" }),
})

type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>


const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = location.state?.email || ""
  const {
    register,
    handleSubmit: handleVerify,
    formState: {errors},
    setError,
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailInputSchema),
    defaultValues: {email: emailFromState},
  })
  const [loading, setLoading] = useState(false)

  const onVerify = async (data: VerifyEmailInput) => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:3000/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error || "確認コードの検証に失敗しました")
      navigate("/signin")
    } catch (err) {
      setError("code", {
        type: "manual",
        message: err instanceof Error ? err.message : "不明なエラー"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-container">
      <h2>メール認証</h2>
      <p>登録したメールアドレスに送信された確認コードを入力してください。</p>

      <input
        {...register("email")}
        type="email"
        placeholder="メールアドレス"
        disabled={!!emailFromState}
      />
      {errors.email && <p className="error">{errors.email.message}</p>}

      <input
      {...register("code")}
        type="text"
        placeholder="確認コード"
      />
      {errors.code && <p className="error">{errors.code.message}</p>}

      <button onClick={handleVerify(onVerify)} disabled={loading}>
        {loading ? "確認中..." : "認証する"}
      </button>
    </div>
  )
}

export default VerifyEmail
