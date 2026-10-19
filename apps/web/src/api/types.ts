export type TaskStatus = 'PENDING' | 'DONE'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: { id: string; name: string; email: string }
}
