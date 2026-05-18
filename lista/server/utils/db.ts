import Database from 'better-sqlite3';
import { join } from 'path';

let db: any = null;

export const useDb = () => {
  if (!db) {
    const dbPath = join(process.cwd(), 'database.sqlite');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize schema
    initSchema(db);
  }
  return db;
};

const initSchema = (db: any) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      student_id_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, date),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('present', 'absent', 'late')) DEFAULT 'present',
      FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);
};

// Simple helper to execute queries
export const query = async (sql: string, params: any[] = []) => {
  const database = useDb();
  
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    return database.prepare(sql).all(...params);
  } else {
    const result = database.prepare(sql).run(...params);
    return {
      insertId: result.lastInsertRowid,
      affectedRows: result.changes
    };
  }
};
