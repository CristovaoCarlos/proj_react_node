import { createBrowserRouter, Navigate } from 'react-router'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { TasksPage } from './pages/Tasks'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <RequireAuth />,
    children: [{ path: '/tasks', element: <TasksPage /> }],
  },
  { path: '*', element: <Navigate to="/tasks" replace /> },
])
