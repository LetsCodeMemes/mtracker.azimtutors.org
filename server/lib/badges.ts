import { pool } from "../db";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGES: Record<string, Badge> = {
  first_paper: {
    id: "first_paper",
    name: "First Step",
    description: "Submitted your first past paper",
    icon: "📝",
  },
  five_papers: {
    id: "five_papers",
    name: "On a Roll",
    description: "Submitted 5 past papers",
    icon: "📚",
  },
  ten_papers: {
    id: "ten_papers",
    name: "Paper Master",
    description: "Submitted 10 past papers",
    icon: "🎓",
  },
  perfect_score: {
    id: "perfect_score",
    name: "Perfect!",
    description: "Got 100% on a paper",
    icon: "⭐",
  },
  grade_a: {
    id: "grade_a",
    name: "A Grade Achievement",
    description: "Achieved an A grade",
    icon: "🏆",
  },
  grade_a_star: {
    id: "grade_a_star",
    name: "A* Master",
    description: "Achieved an A* grade",
    icon: "👑",
  },
  ten_day_streak: {
    id: "ten_day_streak",
    name: "On Fire!",
    description: "Maintained a 10 day study streak",
    icon: "🔥",
  },
  improvement_10: {
    id: "improvement_10",
    name: "Rising Star",
    description: "Improved by 10% from last paper",
    icon: "📈",
  },
  mastered_topic: {
    id: "mastered_topic",
    name: "Topic Expert",
    description: "Achieved 90%+ in a topic",
    icon: "🎯",
  },
  consistency: {
    id: "consistency",
    name: "Consistent Performer",
    description: "Scored 70%+ on 3 consecutive papers",
    icon: "✨",
  },
};

/**
 * Check and award badges for a user after submitting a paper
 */
export async function checkAndAwardBadges(
  userId: number,
  overallScore: number,
  paperCount: number,
  previousScore: number
): Promise<string[]> {
  const awardedBadges: string[] = [];

  try {
    // Badge 1: First Paper
    if (paperCount === 1) {
      const awarded = await awardBadge(
        userId,
        BADGES.first_paper.id,
        BADGES.first_paper.name,
        BADGES.first_paper.description
      );
      if (awarded) awardedBadges.push(BADGES.first_paper.name);
    }

    // Badge 2: Five Papers
    if (paperCount === 5) {
      const awarded = await awardBadge(
        userId,
        BADGES.five_papers.id,
        BADGES.five_papers.name,
        BADGES.five_papers.description
      );
      if (awarded) awardedBadges.push(BADGES.five_papers.name);
    }

    // Badge 3: Ten Papers
    if (paperCount === 10) {
      const awarded = await awardBadge(
        userId,
        BADGES.ten_papers.id,
        BADGES.ten_papers.name,
        BADGES.ten_papers.description
      );
      if (awarded) awardedBadges.push(BADGES.ten_papers.name);
    }

    // Badge 4: Perfect Score
    if (overallScore === 100) {
      const awarded = await awardBadge(
        userId,
        BADGES.perfect_score.id,
        BADGES.perfect_score.name,
        BADGES.perfect_score.description
      );
      if (awarded) awardedBadges.push(BADGES.perfect_score.name);
    }

    // Badge 5: Grade A
    if (overallScore >= 80 && overallScore < 90) {
      const awarded = await awardBadge(
        userId,
        BADGES.grade_a.id,
        BADGES.grade_a.name,
        BADGES.grade_a.description
      );
      if (awarded) awardedBadges.push(BADGES.grade_a.name);
    }

    // Badge 6: Grade A*
    if (overallScore >= 90) {
      const awarded = await awardBadge(
        userId,
        BADGES.grade_a_star.id,
        BADGES.grade_a_star.name,
        BADGES.grade_a_star.description
      );
      if (awarded) awardedBadges.push(BADGES.grade_a_star.name);
    }

    // Badge 7: Improvement
    if (previousScore > 0 && overallScore - previousScore >= 10) {
      const awarded = await awardBadge(
        userId,
        BADGES.improvement_10.id,
        BADGES.improvement_10.name,
        BADGES.improvement_10.description
      );
      if (awarded) awardedBadges.push(BADGES.improvement_10.name);
    }
  } catch (error) {
    console.error("Error awarding badges:", error);
  }

  return awardedBadges;
}

/**
 * Award a badge to a user
 */
export async function awardBadge(
  userId: number,
  badgeId: string,
  badgeName: string,
  badgeDescription: string
): Promise<boolean> {
  try {
    const result = await pool.query(
      `INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, badge_id) DO NOTHING
       RETURNING id`,
      [userId, badgeId, badgeName, badgeDescription]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error awarding badge:", error);
    return false;
  }
}

/**
 * Add points to user and check for level up
 */
export async function addPoints(
  userId: number,
  points: number
): Promise<{ newPoints: number; newLevel: number; leveledUp: boolean }> {
  try {
    const result = await pool.query(
      `UPDATE user_points 
       SET total_points = total_points + $1, experience = experience + $1
       WHERE user_id = $2
       RETURNING total_points, experience`,
      [points, userId]
    );

    if (result.rows.length === 0) {
      return { newPoints: 0, newLevel: 1, leveledUp: false };
    }

    const { experience } = result.rows[0];
    const pointsPerLevel = 1000;
    const newLevel = Math.floor(experience / pointsPerLevel) + 1;

    // Check if leveled up
    const oldLevel = Math.floor((experience - points) / pointsPerLevel) + 1;
    const leveledUp = newLevel > oldLevel;

    if (leveledUp) {
      await pool.query(
        `UPDATE user_points SET level = $1 WHERE user_id = $2`,
        [newLevel, userId]
      );
    }

    return {
      newPoints: result.rows[0].total_points,
      newLevel,
      leveledUp,
    };
  } catch (error) {
    console.error("Error adding points:", error);
    return { newPoints: 0, newLevel: 1, leveledUp: false };
  }
}
