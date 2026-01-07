import { pool } from "../db";

interface NotificationOptions {
  userId: number;
  email: string;
  notificationType: "streak_reminder" | "weekly_summary" | "badge_celebration";
  data: Record<string, any>;
}

/**
 * Email notification service
 * This is a framework that can be extended with real email providers (SendGrid, Resend, etc.)
 */
export class EmailNotificationService {
  /**
   * Send a streak reminder notification
   */
  static async sendStreakReminder(
    userId: number,
    email: string,
    currentStreak: number
  ): Promise<void> {
    const message = `Keep up the momentum! You have a ${currentStreak}-day study streak. Keep submitting papers to maintain it!`;
    const subject = `🔥 Keep your ${currentStreak}-day streak alive!`;

    await this.createNotification({
      userId,
      email,
      notificationType: "streak_reminder",
      data: { currentStreak },
    });

    await this.sendEmail(email, subject, message, userId, "streak_reminder");
  }

  /**
   * Send a weekly summary notification
   */
  static async sendWeeklySummary(
    userId: number,
    email: string,
    weeklyStats: {
      papersSubmitted: number;
      totalPoints: number;
      topTopics: string[];
      averageScore: number;
      streakStatus: string;
    }
  ): Promise<void> {
    const { papersSubmitted, totalPoints, topTopics, averageScore, streakStatus } =
      weeklyStats;

    const message = `Your weekly summary:
    - Papers submitted: ${papersSubmitted}
    - Points earned: ${totalPoints}
    - Top topics: ${topTopics.join(", ") || "None yet"}
    - Average score: ${averageScore.toFixed(1)}%
    - Streak status: ${streakStatus}
    
    Keep pushing! Every paper gets you closer to exam success!`;

    const subject = `📊 Your Weekly Study Summary`;

    await this.createNotification({
      userId,
      email,
      notificationType: "weekly_summary",
      data: weeklyStats,
    });

    await this.sendEmail(email, subject, message, userId, "weekly_summary");
  }

  /**
   * Send a badge celebration notification
   */
  static async sendBadgeCelebration(
    userId: number,
    email: string,
    badgeName: string,
    badgeDescription: string
  ): Promise<void> {
    const message = `Congratulations! You've earned a new badge: "${badgeName}"

${badgeDescription}

You're doing amazing! Keep up the hard work and unlock more badges!`;

    const subject = `🏆 You earned a new badge: ${badgeName}!`;

    await this.createNotification({
      userId,
      email,
      notificationType: "badge_celebration",
      data: { badgeName, badgeDescription },
    });

    await this.sendEmail(email, subject, message, userId, "badge_celebration");
  }

  /**
   * Create a notification record in the database
   */
  private static async createNotification(
    options: NotificationOptions
  ): Promise<void> {
    const { userId, notificationType, data } = options;

    try {
      await pool.query(
        `INSERT INTO email_notifications (user_id, notification_type, subject, message, status)
         VALUES ($1, $2, $3, $4, 'queued')`,
        [
          userId,
          notificationType,
          data.subject || "Azim Tutors Notification",
          JSON.stringify(data),
        ]
      );
    } catch (error) {
      console.error("Error creating notification record:", error);
    }
  }

  /**
   * Send email (mocked implementation - can be replaced with real email service)
   * In production, integrate with SendGrid, Resend, or similar service
   */
  private static async sendEmail(
    email: string,
    subject: string,
    message: string,
    userId: number,
    notificationType: string
  ): Promise<void> {
    try {
      // TODO: Integrate with real email service
      // For now, we'll log the email and mark it as sent in the database
      console.log(`📧 [EMAIL] To: ${email}`);
      console.log(`📧 [EMAIL] Subject: ${subject}`);
      console.log(`📧 [EMAIL] Message: ${message}`);

      // Mark notification as sent
      await pool.query(
        `UPDATE email_notifications 
         SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 AND notification_type = $2 
         ORDER BY created_at DESC LIMIT 1`,
        [userId, notificationType]
      );

      console.log(`✅ Email sent to ${email}`);
    } catch (error) {
      console.error("Error sending email:", error);

      // Mark notification as failed
      try {
        await pool.query(
          `UPDATE email_notifications 
           SET status = 'failed' 
           WHERE user_id = $1 AND notification_type = $2 
           ORDER BY created_at DESC LIMIT 1`,
          [userId, notificationType]
        );
      } catch (updateError) {
        console.error("Error updating notification status:", updateError);
      }
    }
  }

  /**
   * Check if user has notifications enabled for a specific type
   */
  static async isNotificationEnabled(
    userId: number,
    notificationType: "streak_reminder" | "weekly_summary" | "badge_celebration"
  ): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT ${notificationType.replace(/_/g, "_")} as enabled 
         FROM notification_preferences 
         WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return true; // Default to true if preferences not set
      }

      return result.rows[0].enabled ?? true;
    } catch (error) {
      console.error("Error checking notification preferences:", error);
      return true; // Default to true
    }
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(
    userId: number,
    preferences: {
      streakReminders?: boolean;
      weeklySummaries?: boolean;
      badgeCelebrations?: boolean;
    }
  ): Promise<void> {
    try {
      const updates: string[] = [];
      const values: any[] = [userId];
      let paramCount = 2;

      if (preferences.streakReminders !== undefined) {
        updates.push(`streak_reminders = $${paramCount}`);
        values.push(preferences.streakReminders);
        paramCount++;
      }

      if (preferences.weeklySummaries !== undefined) {
        updates.push(`weekly_summaries = $${paramCount}`);
        values.push(preferences.weeklySummaries);
        paramCount++;
      }

      if (preferences.badgeCelebrations !== undefined) {
        updates.push(`badge_celebrations = $${paramCount}`);
        values.push(preferences.badgeCelebrations);
        paramCount++;
      }

      if (updates.length === 0) return;

      await pool.query(
        `UPDATE notification_preferences 
         SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1`,
        values
      );
    } catch (error) {
      console.error("Error updating notification preferences:", error);
    }
  }

  /**
   * Create default notification preferences for a new user
   */
  static async createDefaultPreferences(userId: number): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO notification_preferences (user_id, streak_reminders, weekly_summaries, badge_celebrations)
         VALUES ($1, true, true, true)
         ON CONFLICT DO NOTHING`,
        [userId]
      );
    } catch (error) {
      console.error("Error creating notification preferences:", error);
    }
  }
}
