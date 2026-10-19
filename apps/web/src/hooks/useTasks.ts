import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Task, TaskStatus } from '../api/types'

const tasksKey = ['tasks'] as const

export function useTasks(status?: TaskStatus) {
  return useQuery({
    queryKey: [...tasksKey, status ?? 'ALL'],
    queryFn: () => api<Task[]>(`/tasks${status ? `?status=${status}` : ''}`),
  })
}

// Após qualquer alteração, invalida o cache para recarregar a lista
function useTaskMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
  })
}

export const useCreateTask = () =>
  useTaskMutation((data: { title: string; description?: string }) =>
    api<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  )

export const useUpdateTask = () =>
  useTaskMutation(({ id, ...data }: { id: string; status?: TaskStatus; title?: string }) =>
    api<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  )

export const useDeleteTask = () =>
  useTaskMutation((id: string) => api<void>(`/tasks/${id}`, { method: 'DELETE' }))
