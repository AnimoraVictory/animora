import Hono from "hono"
import { verify } from "jsonwebtoken"

export const verifyToken = async (c: Hono.Context, next: () => Promise<void>) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader) {
    return c.json({ error: "No token provided" }, 401)
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
    c.set("authUser", decoded)
    await next()
  } catch (err) {
    return c.json({ error: "Invalid or expired token" }, 403)
  }
}
