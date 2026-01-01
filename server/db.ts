import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database schema
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        subject VARCHAR(100) DEFAULT 'A Level Edexcel Maths',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Papers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS papers (
        id SERIAL PRIMARY KEY,
        exam_board VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        paper_number INTEGER NOT NULL,
        total_marks INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(exam_board, year, paper_number)
      )
    `);

    // Exam questions table (Question -> Topic mapping)
    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_questions (
        id SERIAL PRIMARY KEY,
        paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
        question_number INTEGER NOT NULL,
        topic VARCHAR(100) NOT NULL,
        sub_topic VARCHAR(100),
        marks_available INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(paper_id, question_number)
      )
    `);

    // User papers (submission tracking)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_papers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
        marks_obtained INTEGER DEFAULT 0,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, paper_id)
      )
    `);

    // Question responses (individual question marks)
    await client.query(`
      CREATE TABLE IF NOT EXISTS question_responses (
        id SERIAL PRIMARY KEY,
        user_paper_id INTEGER REFERENCES user_papers(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES exam_questions(id) ON DELETE CASCADE,
        marks_obtained INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Topic performance tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS topic_performance (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        topic VARCHAR(100) NOT NULL,
        total_questions INTEGER DEFAULT 0,
        correct_questions INTEGER DEFAULT 0,
        total_marks INTEGER DEFAULT 0,
        marks_obtained INTEGER DEFAULT 0,
        accuracy_percent DECIMAL(5, 2) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, topic)
      )
    `);

    console.log("✅ Database schema initialized successfully");
  } finally {
    client.release();
  }
}

export { pool };
