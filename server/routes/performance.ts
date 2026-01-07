import { Router, Response } from "express";
import { pool } from "../db";
import { authMiddleware, AuthRequest } from "../middleware";

const router = Router();

// Protect all performance routes with auth middleware
router.use(authMiddleware);

/**
 * Get user's overall performance statistics
 */
router.get("/stats", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    // Overall score (average across all papers)
    const scoreResult = await pool.query(
      `SELECT
        AVG(CAST(up.marks_obtained AS FLOAT) / p.total_marks) * 100 as avg_score,
        COUNT(*) as paper_count
      FROM user_papers up
      JOIN papers p ON up.paper_id = p.id
      WHERE up.user_id = $1`,
      [userId]
    );

    const overallScore =
      scoreResult.rows[0]?.avg_score || 0;
    const paperCount = scoreResult.rows[0]?.paper_count || 0;

    // Topic performance
    const topicsResult = await pool.query(
      `SELECT
        eq.topic,
        COUNT(DISTINCT eq.id) as total_questions,
        COALESCE(SUM(qr.marks_obtained), 0) as marks_obtained,
        COALESCE(SUM(eq.marks_available), 0) as marks_available,
        ROUND((COALESCE(SUM(qr.marks_obtained), 0)::FLOAT / NULLIF(SUM(eq.marks_available), 0) * 100)::NUMERIC, 1) as accuracy
      FROM exam_questions eq
      LEFT JOIN question_responses qr ON eq.id = qr.question_id
      LEFT JOIN user_papers up ON qr.user_paper_id = up.id AND up.user_id = $1
      GROUP BY eq.topic
      ORDER BY accuracy DESC`,
      [userId]
    );

    // Question type weakness analysis (by sub_topic)
    const weaknessResult = await pool.query(
      `SELECT
        eq.sub_topic as question_type,
        COUNT(DISTINCT eq.id) as total_questions,
        COALESCE(SUM(eq.marks_available), 0) as total_marks,
        COALESCE(SUM(eq.marks_available - qr.marks_obtained), 0) as marks_lost,
        ROUND((COALESCE(SUM(qr.marks_obtained), 0)::FLOAT / NULLIF(SUM(eq.marks_available), 0) * 100)::NUMERIC, 1) as accuracy
      FROM exam_questions eq
      LEFT JOIN question_responses qr ON eq.id = qr.question_id
      LEFT JOIN user_papers up ON qr.user_paper_id = up.id AND up.user_id = $1
      WHERE eq.sub_topic IS NOT NULL
      GROUP BY eq.sub_topic
      ORDER BY marks_lost DESC`,
      [userId]
    );

    res.json({
      overallScore: Math.round(overallScore),
      paperCount,
      topics: topicsResult.rows,
      questionTypeWeakness: weaknessResult.rows,
    });
  } catch (error) {
    console.error("Performance stats error:", error);
    res.status(500).json({ error: "Failed to fetch performance stats" });
  }
});

/**
 * Get detailed report data including paper and question breakdown
 */
router.get("/detailed-report", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    // Get papers with their questions and scores
    const papersResult = await pool.query(
      `SELECT
        up.id as submission_id,
        p.id as paper_id,
        p.exam_board,
        p.year,
        p.paper_number,
        up.marks_obtained as total_obtained,
        up.submission_date,
        (SELECT SUM(marks_available) FROM exam_questions WHERE paper_id = p.id) as total_available
      FROM user_papers up
      JOIN papers p ON up.paper_id = p.id
      WHERE up.user_id = $1
      ORDER BY up.submission_date DESC`,
      [userId]
    );

    const papers = [];
    for (const paper of papersResult.rows) {
      const questionsResult = await pool.query(
        `SELECT
          eq.question_number,
          eq.topic,
          eq.sub_topic,
          eq.marks_available,
          COALESCE(qr.marks_obtained, 0) as marks_obtained
        FROM exam_questions eq
        LEFT JOIN question_responses qr ON eq.id = qr.question_id AND qr.user_paper_id = $1
        WHERE eq.paper_id = $2
        ORDER BY eq.question_number ASC`,
        [paper.submission_id, paper.paper_id]
      );

      papers.push({
        ...paper,
        questions: questionsResult.rows
      });
    }

    res.json({
      papers
    });
  } catch (error) {
    console.error("Detailed report error:", error);
    res.status(500).json({ error: "Failed to fetch detailed report" });
  }
});

/**
 * Get user's papers with detailed scores
 */
router.get("/papers", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT
        up.id,
        p.exam_board,
        p.year,
        p.paper_number,
        up.marks_obtained,
        p.total_marks,
        up.submission_date,
        ROUND((CAST(up.marks_obtained AS FLOAT) / p.total_marks * 100)::NUMERIC, 1) as percentage
      FROM user_papers up
      JOIN papers p ON up.paper_id = p.id
      WHERE up.user_id = $1
      ORDER BY up.submission_date DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

/**
 * Get progress over time (for chart)
 */
router.get("/progress", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT
        DATE_TRUNC('month', up.submission_date)::date as month,
        ROUND((AVG(CAST(up.marks_obtained AS FLOAT) / p.total_marks) * 100)::NUMERIC, 1) as avg_score
      FROM user_papers up
      JOIN papers p ON up.paper_id = p.id
      WHERE up.user_id = $1
      GROUP BY DATE_TRUNC('month', up.submission_date)
      ORDER BY month ASC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

/**
 * Get user's completed topics
 */
router.get("/completed-topics", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      "SELECT topic_id FROM completed_topics WHERE user_id = $1",
      [req.user.id]
    );

    res.json({
      completedTopicIds: result.rows.map(r => r.topic_id)
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch completed topics" });
  }
});

/**
 * Toggle topic completion status
 */
router.post("/toggle-topic", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { topicId, completed } = req.body;

    if (completed) {
      await pool.query(
        "INSERT INTO completed_topics (user_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [req.user.id, topicId]
      );
    } else {
      await pool.query(
        "DELETE FROM completed_topics WHERE user_id = $1 AND topic_id = $2",
        [req.user.id, topicId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle topic status" });
  }
});

export { router as performanceRouter };
