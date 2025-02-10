import { Hono } from 'hono'
import { PrismaClient, User } from '@prisma/client'
import { uploadToS3 } from '../services/s3Service'

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

  const { name, type, imageUrl, birthDay } = await c.req.json<{ 
    name: string; 
    type: string; 
    imageUrl: string
    age: string
    birthDay: string
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
      birthDay,
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

// petRoutes.post("/new", async (c) => {
//   const authUser = c.get("dbUser")
//   if (!authUser?.email) {
//     return c.json({ error: "Unauthorized: No email" }, 401)
//   }

//   const dbUser = await prisma.user.findUnique({
//     where: { email: authUser.email },
//   })
//   if (!dbUser) {
//     return c.json({ error: `No local user found for email: ${authUser.email}` }, 404)
//   }

//   const formData = await c.req.formData()
//   const name = formData.get("name") as string
//   const type = formData.get("type") as string
//   const birthDay = formData.get("birthDay") as string
//   const imageFile = formData.get("image") as File

//   if (!name || !type || !birthDay || !imageFile) {
//     return c.json({ error: "Missing required fields" }, 400)
//   }
//   const imageUrl = await uploadToS3(imageFile)

//   const pet = await prisma.pet.create({
//     data: {
//       name,
//       type,
//       birthDay,
//       imageUrl,
//       owner: {
//         connect: { id: dbUser.id },
//       },
//     },
//   })

//   return c.json({
//     message: "Pet successfully registered",
//     pet,
//   })
// })

export default petRoutes
