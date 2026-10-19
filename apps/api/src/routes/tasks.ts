import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'
import {
  createTaskSchema,
  idParamSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from '../lib/schemas.js'

export async function taskRoutes(app: FastifyInstance) {
  // Todas as rotas deste plugin exigem um token JWT válido
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ message: 'Não autenticado' })
    }
  })

  app.get('/', async (request) => {
    const { status } = listTasksQuerySchema.parse(request.query)
    return prisma.task.findMany({
      where: { userId: request.user.sub, status },
      orderBy: { createdAt: 'desc' },
    })
  })

  app.post('/', async (request, reply) => {
    const data = createTaskSchema.parse(request.body)
    const task = await prisma.task.create({ data: { ...data, userId: request.user.sub } })
    return reply.status(201).send(task)
  })

  app.patch('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params)
    const data = updateTaskSchema.parse(request.body)

    const { count } = await prisma.task.updateMany({
      where: { id, userId: request.user.sub },
      data,
    })
    if (count === 0) return reply.status(404).send({ message: 'Tarefa não encontrada' })

    return prisma.task.findUnique({ where: { id } })
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params)
    const { count } = await prisma.task.deleteMany({ where: { id, userId: request.user.sub } })
    if (count === 0) return reply.status(404).send({ message: 'Tarefa não encontrada' })
    return reply.status(204).send()
  })
}
