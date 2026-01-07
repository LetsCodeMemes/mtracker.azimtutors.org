import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { EmailNotificationService } from "../lib/email-notifications";
import { pool } from "../db";

const router = Router();

/**
 * Get user notification preferences
 */
router.get(
  "/preferences",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await pool.query(
        `SELECT streak_reminders, weekly_summaries, badge_celebrations 
         FROM notification_preferences 
         WHERE user_id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        // Create default preferences
        await EmailNotificationService.createDefaultPreferences(req.user.id);
        return res.json({
          streakReminders: true,
          weeklySummaries: true,
          badgeCelebrations: true,
        });
      }

      const prefs = result.rows[0];
      res.json({
        streakReminders: prefs.streak_reminders,
        weeklySummaries: prefs.weekly_summaries,
        badgeCelebrations: prefs.badge_celebrations,
      });
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({
        error: "Failed to fetch notification preferences",
      });
    }
  }
);

/**
 * Update notification preferences
 */
router.put(
  "/preferences",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { streakReminders, weeklySummaries, badgeCelebrations } = req.body;

      await EmailNotificationService.updatePreferences(req.user.id, {
        streakReminders,
        weeklySummaries,
        badgeCelebrations,
      });

      res.json({
        success: true,
        message: "Notification preferences updated",
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({
        error: "Failed to update notification preferences",
      });
    }
  }
);

/**
 * Send test streak reminder notification
 */
router.post(
  "/test/streak-reminder",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get user email and streak
      const userResult = await pool.query(
        "SELECT email FROM users WHERE id = $1",
        [req.user.id]
      );

      const streakResult = await pool.query(
        "SELECT current_streak FROM user_streaks WHERE user_id = $1",
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const email = userResult.rows[0].email;
      const currentStreak = streakResult.rows[0]?.current_streak || 0;

      await EmailNotificationService.sendStreakReminder(
        req.user.id,
        email,
        currentStreak
      );

      res.json({
        success: true,
        message: "Streak reminder notification sent",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({
        error: "Failed to send notification",
      });
    }
  }
);

/**
 * Send test weekly summary notification
 */
router.post(
  "/test/weekly-summary",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get user email
      const userResult = await pool.query(
        "SELECT email FROM users WHERE id = $1",
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const email = userResult.rows[0].email;

      // Calculate weekly stats
      const statsResult = await pool.query(
        `SELECT 
           COUNT(*) as papers_submitted,
           SUM(COALESCE(up.marks_obtained, 0))::INTEGER as total_points,
           AVG(COALESCE(up.marks_obtained, 0) * 100.0 / 100)::NUMERIC as average_score
         FROM user_papers up
         WHERE up.user_id = $1 
         AND up.submission_date >= CURRENT_DATE - INTERVAL '7 days'`,
        [req.user.id]
      );

      const stats = statsResult.rows[0];
      const topicsResult = await pool.query(
        `SELECT topic FROM topic_performance 
         WHERE user_id = $1 
         ORDER BY accuracy_percent DESC LIMIT 3`,
        [req.user.id]
      );

      const topTopics = topicsResult.rows.map((r) => r.topic);
      const streakResult = await pool.query(
        "SELECT current_streak FROM user_streaks WHERE user_id = $1",
        [req.user.id]
      );

      const currentStreak = streakResult.rows[0]?.current_streak || 0;

      await EmailNotificationService.sendWeeklySummary(req.user.id, email, {
        papersSubmitted: parseInt(stats.papers_submitted) || 0,
        totalPoints: parseInt(stats.total_points) || 0,
        topTopics,
        averageScore: parseFloat(stats.average_score) || 0,
        streakStatus: `${currentStreak} days on fire! 🔥`,
      });

      res.json({
        success: true,
        message: "Weekly summary notification sent",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({
        error: "Failed to send notification",
      });
    }
  }
);

/**
 * Send test badge celebration notification
 */
router.post(
  "/test/badge-celebration",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { badgeName, badgeDescription } = req.body;

      if (!badgeName) {
        return res.status(400).json({
          error: "Badge name is required",
        });
      }

      // Get user email
      const userResult = await pool.query(
        "SELECT email FROM users WHERE id = $1",
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const email = userResult.rows[0].email;

      await EmailNotificationService.sendBadgeCelebration(
        req.user.id,
        email,
        badgeName,
        badgeDescription || "You've earned this special badge!"
      );

      res.json({
        success: true,
        message: "Badge celebration notification sent",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({
        error: "Failed to send notification",
      });
    }
  }
);

/**
 * Get notification history
 */
router.get(
  "/history",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { limit = 20, offset = 0 } = req.query;

      const result = await pool.query(
        `SELECT id, notification_type, subject, status, sent_at, created_at 
         FROM email_notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [req.user.id, parseInt(limit as string), parseInt(offset as string)]
      );

      res.json({
        success: true,
        notifications: result.rows,
        total: result.rows.length,
      });
    } catch (error) {
      console.error("Error fetching notification history:", error);
      res.status(500).json({
        error: "Failed to fetch notification history",
      });
    }
  }
);

export { router as notificationsRouter };
