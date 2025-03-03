import { Hono } from 'hono'
import { PrismaClient, User } from '@prisma/client'
import { uploadToS3 } from '../services/s3Service'
import { PassThrough } from 'stream'

const prisma = new PrismaClient()
const petRoutes = new Hono<{
  Variables: {
    dbUser: User
  }
}>()

petRoutes.get('/owner/:ownerId', async (c) => {
  const ownerId = c.req.param('ownerId')
  const pets = await prisma.pet.findMany({
    where: { ownerId },
  })

  return c.json({ pets })
})

petRoutes.post('/new', async (c) => {
  const formData = await c.req.formData()
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const birthDay = formData.get('birthDay') as string
  const imageFile = formData.get('image') as File
  const userId = formData.get('userId') as string

  if (!name || !type || !birthDay || !imageFile) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  const imageUrl = await uploadToS3(imageFile)

  const pet = await prisma.pet.create({
    data: {
      name,
      type,
      birthDay,
      imageUrl,
      owner: {
        connect: { id: userId },
      },
    },
  })

  return c.json({
    message: 'Pet successfully registered',
    pet,
  })
})

export default petRoutes
