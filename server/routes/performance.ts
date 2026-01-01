import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

/**
 * Get user's overall performance statistics
 */
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    // Overall score (average across all papers)
    const scoreResult = await pool.query(
      `SELECT 
        AVG(CAST(marks_obtained AS FLOAT) / 
          (SELECT COALESCE(SUM(marks_available), 100) FROM exam_questions WHERE paper_id = user_papers.paper_id)) * 100 as avg_score,
        COUNT(*) as paper_count
      FROM user_papers
      WHERE user_id = $1`,
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
        ROUND(COALESCE(SUM(qr.marks_obtained)::FLOAT / NULLIF(SUM(eq.marks_available), 0), 0) * 100, 1) as accuracy
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
        ROUND(COALESCE(SUM(qr.marks_obtained)::FLOAT / NULLIF(SUM(eq.marks_available), 0), 0) * 100, 1) as accuracy
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
        COALESCE(SUM(eq.marks_available), 0) as total_marks,
        up.submission_date,
        ROUND(CAST(up.marks_obtained AS FLOAT) / NULLIF(SUM(eq.marks_available), 100) * 100, 1) as percentage
      FROM user_papers up
      JOIN papers p ON up.paper_id = p.id
      LEFT JOIN exam_questions eq ON p.id = eq.paper_id
      WHERE up.user_id = $1
      GROUP BY up.id, p.exam_board, p.year, p.paper_number, up.marks_obtained, up.submission_date
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
        ROUND(AVG(CAST(up.marks_obtained AS FLOAT) / 
          (SELECT COALESCE(SUM(marks_available), 100) FROM exam_questions WHERE paper_id = up.paper_id)) * 100, 1) as avg_score
      FROM user_papers up
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

export { router as performanceRouter };
