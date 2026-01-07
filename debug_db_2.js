import pkg from 'pg';
const { Pool } = pkg;

async function debug() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const client = await pool.connect();
  try {
    const papers = await client.query("SELECT id, exam_board, year, paper_number FROM papers WHERE year = 2019");
    for (const paper of papers.rows) {
      console.log(`Paper: '${paper.exam_board}' (${paper.exam_board.length} chars), Year: ${paper.year}, P: ${paper.paper_number}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

debug();
