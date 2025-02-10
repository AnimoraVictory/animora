import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'

const prisma = new PrismaClient()
const postRoutes = new Hono()

postRoutes.get('/', async (c) => {
  const posts = await prisma.post.findMany()
  return c.json({ posts })
})

postRoutes.post('/', async (c) => {
  const { title, content, authorId, imageUrls } = await c.req.json()

  if (!title || !content || !authorId) {
    return c.json({ error: '情報が不足しています' }, 400)
  }

  const post = await prisma.post.create({
    data: {
      title,
      imageUrls,
      content,
      author: { connect: { id: authorId } },
    },
  })

  return c.json({ message: '投稿が作成されました', post })
})

export default postRoutes
