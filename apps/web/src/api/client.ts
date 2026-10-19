const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'
const TOKEN_KEY = 'tasks:token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

// Wrapper do fetch: adiciona o token, converte JSON e padroniza erros
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (res.status === 401 && token) {
    tokenStorage.clear()
    window.location.href = '/login'
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.message ?? 'Erro na requisição', res.status)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}
