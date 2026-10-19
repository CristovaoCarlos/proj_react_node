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
  name: z.string().trim().min(2, 'Nome muito curto'),
  email: z.email('E-mail inválido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<FormData>({ resolver: zodResolver(schema) })

  const signUp = useMutation({
    mutationFn: (data: FormData) =>
      api<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: ({ token }) => {
      tokenStorage.set(token)
      navigate('/tasks')
    },
  })

  return (
    <AuthLayout title="Criar conta">
      <form onSubmit={handleSubmit((data) => signUp.mutate(data))} className="flex flex-col gap-4">
        <Input label="Nome" {...register('name')} error={formState.errors.name?.message} />
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
        {signUp.error && <p className="text-sm text-red-600">{signUp.error.message}</p>}
        <Button type="submit" disabled={signUp.isPending}>
          {signUp.isPending ? 'Criando...' : 'Criar conta'}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Já tem conta?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
