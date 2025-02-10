import {Hono} from "hono"
import { PrismaClient, User } from "@prisma/client"
import AWS from "aws-sdk"
import crypto from "crypto"
export function generateSecretHash(username: string) {
  const secret = process.env.AWS_COGNITO_CLIENT_SECRET!
  const clientId = process.env.AWS_COGNITO_CLIENT_ID!
  return crypto
    .createHmac("sha256", secret)
    .update(username + clientId)
    .digest("base64")
}

const prisma = new PrismaClient()

AWS.config.update({
  region: process.env.AWS_REGION!,
})

const cognito = new AWS.CognitoIdentityServiceProvider()

const userRoutes = new Hono<{Variables: {
  authUser: User
}}>()

userRoutes.post("/", async (c) => {
  const { name, email, password } = await c.req.json()

  if (!name || !email || !password) {
    return c.json({ error: "情報が不足しています" }, 400)
  }
  const clientId = process.env.AWS_COGNITO_CLIENT_ID
  if (!clientId) {
    console.error("AWS_COGNITO_CLIENT_ID が設定されていません")
    return c.json({ error: "内部エラー" }, 500)
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })
  if (existingUser) {
    return c.json({ error: "このメールアドレスは既に登録されています" }, 400)
  }
  const secretHash = generateSecretHash(email)

  try {
    const signUpResult = await cognito
      .signUp({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
        ],
        SecretHash: secretHash
      })
      .promise()

    console.log("✅ Cognito signUp 成功:", signUpResult)
    const user = await prisma.user.create({
      data: { name, email },
    })

    return c.json({ message: "アカウントが作成されました", user })
  } catch (error) {
    console.error("❌ Cognito signUp エラー", error)
    return c.json({ error: "Cognito 登録に失敗しました" }, 500)
  }
})

userRoutes.get("/me", async (c) => {
  const authUser = c.get("authUser")
  const email = c.req.query("email")

  if (!authUser?.email || authUser.email !== email) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
  })

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404)
  }

  return c.json(dbUser)
})

export default userRoutes
