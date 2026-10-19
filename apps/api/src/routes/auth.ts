import argon2 from 'argon2'
import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { loginSchema, registerSchema } from '../lib/schemas.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const { name, email, password } = registerSchema.parse(request.body)

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return reply.status(409).send({ message: 'E-mail já cadastrado' })

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await argon2.hash(password) },
    })

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' })
    return reply.status(201).send({ token, user: { id: user.id, name, email } })
  })

  app.post('/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      return reply.status(401).send({ message: 'E-mail ou senha incorretos' })
    }

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' })
    return { token, user: { id: user.id, name: user.name, email: user.email } }
  })
}
