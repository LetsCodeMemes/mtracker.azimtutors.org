import pkg from 'pg';
const { Pool } = pkg;

async function debug() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const client = await pool.connect();
  try {
    console.log("--- Users with public leaderboard preference ---");
    const users = await client.query("SELECT id, username, is_leaderboard_public FROM users");
    console.table(users.rows);
    
    console.log("--- User Points ---");
    const points = await client.query("SELECT * FROM user_points");
    console.table(points.rows);

    console.log("--- Leaderboard Join Result ---");
    const leaderboard = await client.query(
      `SELECT u.username, u.first_name, u.last_name, p.total_points, p.level
       FROM users u
       JOIN user_points p ON u.id = p.user_id
       WHERE u.is_leaderboard_public = true
       ORDER BY p.total_points DESC
       LIMIT 50`
    );
    console.table(leaderboard.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

debug();
