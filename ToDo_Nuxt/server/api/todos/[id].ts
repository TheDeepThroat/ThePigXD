import { createError, readBody, setResponseStatus } from 'h3'
import { deleteTodo, findTodo, updateTodo } from '../../utils/todo-store'

export default defineEventHandler(async (event) => {
  const method = event.req.method?.toUpperCase()
  const id = event.context.params?.id as string

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de tarea faltante' })
  }

  const todo = findTodo(id)
  if (!todo) {
    throw createError({ statusCode: 404, statusMessage: 'Tarea no encontrada' })
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const updated = updateTodo(id, {
      title: typeof body.title === 'string' ? body.title : undefined,
      description: typeof body.description === 'string' ? body.description : undefined,
      favorite: typeof body.favorite === 'boolean' ? body.favorite : undefined,
      done: typeof body.done === 'boolean' ? body.done : undefined
    })
    return updated
  }

  if (method === 'DELETE') {
    const removed = deleteTodo(id)
    if (!removed) {
      throw createError({ statusCode: 404, statusMessage: 'Tarea no encontrada' })
    }
    setResponseStatus(event, 204)
    return { success: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' })
})
