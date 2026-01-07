const { Pool } = require('pg');

async function debug() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const client = await pool.connect();
  try {
    console.log("--- Papers ---");
    const papers = await client.query("SELECT * FROM papers WHERE year = 2019");
    console.log(papers.rows);
    
    if (papers.rows.length > 0) {
      const paperId = papers.rows[0].id;
      console.log(`--- Questions for Paper ID ${paperId} ---`);
      const questions = await client.query("SELECT COUNT(*) FROM exam_questions WHERE paper_id = $1", [paperId]);
      console.log(questions.rows);
    } else {
      console.log("No paper found for 2019");
    }

    console.log("--- All Papers in DB ---");
    const allPapers = await client.query("SELECT id, exam_board, year, paper_number FROM papers");
    console.log(allPapers.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

debug();
