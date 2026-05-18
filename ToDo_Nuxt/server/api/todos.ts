import { createError, readBody, setResponseStatus } from 'h3'
import { createTodo, getTodos } from '../utils/todo-store'

export default defineEventHandler(async (event) => {
  const method = event.req.method?.toUpperCase()

  if (method === 'GET') {
    return getTodos()
  }

  if (method === 'POST') {
    const body = await readBody(event)
    if (!body || typeof body.title !== 'string' || !body.title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'El título es obligatorio' })
    }
    const todo = createTodo({ title: body.title, description: body.description })
    setResponseStatus(event, 201)
    return todo
  }

  throw createError({ statusCode: 405, statusMessage: 'Método no permitido' })
})
