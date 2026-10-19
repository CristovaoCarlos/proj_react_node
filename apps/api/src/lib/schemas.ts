import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto'),
  email: z.email('E-mail inválido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
})

export const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

export const taskStatusSchema = z.enum(['PENDING', 'DONE'])

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título').max(120),
  description: z.string().trim().max(1000).optional(),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusSchema.optional(),
})

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
})

export const idParamSchema = z.object({ id: z.uuid() })
