import { Hono } from 'hono'
import { PrismaClient, User } from '@prisma/client'
import { AuthUser } from '../types/auth'
import { Json } from 'aws-jwt-verify/safe-json-parse'

const prisma = new PrismaClient()
const petRoutes = new Hono<{
  Variables: {
    dbUser: User
  }
}>()

petRoutes.post('/', async (c) => {
  const authUser = c.get('dbUser')
  if (!authUser?.email) {
    return c.json({ error: 'Unauthorized: No email' }, 401)
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email },
  })
  if (!dbUser) {
    return c.json({ error: `No local user found for email: ${authUser.email}` }, 404)
  }

  const { name, type, imageUrl, age } = await c.req.json<{ 
    name: string; 
    type: string; 
    imageUrl: string
    age: string
 }>()
 
  const existingUser = await prisma.user.findUnique({
    where: { id: dbUser.id },
  })
  if (!existingUser) {
    return c.json(
      {
        error: `user not found (ID: ${dbUser.id})`,
        userId: dbUser.id,
      },
      404,
    )
  }

  const pet = await prisma.pet.create({
    data: {
      name,
      type,
      imageUrl,
      age,
      owner: {
        connect: { id: dbUser.id },
      },
    },
  })

  return c.json({
    message: 'pet is successfully registered',
    pet,
  })
})

petRoutes.get('/owner/:ownerId', async (c) => {
  const ownerId = c.req.param('ownerId')
  const pets = await prisma.pet.findMany({
    where: { ownerId },
  })

  return c.json({ pets })
})
export default petRoutes
