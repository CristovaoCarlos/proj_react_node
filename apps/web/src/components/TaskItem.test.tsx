import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '../api/types'
import { TaskItem } from './TaskItem'

const task: Task = {
  id: '1',
  title: 'Estudar React',
  description: 'Hooks e TanStack Query',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
}

describe('TaskItem', () => {
  it('mostra título e descrição', () => {
    render(<TaskItem task={task} onToggle={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('Estudar React')).toBeInTheDocument()
    expect(screen.getByText('Hooks e TanStack Query')).toBeInTheDocument()
  })

  it('chama onToggle e onDelete', async () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    render(<TaskItem task={task} onToggle={onToggle} onDelete={onDelete} />)

    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(onToggle).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
