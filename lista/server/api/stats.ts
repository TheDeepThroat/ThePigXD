import { query } from '../utils/db';

export default defineEventHandler(async (event) => {
  // Total groups
  const groupsCount: any = await query('SELECT COUNT(*) as count FROM "groups"');
  
  // Total students
  const studentsCount: any = await query('SELECT COUNT(*) as count FROM students');

  // Attendance stats per group
  // (Total presents / Total possible attendances) * 100
  const groupStats: any = await query(`
    SELECT 
      g.id, 
      g.name,
      COUNT(DISTINCT s.id) as total_students,
      (
        SELECT COUNT(*) 
        FROM attendance_records ar
        JOIN attendance_sessions asess ON ar.session_id = asess.id
        WHERE asess.group_id = g.id AND ar.status = 'present'
      ) as presents,
      (
        SELECT COUNT(*) 
        FROM attendance_records ar
        JOIN attendance_sessions asess ON ar.session_id = asess.id
        WHERE asess.group_id = g.id
      ) as total_records
    FROM "groups" g
    LEFT JOIN students s ON s.group_id = g.id
    GROUP BY g.id
  `);

  const processedGroupStats = groupStats.map((stat: any) => ({
    ...stat,
    percentage: stat.total_records > 0 ? Math.round((stat.presents / stat.total_records) * 100) : 0
  }));

  return {
    totals: {
      groups: groupsCount[0]?.count || 0,
      students: studentsCount[0]?.count || 0,
      avgPercentage: processedGroupStats.length > 0 
        ? Math.round(processedGroupStats.reduce((acc: number, curr: any) => acc + curr.percentage, 0) / processedGroupStats.length)
        : 0
    },
    groupStats: processedGroupStats
  };
});
