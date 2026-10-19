import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { tokenStorage } from '../api/client'
import type { TaskStatus } from '../api/types'
import { TaskItem } from '../components/TaskItem'
import { Button, Input } from '../components/ui'
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '../hooks/useTasks'

const schema = z.object({
  title: z.string().trim().min(1, 'Informe um título').max(120),
  description: z.string().trim().max(1000).optional(),
})
type FormData = z.infer<typeof schema>

const filters: { label: string; value?: TaskStatus }[] = [
  { label: 'Todas' },
  { label: 'Pendentes', value: 'PENDING' },
  { label: 'Concluídas', value: 'DONE' },
]

export function TasksPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<TaskStatus | undefined>()
  const tasks = useTasks(filter)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const { register, handleSubmit, reset, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit((data) =>
    createTask.mutate(
      { title: data.title, description: data.description || undefined },
      { onSuccess: () => reset() },
    ),
  )

  function logout() {
    tokenStorage.clear()
    navigate('/login')
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Minhas tarefas</h1>
          <button onClick={logout} className="text-sm text-slate-600 hover:underline">
            Sair
          </button>
        </header>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow">
          <Input label="Título" {...register('title')} error={formState.errors.title?.message} />
          <Input label="Descrição (opcional)" {...register('description')} />
          <Button type="submit" disabled={createTask.isPending} className="self-end">
            Adicionar
          </Button>
        </form>

        <nav className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === f.value ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </nav>

        {tasks.isPending && <p className="text-slate-500">Carregando...</p>}
        {tasks.error && <p className="text-red-600">{tasks.error.message}</p>}
        {tasks.data?.length === 0 && <p className="text-slate-500">Nenhuma tarefa por aqui.</p>}

        <ul className="flex flex-col gap-2">
          {tasks.data?.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() =>
                updateTask.mutate({
                  id: task.id,
                  status: task.status === 'DONE' ? 'PENDING' : 'DONE',
                })
              }
              onDelete={() => deleteTask.mutate(task.id)}
            />
          ))}
        </ul>
      </div>
    </main>
  )
}
