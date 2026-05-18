import { query } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (event.method === 'DELETE') {
    await query('DELETE FROM `groups` WHERE id = ?', [id]);
    return { success: true };
  }
});
