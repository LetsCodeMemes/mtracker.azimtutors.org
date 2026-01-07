import { Router, Response } from "express";
import { pool } from "../db";
import { authMiddleware, AuthRequest } from "../middleware";
import { z } from "zod";
import { EmailNotificationService } from "../lib/email-notifications";

const router = Router();

// Protect all gamification routes with auth middleware
router.use(authMiddleware);

const MistakeLogSchema = z.object({
  questionId: z.number(),
  userPaperId: z.number(),
  topic: z.string(),
  mistakeType: z.enum([
    "didnt_understand",
    "misread_question",
    "algebra_error",
    "forgot_formula",
    "time_pressure",
  ]),
  description: z.string().optional(),
});

/**
 * Log a mistake for a question
 */
router.post(
  "/mistakes",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const data = MistakeLogSchema.parse(req.body);

      const result = await pool.query(
        `INSERT INTO mistake_log (user_id, question_id, user_paper_id, topic, mistake_type, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          req.user.id,
          data.questionId,
          data.userPaperId,
          data.topic,
          data.mistakeType,
          data.description || null,
        ]
      );

      res.json({ success: true, mistake: result.rows[0] });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to log mistake" });
      }
    }
  }
);

/**
 * Get user's mistake analysis
 */
router.get(
  "/mistakes/analysis",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Get mistake breakdown by type
      const mistakeBreakdown = await pool.query(
        `SELECT
          mistake_type,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM mistake_log WHERE user_id = $1))::NUMERIC, 1) as percentage
         FROM mistake_log
         WHERE user_id = $1
         GROUP BY mistake_type
         ORDER BY count DESC`,
        [req.user.id]
      );

      // Get top problematic topics
      const topicBreakdown = await pool.query(
        `SELECT
          topic,
          COUNT(*) as mistake_count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM mistake_log WHERE user_id = $1))::NUMERIC, 1) as percentage
         FROM mistake_log
         WHERE user_id = $1
         GROUP BY topic
         ORDER BY mistake_count DESC
         LIMIT 10`,
        [req.user.id]
      );

      res.json({
        mistakeTypeBreakdown: mistakeBreakdown.rows,
        topProblematicTopics: topicBreakdown.rows,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mistake analysis" });
    }
  }
);

/**
 * Get or create user streak
 */
router.get(
  "/streaks",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const result = await pool.query(
        `SELECT * FROM user_streaks WHERE user_id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        const newStreak = await pool.query(
          `INSERT INTO user_streaks (user_id, current_streak, longest_streak)
           VALUES ($1, 0, 0)
           RETURNING *`,
          [req.user.id]
        );
        res.json(newStreak.rows[0]);
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch streak" });
    }
  }
);

/**
 * Update streak after paper submission
 */
router.post(
  "/streaks/update",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const result = await pool.query(
        `SELECT last_submission_date, current_streak, longest_streak FROM user_streaks WHERE user_id = $1`,
        [req.user.id]
      );

      let streak = result.rows[0];
      const lastDate = streak?.last_submission_date
        ? new Date(streak.last_submission_date).toISOString().split("T")[0]
        : null;

      let newCurrentStreak = 0;
      let newLongestStreak = streak?.longest_streak || 0;

      if (lastDate === today) {
        // Already submitted today
        newCurrentStreak = streak?.current_streak || 0;
      } else {
        // Calculate streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastDate === yesterdayStr) {
          // Continue streak
          newCurrentStreak = (streak?.current_streak || 0) + 1;

          // Award points for daily sign-in/submission
          let pointsToAward = 5;

          // Milestone bonuses
          const milestones: Record<number, number> = {
            7: 50,
            14: 100,
            30: 250,
            50: 500,
            100: 1000
          };

          if (milestones[newCurrentStreak]) {
            pointsToAward += milestones[newCurrentStreak];
          }

          await pool.query(
            `UPDATE user_points SET total_points = total_points + $1, experience = experience + $1 WHERE user_id = $2`,
            [pointsToAward, req.user.id]
          );
        } else {
          // Reset to 1
          newCurrentStreak = 1;

          // Award base points for starting a streak
          await pool.query(
            `UPDATE user_points SET total_points = total_points + 5, experience = experience + 5 WHERE user_id = $1`,
            [req.user.id]
          );
        }

        // Update longest streak
        newLongestStreak = Math.max(newCurrentStreak, newLongestStreak);
      }

      const updated = await pool.query(
        `UPDATE user_streaks 
         SET current_streak = $1, longest_streak = $2, last_submission_date = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4
         RETURNING *`,
        [newCurrentStreak, newLongestStreak, today, req.user.id]
      );

      res.json(updated.rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update streak" });
    }
  }
);

/**
 * Get user's badges
 */
router.get(
  "/badges",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const result = await pool.query(
        `SELECT * FROM user_badges WHERE user_id = $1 ORDER BY earned_at DESC`,
        [req.user.id]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  }
);

/**
 * Award badge to user
 */
router.post(
  "/badges/award",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { badgeId, badgeName, badgeDescription } = req.body;

      const result = await pool.query(
        `INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, badge_id) DO NOTHING
         RETURNING *`,
        [req.user.id, badgeId, badgeName, badgeDescription]
      );

      // Send badge celebration notification if badge was newly awarded
      if (result.rows.length > 0) {
        const userResult = await pool.query(
          "SELECT email FROM users WHERE id = $1",
          [req.user.id]
        );

        if (userResult.rows.length > 0) {
          const email = userResult.rows[0].email;
          const isNotificationEnabled = await EmailNotificationService.isNotificationEnabled(
            req.user.id,
            "badge_celebration"
          );

          if (isNotificationEnabled) {
            await EmailNotificationService.sendBadgeCelebration(
              req.user.id,
              email,
              badgeName,
              badgeDescription || "You've earned this special badge!"
            );
          }
        }
      }

      res.json({
        success: result.rows.length > 0,
        badge: result.rows[0] || null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to award badge" });
    }
  }
);

/**
 * Get user's points and level
 */
router.get(
  "/points",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const result = await pool.query(
        `SELECT * FROM user_points WHERE user_id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        const newPoints = await pool.query(
          `INSERT INTO user_points (user_id, total_points, level, experience)
           VALUES ($1, 0, 1, 0)
           RETURNING *`,
          [req.user.id]
        );
        res.json(newPoints.rows[0]);
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch points" });
    }
  }
);

/**
 * Add points to user
 */
router.post(
  "/points/add",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { points } = req.body;

      const result = await pool.query(
        `UPDATE user_points 
         SET total_points = total_points + $1, experience = experience + $1
         WHERE user_id = $2
         RETURNING *`,
        [points, req.user.id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to add points" });
    }
  }
);

/**
 * Get user's plan
 */
router.get(
  "/plan",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const result = await pool.query(
        `SELECT * FROM user_plans WHERE user_id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        const newPlan = await pool.query(
          `INSERT INTO user_plans (user_id, plan_type, max_papers, papers_submitted)
           VALUES ($1, 'free', 3, 0)
           RETURNING *`,
          [req.user.id]
        );
        res.json(newPlan.rows[0]);
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plan" });
    }
  }
);

/**
 * Upgrade user plan
 */
router.post(
  "/plan/upgrade",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { planType } = req.body;

      if (!["premium", "pro"].includes(planType)) {
        res.status(400).json({ error: "Invalid plan type" });
        return;
      }

      const result = await pool.query(
        `UPDATE user_plans
         SET plan_type = $1, max_papers = $2, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3
         RETURNING *`,
        [planType, planType === "premium" ? 100 : 999, req.user.id]
      );

      if (result.rows.length === 0) {
        const newPlan = await pool.query(
          `INSERT INTO user_plans (user_id, plan_type, max_papers)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [req.user.id, planType, planType === "premium" ? 100 : 999]
        );
        res.json({
          success: true,
          message: `Upgraded to ${planType}`,
          plan: newPlan.rows[0],
        });
      } else {
        res.json({
          success: true,
          message: `Upgraded to ${planType}`,
          plan: result.rows[0],
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to upgrade plan" });
    }
  }
);

/**
 * Get plan pricing and features
 */
router.get(
  "/pricing",
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const pricing = {
        plans: [
          {
            id: "free",
            name: "Free",
            price: 0,
            period: "forever",
            description: "Get started with Azim Tutors",
            features: [
              "3 past papers per month",
              "Basic progress tracking",
              "Topic performance analysis",
              "Grade simulator access",
              "Community support",
            ],
            limitReached: false,
          },
          {
            id: "premium",
            name: "Premium",
            price: 9.99,
            period: "month",
            description: "Unlock unlimited access",
            features: [
              "100 past papers per month",
              "AI-powered study recommendations",
              "Weekly revision plans",
              "Custom timetable builder",
              "Priority email support",
              "Detailed mistake analysis",
              "Video explanations",
            ],
            popular: true,
          },
          {
            id: "pro",
            name: "Pro",
            price: 19.99,
            period: "month",
            description: "Complete exam mastery",
            features: [
              "Unlimited past papers",
              "1-on-1 personalized coaching",
              "Custom exam date planning",
              "AI-generated practice questions",
              "Priority support",
              "Detailed progress reports",
              "Video explanations",
              "Access to tutor network",
            ],
          },
        ],
      };
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pricing" });
    }
  }
);

/**
 * Daily check-in to award points and update streak
 */
router.post(
  "/daily-checkin",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const result = await pool.query(
        `SELECT last_submission_date, current_streak, longest_streak FROM user_streaks WHERE user_id = $1`,
        [req.user.id]
      );

      let streak = result.rows[0];
      const lastDate = streak?.last_submission_date
        ? new Date(streak.last_submission_date).toISOString().split("T")[0]
        : null;

      if (lastDate === today) {
        // Already checked in today
        res.json({ success: true, message: "Already checked in today", streak });
        return;
      }

      let newCurrentStreak = 0;
      let newLongestStreak = streak?.longest_streak || 0;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastDate === yesterdayStr) {
        // Continue streak
        newCurrentStreak = (streak?.current_streak || 0) + 1;
      } else {
        // Reset to 1
        newCurrentStreak = 1;
      }

      // Milestone bonuses
      const milestones: Record<number, number> = {
        7: 50,
        14: 100,
        30: 250,
        50: 500,
        100: 1000
      };

      let pointsToAward = 5;
      if (milestones[newCurrentStreak]) {
        pointsToAward += milestones[newCurrentStreak];
      }

      // Update longest streak
      newLongestStreak = Math.max(newCurrentStreak, newLongestStreak);

      await pool.query(
        `UPDATE user_streaks
         SET current_streak = $1, longest_streak = $2, last_submission_date = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4`,
        [newCurrentStreak, newLongestStreak, today, req.user.id]
      );

      await pool.query(
        `UPDATE user_points SET total_points = total_points + $1, experience = experience + $1 WHERE user_id = $2`,
        [pointsToAward, req.user.id]
      );

      res.json({
        success: true,
        message: "Check-in successful",
        pointsAwarded: pointsToAward,
        streak: { current_streak: newCurrentStreak, longest_streak: newLongestStreak }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check in" });
    }
  }
);

/**
 * Get leaderboard data
 */
router.get(
  "/leaderboard",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `SELECT u.username, u.first_name, u.last_name, p.total_points, p.level
         FROM users u
         JOIN user_points p ON u.id = p.user_id
         WHERE u.is_leaderboard_public = true
         ORDER BY p.total_points DESC
         LIMIT 50`
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  }
);

/**
 * Toggle leaderboard visibility
 */
router.post(
  "/leaderboard/toggle",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { isPublic } = req.body;

      const result = await pool.query(
        `UPDATE users SET is_leaderboard_public = $1 WHERE id = $2 RETURNING is_leaderboard_public`,
        [isPublic, req.user.id]
      );

      res.json({ success: true, isPublic: result.rows[0].is_leaderboard_public });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle leaderboard preference" });
    }
  }
);

export { router as gamificationRouter };
