import { query } from '../utils/db';

export default defineEventHandler(async (event) => {
  const method = event.method;
  const queryParams = getQuery(event);

  if (method === 'GET') {
    let sql = `
      SELECT s.*, 
             (SELECT COUNT(*) FROM attendance_records ar 
              WHERE ar.student_id = s.id AND ar.status = 'present') as total_presents,
             (SELECT COUNT(*) FROM attendance_records ar 
              WHERE ar.student_id = s.id AND ar.status = 'absent') as total_absences,
             (SELECT COUNT(*) FROM attendance_records ar 
              WHERE ar.student_id = s.id AND ar.status = 'late') as total_tardiness
      FROM students s
    `;
    const params: any[] = [];
    
    if (queryParams.group_id) {
      sql += ' WHERE s.group_id = ?';
      params.push(queryParams.group_id);
    }
    
    sql += ' ORDER BY s.name ASC';
    const students = await query(sql, params);
    return students;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { group_id, name, student_id_number } = body;
    
    if (!group_id || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Group ID and Name are required',
      });
    }

    const result: any = await query(
      'INSERT INTO students (group_id, name, student_id_number) VALUES (?, ?, ?)',
      [group_id, name, student_id_number || '']
    );
    
    return { id: result.insertId, group_id, name, student_id_number };
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    const { id, group_id, name, student_id_number } = body;
    
    if (!id || !group_id || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID, Group ID and Name are required',
      });
    }

    await query(
      'UPDATE students SET group_id = ?, name = ?, student_id_number = ? WHERE id = ?',
      [group_id, name, student_id_number || '', id]
    );
    
    return { success: true, id, name, student_id_number };
  }
});
