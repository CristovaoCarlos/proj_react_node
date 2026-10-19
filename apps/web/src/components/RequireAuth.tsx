import { Navigate, Outlet } from 'react-router'
import { tokenStorage } from '../api/client'

// Rota protegida: sem token, redireciona para o login
export function RequireAuth() {
  return tokenStorage.get() ? <Outlet /> : <Navigate to="/login" replace />
}
