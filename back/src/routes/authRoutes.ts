import { Hono } from 'hono'
import { AWSError, CognitoIdentityServiceProvider } from 'aws-sdk'
import { generateSecretHash } from './userRoutes'
import { InitiateAuthResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider'
import { PromiseResult } from 'aws-sdk/lib/request'
import { PrismaClient, User } from '@prisma/client'
import { JwksClient } from "jwks-rsa"
import {
  getCookie,
} from 'hono/cookie'
import jwt from "jsonwebtoken"

const authRoutes = new Hono<{
  Variables: {
    user: User
  }
}>()
const prisma = new PrismaClient()
const cognito = new CognitoIdentityServiceProvider()

const cognitoRegion = process.env.AWS_REGION!
const cognitoUserPoolId = process.env.AWS_COGNITO_POOL_ID!

const jwksClient = new JwksClient({
  jwksUri: `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}/.well-known/jwks.json`
})

async function getSigningKey(header: any) {
  try {
    const key = await jwksClient.getSigningKey(header.kid)
    return key.getPublicKey()
  } catch (err) {
    console.error("❌ 公開鍵の取得に失敗しました", err)
    throw new Error("公開鍵の取得に失敗")
  }
}

// メールアドレス認証
authRoutes.post('/verify-email', async (c) => {
  const { email, code } = await c.req.json()

  if (!email || !code) {
    return c.json({ error: 'lack of information' }, 400)
  }
  const secretHash = generateSecretHash(email)

  try {
    const res = await cognito
      .confirmSignUp({
        ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
        Username: email,
        ConfirmationCode: code,
        SecretHash: secretHash,
      })
      .promise()

    console.log('メール認証成功:', res)
    return c.json({ message: 'メール認証が完了しました' })
  } catch (error) {
    console.error('Cognito 確認コードエラー', error)
    return c.json({ error: '確認コードが無効です' }, 400)
  }
})

// ログイン
authRoutes.post('/signin', async (c) => {
  const { email, password } = await c.req.json()

  if (!email || !password) {
    return c.json({ error: 'lack of information' })
  }
  const clientId = process.env.AWS_COGNITO_CLIENT_ID!
  const secretHash = generateSecretHash(email)
  try {
    const authRes: PromiseResult<InitiateAuthResponse, AWSError> = await cognito
      .initiateAuth({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: secretHash,
        },
      })
      .promise()
      

    if (!authRes.AuthenticationResult) {
      throw new Error('認証結果が取得できませんでした')
    }

    const { IdToken, AccessToken, RefreshToken } = authRes.AuthenticationResult
    c.res.headers.append(
      "Set-Cookie",
      `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=None; Path=/`
    )
    c.res.headers.append(
      "Set-Cookie",
      `idToken=${IdToken}; HttpOnly; Secure; SameSite=None; Path=/`
    )
    c.res.headers.append(
      "Set-Cookie",
      `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=None; Path=/`
    )

    return c.json({
      message: "ログイン成功",
      user: { email },
    })
  } catch (error) {
    console.error('Cognito singin error', error)
    return c.json({ error: 'failed to signin' }, 401)
  }
})

authRoutes.post("/refresh", async (c) => {
  const { refreshToken } = await c.req.json()
  if (!refreshToken) {
    return c.json({ error: "リフレッシュトークンがありません" }, 400)
  }

  try {
    const res = await cognito
      .initiateAuth({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      })
      .promise()

    if (!res.AuthenticationResult) {
      throw new Error("リフレッシュトークンが無効")
    }

    const { IdToken, AccessToken, RefreshToken } = res.AuthenticationResult

    c.res.headers.append(
      "Set-Cookie",
      `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=None; Path=/`
    )
    c.res.headers.append(
      "Set-Cookie",
      `idToken=${IdToken}; HttpOnly; Secure; SameSite=None; Path=/`
    )
    c.res.headers.append(
      "Set-Cookie",
      `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=None; Path=/`
    )

    return c.json({ message: "トークン更新成功" })
  } catch (error) {
    console.error("トークン更新エラー", error)
    return c.json({ error: "トークンの更新に失敗しました" }, 400)
  }
})

// 現在の認証ユーザー情報取得
authRoutes.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "トークンがありません" }, 401)
  }

  const accessToken = authHeader.split(" ")[1]

  try {
    const userRes = await cognito.getUser({ AccessToken: accessToken }).promise()
    return c.json({ user: userRes })
  } catch (error) {
    console.error("ユーザー情報取得エラー", error)
    return c.json({ error: "ユーザー情報を取得できません" }, 400)
  }
})

// ログアウト
authRoutes.post("/signout", async (c) => {
  const cookies = getCookie(c)
  const {accessToken} = cookies

  if (!accessToken) {
    return c.json({ error: "Unauthorized - No token provided" }, 401)
  }

  try {
    await cognito.globalSignOut({ AccessToken: accessToken }).promise()
    c.res.headers.append(
      "Set-Cookie",
      "accessToken=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0"
    )
    c.res.headers.append(
      "Set-Cookie",
      "idToken=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0"
    )
    c.res.headers.append(
      "Set-Cookie",
      "refreshToken=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0"
    )

    return c.json({ message: "ログアウトしました" })
  } catch (error) {
    console.error("ログアウトエラー", error)
    return c.json({ error: "ログアウトに失敗しました" }, 400)
  }
})

// セッション取得
authRoutes.get("/session", async (c) => {
  const cookies = getCookie(c);

  const token = cookies.idToken

  if (!token) {
    return c.json({ error: "Unauthorized - No token provided" }, 401);
  }

  try {
    // JWT をデコード（complete オプションでヘッダーも取得）
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header.kid) {
      throw new Error("Invalid token header");
    }

    // Cognito から公開鍵を取得し、JWT を検証
    const publicKey = await getSigningKey(decoded.header);
    const verifiedToken = jwt.verify(token, publicKey) as { email: string };

    // DB からユーザー情報を取得
    const dbUser = await prisma.user.findUnique({
      where: { email: verifiedToken.email },
    });

    return c.json(dbUser);
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return c.json({ error: "Invalid token" }, 403);
  }
});


export default authRoutes
