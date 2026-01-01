import { Router, Request, Response } from "express";
import { getExamQuestions, getAvailableTopics } from "../data/exam-mappings";
import { pool } from "../db";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware";

/**
 * Get all available papers (with caching logic)
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM papers ORDER BY year DESC, paper_number ASC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

/**
 * Get questions for a specific paper
 */
router.get("/:paperId/questions", async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;

    // First check if questions exist in DB
    const result = await pool.query(
      `SELECT eq.* FROM exam_questions eq 
       WHERE eq.paper_id = $1 
       ORDER BY eq.question_number ASC`,
      [paperId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

/**
 * Get all topics for a given exam board
 */
router.get("/topics/:examBoard", async (req: Request, res: Response) => {
  try {
    const { examBoard } = req.params;
    const topics = getAvailableTopics(examBoard);
    res.json({ topics });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

/**
 * Submit a past paper with marks
 */
const SubmitPaperSchema = z.object({
  paperId: z.number(),
  marks: z.record(z.number().min(0)), // { questionId: marks }
});

router.post(
  "/:paperId/submit",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      // Note: In production, verify the JWT token from headers
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { paperId, marks } = SubmitPaperSchema.parse({
        paperId: parseInt(req.params.paperId),
        marks: req.body.marks,
      });

      const client = await pool.connect();
      try {
        // Check if user already submitted this paper
        const existing = await client.query(
          "SELECT id FROM user_papers WHERE user_id = $1 AND paper_id = $2",
          [req.user.id, paperId]
        );

        let userPaperId: number;

        if (existing.rows.length > 0) {
          // Update existing submission
          userPaperId = existing.rows[0].id;
          await client.query(
            "UPDATE user_papers SET submission_date = CURRENT_TIMESTAMP WHERE id = $1",
            [userPaperId]
          );
        } else {
          // Create new submission
          const result = await client.query(
            `INSERT INTO user_papers (user_id, paper_id) 
             VALUES ($1, $2) RETURNING id`,
            [req.user.id, paperId]
          );
          userPaperId = result.rows[0].id;
        }

        // Delete old question responses and insert new ones
        await client.query(
          "DELETE FROM question_responses WHERE user_paper_id = $1",
          [userPaperId]
        );

        let totalMarks = 0;
        for (const [questionId, marksObtained] of Object.entries(marks)) {
          await client.query(
            `INSERT INTO question_responses (user_paper_id, question_id, marks_obtained)
             VALUES ($1, $2, $3)`,
            [userPaperId, parseInt(questionId), marksObtained]
          );
          totalMarks += marksObtained as number;
        }

        // Update total marks for the paper
        await client.query(
          "UPDATE user_papers SET marks_obtained = $1 WHERE id = $2",
          [totalMarks, userPaperId]
        );

        res.json({
          success: true,
          message: "Paper submitted successfully",
          userPaperId,
          totalMarks,
        });
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      } else {
        res.status(500).json({ error: "Failed to submit paper" });
      }
    }
  }
);

export { router as papersRouter };
