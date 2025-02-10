import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import userRoutes from './routes/userRoutes'
import petRoutes from './routes/petRoutes'
import { cors } from 'hono/cors'
import postRoutes from './routes/postRoutes'
import authRoutes from './routes/authRoutes'

const app = new Hono()

app.get('/', (c) => c.text('Animalia API is running!'))

app.use(
  '*',
  cors({
    origin: "http://localhost:5173",
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
    credentials: true
  }),
)
app.route('/users', userRoutes)
app.route('/auth', authRoutes)

app.route('/pets', petRoutes)
app.route('/posts', postRoutes)

const PORT = process.env.PORT || 3000
console.log(`Server is running on http://localhost:${PORT}`)
serve({
  fetch: app.fetch,
  port: Number(PORT),
})
