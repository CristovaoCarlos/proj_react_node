import type { Task } from '../api/types'

interface Props {
  task: Task
  onToggle: () => void
  onDelete: () => void
}

export function TaskItem({ task, onToggle, onDelete }: Props) {
  const done = task.status === 'DONE'
  return (
    <li className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
      <input
        type="checkbox"
        checked={done}
        onChange={onToggle}
        aria-label={`Concluir ${task.title}`}
        className="mt-1 size-4 accent-indigo-600"
      />
      <div className="flex-1">
        <p className={`font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {task.title}
        </p>
        {task.description && <p className="text-sm text-slate-500">{task.description}</p>}
        <p className="mt-1 text-xs text-slate-400">
          {new Date(task.createdAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
      <button onClick={onDelete} className="text-sm text-red-500 hover:text-red-700">
        Excluir
      </button>
    </li>
  )
}
