import { query, useDb } from '../utils/db';

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === 'GET') {
    const { group_id, date, list_sessions } = getQuery(event);
    
    if (!group_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Group ID is required',
      });
    }

    if (list_sessions) {
      const sessions = await query(
        'SELECT id, date FROM attendance_sessions WHERE group_id = ? ORDER BY date DESC',
        [group_id]
      );
      return sessions;
    }

    if (!date) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Date is required for record retrieval',
      });
    }

    // Find session
    const sessions: any = await query(
      'SELECT id FROM attendance_sessions WHERE group_id = ? AND date = ?',
      [group_id, date]
    );

    if (sessions.length === 0) {
      return { session: null, records: [] };
    }

    const sessionId = sessions[0].id;
    const records = await query(
      'SELECT * FROM attendance_records WHERE session_id = ?',
      [sessionId]
    );

    return { session: sessions[0], records };
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { group_id, date, records } = body; // records: [{student_id, status}]

    if (!group_id || !date || !records) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Group ID, Date and Records are required',
      });
    }

    const db = useDb();
    
    // Better-sqlite3 transactions are handled with a function
    const transaction = db.transaction((data: any) => {
      const { group_id, date, records } = data;
      
      // Check if session exists
      const existingSession = db.prepare(
        'SELECT id FROM attendance_sessions WHERE group_id = ? AND date = ?'
      ).get(group_id, date);

      let sessionId;
      if (existingSession) {
        sessionId = existingSession.id;
        db.prepare('DELETE FROM attendance_records WHERE session_id = ?').run(sessionId);
      } else {
        const result = db.prepare(
          'INSERT INTO attendance_sessions (group_id, date) VALUES (?, ?)'
        ).run(group_id, date);
        sessionId = result.lastInsertRowid;
      }

      // Insert records
      const insertRecord = db.prepare(
        'INSERT INTO attendance_records (session_id, student_id, status) VALUES (?, ?, ?)'
      );
      
      for (const record of records) {
        insertRecord.run(sessionId, record.student_id, record.status);
      }
      
      return sessionId;
    });

    try {
      const sessionId = transaction({ group_id, date, records });
      return { success: true, sessionId };
    } catch (error) {
      console.error('Attendance Save Error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Error saving attendance',
      });
    }
  }
});
