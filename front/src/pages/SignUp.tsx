import React, { useState } from "react"
import { z } from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import "./styles/SignUp.scss"
import { useNavigate } from "react-router-dom"

const userInputDataSchema = z.object({
    name: z.string(),
    email: z.string().email('有効なメールアドレスを入れてください'),
    password: z
    .string()
    .min(8, "パスワードは８文字以上にしてください")
    .regex(/[0-9]+/,{message: "半角数字を１文字以上使用してください"})
    .regex(/[a-z]+/, {message: "英小文字を１文字以上使用してください"})
    .regex(/[A-Z]+/, {message: "英大文字を１文字以上使用してください"})
  })
 
type UserInputData = z.infer<typeof userInputDataSchema>

  const SignUp: React.FC = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<UserInputData>({
      resolver: zodResolver(userInputDataSchema),
    })

    const navigate = useNavigate()
  
    const [serverError, setServerError] = useState<string | null>(null)
  
    const onSubmit = async (data: UserInputData) => {
      try {
        const res = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
  
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`)
        }

        navigate("/verify-email", { state: { email: data.email } })
      } catch (err) {
        if (err instanceof Error) {
          setServerError(err.message)
        } else {
          setServerError("不明なエラーが発生しました")
        }
      }
    }
  
    return (
      <div className="signup-container">
        <h2>アカウント作成</h2>
        {serverError && <p className="error-message">{serverError}</p>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register("name")} type="text" placeholder="アカウント名" />
          {errors.name && <p className="error-message">{errors.name.message}</p>}
  
          <input {...register("email")} type="email" placeholder="メールアドレス" />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
  
          <input {...register("password")} type="password" placeholder="パスワード" />
          {errors.password && <p className="error-message">{errors.password.message}</p>}
          <button type="submit">アカウントを作成</button>
        </form>
      </div>
    )
  }
  
  export default SignUp
