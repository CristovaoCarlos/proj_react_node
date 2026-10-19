# Minhas Tarefas — projeto de estudos React + Node

Gerenciador de tarefas full‑stack com cadastro/login (JWT) e CRUD de tarefas.

## Stack

| Camada              | Ferramentas                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Monorepo            | npm workspaces (`apps/api`, `apps/web`), concurrently                                      |
| Linguagem/qualidade | TypeScript 6.0, ESLint 10 (flat config) + typescript-eslint, Prettier                      |
| Backend             | Node.js 22, Fastify 5, Zod 4, Prisma 7 (adapter `pg`), PostgreSQL 17, @fastify/jwt, argon2 |
| Frontend            | Vite 8, React 19, React Router 8, TanStack Query 5, React Hook Form + Zod, Tailwind CSS 4  |
| Testes              | Vitest 5, `app.inject` (Fastify), Testing Library + jsdom                                  |
| Infra               | Docker Compose (Postgres)                                                                  |

> TypeScript ficou fixado em `~6.0` porque o typescript-eslint ainda não suporta o TypeScript 7.

## Pré‑requisitos

- Node.js 22+ (`nvm use` lê o `.nvmrc`)
- Docker Desktop com a **integração WSL** ativada (Settings → Resources → WSL Integration)

## Como rodar

```bash
npm install                      # instala tudo (api + web) e gera o Prisma Client
cp apps/api/.env.example apps/api/.env   # se ainda não existir
npm run db:up                    # sobe o PostgreSQL no Docker
npm run db:migrate               # cria as tabelas (pede um nome para a migration, ex.: init)
npm run dev                      # API em :3333 e web em :5173
```

Abra http://localhost:5173, crie uma conta e comece a adicionar tarefas.

## Scripts úteis (raiz)

| Script                            | O que faz                                          |
| --------------------------------- | -------------------------------------------------- |
| `npm run dev`                     | API + web juntos, com recarregamento automático    |
| `npm test`                        | Testes da API e do web                             |
| `npm run lint` / `npm run format` | ESLint / Prettier                                  |
| `npm run build`                   | Build de produção dos dois apps                    |
| `npm run db:studio`               | Abre o Prisma Studio para ver o banco no navegador |
| `npm run db:down`                 | Para o container do Postgres                       |

## Estrutura

```
apps/
├─ api/
│  ├─ prisma/schema.prisma   # modelos User e Task
│  ├─ prisma.config.ts       # config do Prisma 7 (URL do banco, migrations)
│  ├─ src/app.ts             # cria o Fastify: plugins, erros, rotas
│  ├─ src/server.ts          # sobe o servidor
│  ├─ src/routes/            # auth.ts e tasks.ts
│  ├─ src/lib/               # prisma client e schemas Zod
│  └─ tests/                 # testes com Prisma "mockado" (não precisam de banco)
└─ web/
   ├─ src/main.tsx           # providers (TanStack Query, Router)
   ├─ src/router.tsx         # rotas e rota protegida
   ├─ src/api/client.ts      # fetch com token JWT
   ├─ src/hooks/useTasks.ts  # queries e mutations
   ├─ src/pages/             # Login, Register, Tasks
   └─ src/components/        # componentes de UI
```

## API

| Método | Rota                          | Auth   | Descrição                                       |
| ------ | ----------------------------- | ------ | ----------------------------------------------- |
| GET    | `/health`                     | —      | Verifica se a API está no ar                    |
| POST   | `/auth/register`              | —      | `{ name, email, password }` → `{ token, user }` |
| POST   | `/auth/login`                 | —      | `{ email, password }` → `{ token, user }`       |
| GET    | `/tasks?status=PENDING\|DONE` | Bearer | Lista as tarefas do usuário                     |
| POST   | `/tasks`                      | Bearer | `{ title, description? }`                       |
| PATCH  | `/tasks/:id`                  | Bearer | `{ title?, description?, status? }`             |
| DELETE | `/tasks/:id`                  | Bearer | Remove a tarefa                                 |

## Ideias para continuar estudando

- Paginação e busca por texto nas tarefas
- Editar título/descrição inline
- Testes de integração com um banco real (Testcontainers)
- Refresh token em cookie httpOnly
- Documentação OpenAPI com `@fastify/swagger`
- Deploy (ex.: Render/Railway para a API, Vercel para o web)
