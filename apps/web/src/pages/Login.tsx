import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { api, tokenStorage } from '../api/client'
import type { AuthResponse } from '../api/types'
import { AuthLayout } from '../components/AuthLayout'
import { Button, Input } from '../components/ui'

const schema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<FormData>({ resolver: zodResolver(schema) })

  const login = useMutation({
    mutationFn: (data: FormData) =>
      api<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: ({ token }) => {
      tokenStorage.set(token)
      navigate('/tasks')
    },
  })

  return (
    <AuthLayout title="Entrar">
      <form onSubmit={handleSubmit((data) => login.mutate(data))} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          {...register('email')}
          error={formState.errors.email?.message}
        />
        <Input
          label="Senha"
          type="password"
          {...register('password')}
          error={formState.errors.password?.message}
        />
        {login.error && <p className="text-sm text-red-600">{login.error.message}</p>}
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Não tem conta?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
