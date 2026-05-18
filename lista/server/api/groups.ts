import { query } from '../utils/db';

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    const groups = await query('SELECT g.*, (SELECT COUNT(*) FROM students s WHERE s.group_id = g.id) as total_students FROM `groups` g ORDER BY g.created_at DESC');
    return groups;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { name, description } = body;
    
    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required',
      });
    }

    const result: any = await query(
      'INSERT INTO `groups` (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    
    return { id: result.insertId, name, description };
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    const { id, name, description } = body;
    
    if (!id || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID and Name are required',
      });
    }

    await query(
      'UPDATE `groups` SET name = ?, description = ? WHERE id = ?',
      [name, description || '', id]
    );
    
    return { success: true, id, name, description };
  }
});
