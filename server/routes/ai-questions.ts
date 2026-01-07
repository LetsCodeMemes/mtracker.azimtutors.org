import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware";
import { pool } from "../db";

const router = Router();

interface PracticeQuestion {
  id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  hints: string[];
  solutions: {
    steps: string[];
    answer: string;
  };
}

// Question templates for each topic
const questionTemplates: Record<string, PracticeQuestion[]> = {
  Algebra: [
    {
      id: "alg_1",
      topic: "Algebra",
      difficulty: "easy",
      question:
        "Simplify: 2x + 3x - 5x. What is the coefficient of x?",
      hints: [
        "Combine like terms",
        "Add the positive coefficients first: 2 + 3 = 5",
        "Then subtract: 5 - 5 = 0",
      ],
      solutions: {
        steps: [
          "Group like terms: 2x + 3x - 5x",
          "Combine positive terms: 2x + 3x = 5x",
          "Subtract: 5x - 5x = 0",
          "The coefficient is 0",
        ],
        answer: "0",
      },
    },
    {
      id: "alg_2",
      topic: "Algebra",
      difficulty: "medium",
      question:
        "Solve for x: 3x + 7 = 22. What is the value of x?",
      hints: [
        "Isolate the term with x",
        "Subtract 7 from both sides: 3x = 22 - 7",
        "Divide both sides by 3",
      ],
      solutions: {
        steps: [
          "Start with: 3x + 7 = 22",
          "Subtract 7 from both sides: 3x = 15",
          "Divide by 3: x = 5",
        ],
        answer: "x = 5",
      },
    },
    {
      id: "alg_3",
      topic: "Algebra",
      difficulty: "hard",
      question:
        "Solve the quadratic equation: x² - 5x + 6 = 0. What are the roots?",
      hints: [
        "Factor the quadratic",
        "Look for two numbers that multiply to 6 and add to -5",
        "The numbers are -2 and -3",
      ],
      solutions: {
        steps: [
          "Factor: (x - 2)(x - 3) = 0",
          "Set each factor to zero: x - 2 = 0 or x - 3 = 0",
          "Solve: x = 2 or x = 3",
        ],
        answer: "x = 2 or x = 3",
      },
    },
  ],

  Trigonometry: [
    {
      id: "trig_1",
      topic: "Trigonometry",
      difficulty: "easy",
      question:
        "In a right triangle, if sin(θ) = 0.5, what is the angle θ in degrees?",
      hints: [
        "sin(30°) = 0.5",
        "sin(θ) = opposite/hypotenuse",
        "Think of the standard angles",
      ],
      solutions: {
        steps: [
          "We need to find θ such that sin(θ) = 0.5",
          "From standard angles: sin(30°) = 0.5",
          "Therefore θ = 30°",
        ],
        answer: "θ = 30°",
      },
    },
    {
      id: "trig_2",
      topic: "Trigonometry",
      difficulty: "medium",
      question:
        "Convert π/3 radians to degrees",
      hints: [
        "Use the conversion: degrees = radians × (180/π)",
        "π/3 × (180/π) = 180/3",
        "Simplify",
      ],
      solutions: {
        steps: [
          "Conversion formula: degrees = radians × (180/π)",
          "π/3 × (180/π) = 180/3",
          "= 60 degrees",
        ],
        answer: "60°",
      },
    },
    {
      id: "trig_3",
      topic: "Trigonometry",
      difficulty: "hard",
      question:
        "Prove that sin²(θ) + cos²(θ) = 1 using the unit circle",
      hints: [
        "On the unit circle, a point is at (cos(θ), sin(θ))",
        "The point lies on a circle with radius 1",
        "Use the circle equation: x² + y² = r²",
      ],
      solutions: {
        steps: [
          "On the unit circle with radius 1, any point is at (cos(θ), sin(θ))",
          "The circle equation is x² + y² = 1²",
          "Substituting: cos²(θ) + sin²(θ) = 1",
          "Rearranging: sin²(θ) + cos²(θ) = 1",
        ],
        answer: "sin²(θ) + cos²(θ) = 1",
      },
    },
  ],

  Calculus: [
    {
      id: "calc_1",
      topic: "Calculus",
      difficulty: "easy",
      question:
        "Find the derivative of f(x) = 3x² with respect to x",
      hints: [
        "Use the power rule: d/dx(xⁿ) = n·xⁿ⁻¹",
        "Apply to 3x²: 3 × 2 × x¹",
        "Simplify",
      ],
      solutions: {
        steps: [
          "Apply power rule: d/dx(3x²) = 3 × 2 × x²⁻¹",
          "= 6x¹",
          "= 6x",
        ],
        answer: "f'(x) = 6x",
      },
    },
    {
      id: "calc_2",
      topic: "Calculus",
      difficulty: "medium",
      question:
        "Find the integral of f(x) = 4x³. What is ∫4x³ dx?",
      hints: [
        "Use the power rule for integration: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C",
        "Apply to 4x³",
        "Don't forget the constant of integration",
      ],
      solutions: {
        steps: [
          "∫4x³ dx = 4 ∫x³ dx",
          "= 4 × (x⁴/4) + C",
          "= x⁴ + C",
        ],
        answer: "x⁴ + C",
      },
    },
    {
      id: "calc_3",
      topic: "Calculus",
      difficulty: "hard",
      question:
        "Find the stationary points of f(x) = x³ - 3x² + 2x by finding where f'(x) = 0",
      hints: [
        "First find f'(x) using the power rule",
        "Set f'(x) = 0 and solve for x",
        "You'll get a quadratic equation",
      ],
      solutions: {
        steps: [
          "Find derivative: f'(x) = 3x² - 6x + 2",
          "Set f'(x) = 0: 3x² - 6x + 2 = 0",
          "Use quadratic formula or factoring",
          "x ≈ 0.42 or x ≈ 1.58 (approximate values)",
        ],
        answer: "Stationary points at x ≈ 0.42 and x ≈ 1.58",
      },
    },
  ],

  "Coordinate Geometry": [
    {
      id: "cg_1",
      topic: "Coordinate Geometry",
      difficulty: "easy",
      question:
        "What is the distance between points A(0, 0) and B(3, 4)?",
      hints: [
        "Use the distance formula: d = √[(x₂-x₁)² + (y₂-y₁)²]",
        "Substitute the coordinates",
        "Calculate",
      ],
      solutions: {
        steps: [
          "Distance formula: d = √[(x₂-x₁)² + (y₂-y₁)²]",
          "d = √[(3-0)² + (4-0)²]",
          "d = √[9 + 16]",
          "d = √25 = 5",
        ],
        answer: "5 units",
      },
    },
    {
      id: "cg_2",
      topic: "Coordinate Geometry",
      difficulty: "medium",
      question:
        "Find the equation of a circle with center (2, 3) and radius 5",
      hints: [
        "Circle equation: (x - h)² + (y - k)² = r²",
        "Where (h, k) is the center and r is the radius",
        "Substitute the given values",
      ],
      solutions: {
        steps: [
          "Circle equation: (x - h)² + (y - k)² = r²",
          "With center (2, 3) and radius 5:",
          "(x - 2)² + (y - 3)² = 5²",
          "(x - 2)² + (y - 3)² = 25",
        ],
        answer: "(x - 2)² + (y - 3)² = 25",
      },
    },
  ],

  Functions: [
    {
      id: "func_1",
      topic: "Functions",
      difficulty: "easy",
      question:
        "If f(x) = 2x + 1, find f(3)",
      hints: [
        "Substitute x = 3 into the function",
        "Calculate 2(3) + 1",
        "Simplify",
      ],
      solutions: {
        steps: [
          "f(x) = 2x + 1",
          "f(3) = 2(3) + 1",
          "f(3) = 6 + 1",
          "f(3) = 7",
        ],
        answer: "f(3) = 7",
      },
    },
    {
      id: "func_2",
      topic: "Functions",
      difficulty: "medium",
      question:
        "If f(x) = x² and g(x) = x + 2, find f(g(x))",
      hints: [
        "Composition of functions: f(g(x)) means substitute g(x) into f",
        "g(x) = x + 2",
        "f(g(x)) = f(x + 2) = (x + 2)²",
      ],
      solutions: {
        steps: [
          "f(g(x)) means substitute g(x) into f(x)",
          "g(x) = x + 2",
          "f(g(x)) = f(x + 2) = (x + 2)²",
          "= x² + 4x + 4",
        ],
        answer: "f(g(x)) = x² + 4x + 4",
      },
    },
  ],

  "Sequences and Series": [
    {
      id: "seq_1",
      topic: "Sequences and Series",
      difficulty: "easy",
      question:
        "What is the 5th term of the arithmetic sequence 2, 5, 8, 11, ...?",
      hints: [
        "Find the common difference: 5 - 2 = 3",
        "Use the formula: aₙ = a₁ + (n-1)d",
        "Where a₁ = 2, d = 3, n = 5",
      ],
      solutions: {
        steps: [
          "Common difference: d = 5 - 2 = 3",
          "aₙ = a₁ + (n-1)d",
          "a₅ = 2 + (5-1)×3",
          "a₅ = 2 + 12 = 14",
        ],
        answer: "14",
      },
    },
    {
      id: "seq_2",
      topic: "Sequences and Series",
      difficulty: "medium",
      question:
        "Find the sum of the first 10 terms of the arithmetic sequence 3, 6, 9, ...",
      hints: [
        "Identify a₁ = 3, d = 3, n = 10",
        "Sum formula: Sₙ = n/2 × (2a₁ + (n-1)d)",
        "Calculate",
      ],
      solutions: {
        steps: [
          "a₁ = 3, d = 3, n = 10",
          "Sₙ = n/2 × (2a₁ + (n-1)d)",
          "S₁₀ = 10/2 × (2×3 + 9×3)",
          "S₁₀ = 5 × (6 + 27) = 5 × 33 = 165",
        ],
        answer: "165",
      },
    },
  ],
};

/**
 * Generate AI practice questions for a given topic
 */
router.post("/practice-questions", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Topic is required",
      });
    }

    // Get template questions for this topic
    const templates = questionTemplates[topic] || [];

    if (templates.length === 0) {
      return res.status(404).json({
        error: `No practice questions available for topic: ${topic}`,
        availableTopics: Object.keys(questionTemplates),
      });
    }

    // Filter by difficulty if specified
    let questions = templates;
    if (difficulty) {
      questions = templates.filter((q) => q.difficulty === difficulty);
    }

    // Shuffle and return 3 random questions
    const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, 3);

    // Log this action for user analytics
    if (req.user) {
      await pool.query(
        `INSERT INTO topic_performance (user_id, topic, total_questions, correct_questions, last_updated)
         VALUES ($1, $2, 0, 0, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, topic) DO UPDATE SET last_updated = CURRENT_TIMESTAMP`,
        [req.user.id, topic]
      );
    }

    res.json({
      success: true,
      topic,
      difficulty: difficulty || "mixed",
      questions: shuffled,
      totalQuestions: shuffled.length,
    });
  } catch (error) {
    console.error("Error generating practice questions:", error);
    res.status(500).json({
      error: "Failed to generate practice questions",
    });
  }
});

/**
 * Get all available topics for practice questions
 */
router.get("/practice-topics", (_req: Request, res: Response) => {
  try {
    const topics = Object.keys(questionTemplates);
    res.json({
      success: true,
      topics,
      totalTopics: topics.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch practice topics",
    });
  }
});

/**
 * Submit a practice question attempt (for tracking)
 */
router.post("/practice-submit", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { questionId, topic, isCorrect, timeSpent } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!topic || questionId === undefined) {
      return res.status(400).json({
        error: "Topic and questionId are required",
      });
    }

    // Update topic performance
    const client = await pool.connect();
    try {
      // Get current performance
      const perfResult = await client.query(
        `SELECT * FROM topic_performance WHERE user_id = $1 AND topic = $2`,
        [req.user.id, topic]
      );

      if (perfResult.rows.length > 0) {
        const perf = perfResult.rows[0];
        await client.query(
          `UPDATE topic_performance 
           SET total_questions = total_questions + 1,
               correct_questions = correct_questions + $1,
               last_updated = CURRENT_TIMESTAMP
           WHERE user_id = $2 AND topic = $3`,
          [isCorrect ? 1 : 0, req.user.id, topic]
        );
      } else {
        await client.query(
          `INSERT INTO topic_performance (user_id, topic, total_questions, correct_questions, last_updated)
           VALUES ($1, $2, 1, $3, CURRENT_TIMESTAMP)`,
          [req.user.id, topic, isCorrect ? 1 : 0]
        );
      }

      // Award points for practice
      const points = isCorrect ? 10 : 5;
      await client.query(
        `UPDATE user_points 
         SET total_points = total_points + $1,
             experience = experience + $2
         WHERE user_id = $3`,
        [points, Math.ceil(points / 2), req.user.id]
      );

      // Check for level up (every 100 XP)
      const pointsResult = await client.query(
        `SELECT experience FROM user_points WHERE user_id = $1`,
        [req.user.id]
      );

      const experience = pointsResult.rows[0]?.experience || 0;
      const level = Math.floor(experience / 100) + 1;

      await client.query(
        `UPDATE user_points SET level = $1 WHERE user_id = $2`,
        [level, req.user.id]
      );

      res.json({
        success: true,
        pointsAwarded: points,
        message: isCorrect
          ? "Great work! Keep practicing!"
          : "Good attempt! Review the solution and try again.",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error submitting practice attempt:", error);
    res.status(500).json({
      error: "Failed to submit practice attempt",
    });
  }
});

export { router as aiQuestionsRouter };
