import Hono from "hono"
import { verify } from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const verifyToken = async (c: Hono.Context, next: () => Promise<void>) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader) {
    return c.json({ error: "No token provided" }, 401)
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { email: string }
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    })

    if (!user) {
      return c.json({ error: "User not found" }, 404)
    }
    c.set("user", user)
    await next()
  } catch (err) {
    return c.json({ error: "Invalid or expired token" }, 403)
  }
}
