export type Todo = {
  id: string
  title: string
  description: string
  favorite: boolean
  done: boolean
  createdAt: string
  updatedAt: string
}

const todos: Todo[] = [
  {
    id: '1',
    title: 'Ejemplo de tarea',
    description: 'Esta tarea se guarda en memoria en el backend de Nuxt.',
    favorite: false,
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

function createId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)
}

export function getTodos(): Todo[] {
  return todos
}

export function findTodo(id: string): Todo | undefined {
  return todos.find((todo) => todo.id === id)
}

export function createTodo(payload: { title: string; description?: string }): Todo {
  const now = new Date().toISOString()
  const todo: Todo = {
    id: createId(),
    title: payload.title.trim(),
    description: payload.description?.trim() ?? '',
    favorite: false,
    done: false,
    createdAt: now,
    updatedAt: now
  }
  todos.unshift(todo)
  return todo
}

export function updateTodo(id: string, payload: Partial<Pick<Todo, 'title' | 'description' | 'favorite' | 'done'>>): Todo {
  const todo = findTodo(id)
  if (!todo) {
    throw new Error('Tarea no encontrada')
  }
  if (payload.title !== undefined) {
    todo.title = payload.title.trim()
  }
  if (payload.description !== undefined) {
    todo.description = payload.description.trim()
  }
  if (payload.favorite !== undefined) {
    todo.favorite = payload.favorite
  }
  if (payload.done !== undefined) {
    todo.done = payload.done
  }
  todo.updatedAt = new Date().toISOString()
  return todo
}

export function deleteTodo(id: string): boolean {
  const index = todos.findIndex((todo) => todo.id === id)
  if (index === -1) {
    return false
  }
  todos.splice(index, 1)
  return true
}
