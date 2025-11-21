export const logDbSessionInfo = async (db: { query: (sql: string) => Promise<any> }) => {
  const res = await db.query(`
      select
        current_user,
        session_user,
        current_setting('role', true) as role,
        current_setting('myapp.user_id', true) as user_id
    `);
  console.log('[db session info]', res.rows[0]);
};
  