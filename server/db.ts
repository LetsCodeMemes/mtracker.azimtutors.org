import { Pool } from "pg";
import {
  edexcelALevelMaths2024,
  edexcelALevelMaths2023,
  edexcelALevelMaths2018,
} from "./data/exam-mappings";
import {
  edexcelALevelMaths2018_P2,
  edexcelALevelMaths2019,
  edexcelALevelMaths2020,
  edexcelALevelMaths2021,
  edexcelALevelMaths2022,
  edexcelALevelMaths2023_Full,
} from "./data/exam-mappings-full";
import { topicToChapter } from "./data/chapters";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Seed papers and questions data from exam mappings
async function seedPapersData(client: any) {
  try {
    // Get unique papers from exam mappings
    const allQuestions = [
      ...edexcelALevelMaths2024,
      ...edexcelALevelMaths2023,
      ...edexcelALevelMaths2023_Full,
      ...edexcelALevelMaths2022,
      ...edexcelALevelMaths2021,
      ...edexcelALevelMaths2020,
      ...edexcelALevelMaths2019,
      ...edexcelALevelMaths2018,
      ...edexcelALevelMaths2018_P2,
    ];

    // Collect unique papers
    const uniquePapers = new Map<
      string,
      { examBoard: string; year: number; paperNumber: number }
    >();
    const uniqueQuestions = new Map<string, any>();

    for (const q of allQuestions) {
      const paperKey = `${q.examBoard}-${q.year}-${q.paperNumber}`;
      if (!uniquePapers.has(paperKey)) {
        uniquePapers.set(paperKey, {
          examBoard: q.examBoard,
          year: q.year,
          paperNumber: q.paperNumber,
        });
      }
      uniqueQuestions.set(q.id, q);
    }

    // Insert papers
    for (const [_key, paper] of uniquePapers) {
      await client.query(
        `INSERT INTO papers (exam_board, year, paper_number, total_marks)
         VALUES ($1, $2, $3, 100)
         ON CONFLICT DO NOTHING`,
        [paper.examBoard, paper.year, paper.paperNumber]
      );
    }

    // Get all paper IDs for mapping
    const paperResult = await client.query(`
      SELECT id, exam_board, year, paper_number FROM papers
    `);
    const paperMap = new Map<string, number>();
    for (const row of paperResult.rows) {
      const key = `${row.exam_board}-${row.year}-${row.paper_number}`;
      paperMap.set(key, row.id);
    }

    // Insert questions
    for (const [_id, question] of uniqueQuestions) {
      const paperKey = `${question.examBoard}-${question.year}-${question.paperNumber}`;
      const paperId = paperMap.get(paperKey);

      if (paperId) {
        const chapterId = question.chapterId || topicToChapter[question.topic] || null;
        await client.query(
          `INSERT INTO exam_questions (paper_id, question_number, topic, sub_topic, chapter_id, marks_available)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [
            paperId,
            question.questionNumber,
            question.topic,
            question.subTopic || null,
            chapterId,
            question.marksAvailable,
          ]
        );
      }
    }

    console.log("✅ Papers and questions seeded successfully");
  } catch (error) {
    console.error("Error seeding papers data:", error);
  }
}

// Initialize database schema
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE,
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
        chapter_id VARCHAR(50),
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

    // Mistake logging table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mistake_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES exam_questions(id) ON DELETE CASCADE,
        user_paper_id INTEGER REFERENCES user_papers(id) ON DELETE CASCADE,
        topic VARCHAR(100) NOT NULL,
        mistake_type VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User streaks tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_submission_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User badges
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_id VARCHAR(50) NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        badge_description TEXT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_id)
      )
    `);

    // User plan/subscription
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        plan_type VARCHAR(50) DEFAULT 'free',
        max_papers INTEGER DEFAULT 3,
        papers_submitted INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Gamification points
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_points (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        total_points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Email notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notification preferences
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        streak_reminders BOOLEAN DEFAULT true,
        weekly_summaries BOOLEAN DEFAULT true,
        badge_celebrations BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Completed topics tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS completed_topics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        topic_id VARCHAR(100) NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, topic_id)
      )
    `);

    console.log("✅ Database schema initialized successfully");

    // Seed papers and questions data
    await seedPapersData(client);
  } finally {
    client.release();
  }
}

export { pool };
