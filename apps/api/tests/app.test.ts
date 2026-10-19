import { beforeEach, describe, expect, it, vi } from 'vitest'

// Substitui o Prisma por um "mock": os testes rodam sem banco de dados
vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    task: { findMany: vi.fn(), create: vi.fn() },
  },
}))

const { prisma } = await import('../src/lib/prisma.js')
const { buildApp } = await import('../src/app.js')

const db = vi.mocked(prisma, true)

describe('API', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('GET /health responde ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok' })
  })

  it('POST /auth/register valida o corpo', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { name: 'A', email: 'invalido', password: '1' },
    })
    expect(res.statusCode).toBe(400)
    expect(res.json().issues).toHaveLength(3)
  })

  it('POST /auth/register cria usuário e devolve token', async () => {
    db.user.findUnique.mockResolvedValue(null)
    db.user.create.mockImplementation(async ({ data }) => ({
      id: 'u1',
      createdAt: new Date(),
      ...data,
    }))

    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { name: 'Ana', email: 'ana@example.com', password: '123456' },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json().token).toEqual(expect.any(String))
    // a senha nunca é salva em texto puro
    expect(db.user.create.mock.calls[0][0].data.passwordHash).not.toBe('123456')
  })

  it('CORS libera PATCH e DELETE para o front', async () => {
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/tasks/1',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'DELETE',
      },
    })
    expect(res.headers['access-control-allow-methods']).toContain('DELETE')
    expect(res.headers['access-control-allow-methods']).toContain('PATCH')
  })

  it('GET /tasks exige autenticação', async () => {
    const res = await app.inject({ method: 'GET', url: '/tasks' })
    expect(res.statusCode).toBe(401)
  })

  it('GET /tasks lista apenas as tarefas do usuário do token', async () => {
    db.task.findMany.mockResolvedValue([])
    await app.ready()
    const token = app.jwt.sign({ sub: 'u1' })

    const res = await app.inject({
      method: 'GET',
      url: '/tasks?status=DONE',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(res.statusCode).toBe(200)
    expect(db.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1', status: 'DONE' } }),
    )
  })
})
