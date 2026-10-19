import { defineConfig, env } from 'prisma/config'

// O Prisma 7 não carrega o .env sozinho
try {
  process.loadEnvFile()
} catch {
  // sem .env: usa as variáveis do ambiente
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
})
