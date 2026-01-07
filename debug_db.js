import pkg from 'pg';
const { Pool } = pkg;

async function debug() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const client = await pool.connect();
  try {
    console.log("--- Papers for 2019 ---");
    const papers = await client.query("SELECT * FROM papers WHERE year = 2019");
    console.log(papers.rows);
    
    for (const paper of papers.rows) {
      console.log(`--- Questions for Paper ${paper.year} P${paper.paper_number} (ID: ${paper.id}) ---`);
      const questionsCount = await client.query("SELECT COUNT(*) FROM exam_questions WHERE paper_id = $1", [paper.id]);
      console.log(questionsCount.rows[0]);
      
      if (questionsCount.rows[0].count === '0') {
        console.log("Found a paper with 0 questions!");
      }
    }

    console.log("--- All Papers Summary ---");
    const summary = await client.query(`
      SELECT p.year, p.paper_number, COUNT(eq.id) as question_count
      FROM papers p
      LEFT JOIN exam_questions eq ON p.id = eq.paper_id
      GROUP BY p.year, p.paper_number
      ORDER BY p.year DESC, p.paper_number ASC
    `);
    console.table(summary.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

debug();
