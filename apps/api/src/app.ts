import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import Fastify from 'fastify'
import { ZodError } from 'zod'
import { authRoutes } from './routes/auth.js'
import { taskRoutes } from './routes/tasks.js'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string }
    user: { sub: string }
  }
}

export function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' })

  // Desde a v10 o @fastify/cors libera só GET/HEAD/POST por padrão
  app.register(cors, {
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
  app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret' })

  // Erros de validação do Zod viram 400 com a lista de problemas
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ message: 'Dados inválidos', issues: error.issues })
    }
    app.log.error(error)
    return reply.status(500).send({ message: 'Erro interno' })
  })

  app.get('/health', async () => ({ status: 'ok' }))
  app.register(authRoutes, { prefix: '/auth' })
  app.register(taskRoutes, { prefix: '/tasks' })

  return app
}
