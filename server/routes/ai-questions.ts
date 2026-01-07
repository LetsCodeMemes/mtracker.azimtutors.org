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
  markScheme?: string[];
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
        answer: "x = 2, x = 3",
      },
      markScheme: [
        "M1: Factorising the quadratic (x - 2)(x - 3)",
        "A1: Correct roots x = 2 and x = 3"
      ]
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
      markScheme: [
        "B1: Correct angle of 30 degrees",
      ]
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
        answer: "60",
      },
      markScheme: [
        "M1: Attempt to multiply by 180/pi",
        "A1: Correct answer of 60 degrees"
      ]
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
    {
      id: "cg_3",
      topic: "Coordinate Geometry",
      difficulty: "hard",
      question:
        "Find the points of intersection of the line y = 2x + 1 and the circle x² + y² = 5",
      hints: [
        "Substitute y = 2x + 1 into the circle equation",
        "Solve the resulting quadratic equation for x",
        "Find corresponding y values",
      ],
      solutions: {
        steps: [
          "Substitute y: x² + (2x + 1)² = 5",
          "Expand: x² + 4x² + 4x + 1 = 5",
          "Simplify: 5x² + 4x - 4 = 0",
          "Solve for x: x = [-4 ± √(16 - 4(5)(-4))] / (2*5)",
          "x = (-4 ± √96) / 10",
        ],
        answer: "x ≈ 0.58, y ≈ 2.16 and x ≈ -1.38, y ≈ -1.76",
      },
    },
  ],

  Vectors: [
    {
      id: "vec_1",
      topic: "Vectors",
      difficulty: "easy",
      question: "If a = 3i + 4j and b = i - 2j, find a + b",
      hints: ["Add the i components", "Add the j components", "Combine results"],
      solutions: {
        steps: [
          "a + b = (3+1)i + (4-2)j",
          "a + b = 4i + 2j",
        ],
        answer: "4i + 2j",
      },
    },
    {
      id: "vec_2",
      topic: "Vectors",
      difficulty: "medium",
      question: "Find the magnitude of the vector v = 5i - 12j",
      hints: ["Magnitude |v| = √(x² + y²)", "x = 5, y = -12", "Calculate"],
      solutions: {
        steps: [
          "|v| = √(5² + (-12)²)",
          "|v| = √(25 + 144)",
          "|v| = √169 = 13",
        ],
        answer: "13",
      },
    },
  ],

  Probability: [
    {
      id: "prob_1",
      topic: "Probability",
      difficulty: "easy",
      question: "If P(A) = 0.3 and P(B) = 0.4, and A and B are independent, find P(A ∩ B)",
      hints: ["For independent events, P(A ∩ B) = P(A) × P(B)", "Multiply 0.3 by 0.4"],
      solutions: {
        steps: [
          "Since independent: P(A ∩ B) = P(A) × P(B)",
          "P(A ∩ B) = 0.3 × 0.4",
          "P(A ∩ B) = 0.12",
        ],
        answer: "0.12",
      },
    },
    {
      id: "prob_2",
      topic: "Probability",
      difficulty: "medium",
      question: "In a box of 10 chocolates, 3 are dark and 7 are milk. Two are picked without replacement. What is the probability both are dark?",
      hints: [
        "First pick: 3/10",
        "Second pick (if first was dark): 2/9",
        "Multiply the probabilities",
      ],
      solutions: {
        steps: [
          "P(1st dark) = 3/10",
          "P(2nd dark | 1st dark) = 2/9",
          "P(both dark) = 3/10 × 2/9",
          "P = 6/90 = 1/15",
        ],
        answer: "1/15",
      },
    },
  ],

  Statistics: [
    {
      id: "stat_1",
      topic: "Statistics",
      difficulty: "easy",
      question: "Find the mean of the data set: 5, 8, 12, 15, 20",
      hints: ["Sum all values", "Divide by the number of values (5)"],
      solutions: {
        steps: [
          "Sum = 5 + 8 + 12 + 15 + 20 = 60",
          "Mean = 60 / 5",
          "Mean = 12",
        ],
        answer: "12",
      },
    },
  ],

  Mechanics: [
    {
      id: "mech_1",
      topic: "Mechanics",
      difficulty: "easy",
      question: "A car accelerates from rest to 20m/s in 5 seconds. What is its acceleration?",
      hints: ["Use v = u + at", "u = 0, v = 20, t = 5", "Solve for a"],
      solutions: {
        steps: [
          "v = u + at",
          "20 = 0 + a(5)",
          "a = 20 / 5 = 4 m/s²",
        ],
        answer: "4 m/s²",
      },
    },
    {
      id: "mech_2",
      topic: "Mechanics",
      difficulty: "medium",
      question: "A block of mass 5kg is pulled along a smooth horizontal surface by a force of 15N. What is the acceleration?",
      hints: ["Use F = ma", "F = 15, m = 5", "Solve for a"],
      solutions: {
        steps: [
          "F = ma",
          "15 = 5a",
          "a = 3 m/s²",
        ],
        answer: "3 m/s²",
      },
    },
  ],

  "Exponentials and Logarithms": [
    {
      id: "log_1",
      topic: "Exponentials and Logarithms",
      difficulty: "easy",
      question: "Solve for x: log₂(x) = 5",
      hints: ["Convert to exponential form: x = 2⁵", "Calculate 2 × 2 × 2 × 2 × 2"],
      solutions: {
        steps: [
          "log₂(x) = 5",
          "x = 2⁵",
          "x = 32",
        ],
        answer: "x = 32",
      },
    },
    {
      id: "log_2",
      topic: "Exponentials and Logarithms",
      difficulty: "medium",
      question: "Solve for x: 3²ˣ = 81",
      hints: ["Write 81 as a power of 3: 81 = 3⁴", "Equate the exponents: 2x = 4"],
      solutions: {
        steps: [
          "3²ˣ = 3⁴",
          "2x = 4",
          "x = 2",
        ],
        answer: "x = 2",
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

  "Data Collection": [
    {
      id: "dc_1",
      topic: "Data Collection",
      difficulty: "easy",
      question: "Which of these is a qualitative variable: Weight, Height, Color, or Age?",
      hints: ["Qualitative means descriptive, not numerical", "Think about which one isn't measured in numbers"],
      solutions: {
        steps: [
          "Weight, Height, and Age are all numerical (quantitative)",
          "Color is descriptive (qualitative)",
        ],
        answer: "Color",
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

/**
 * Mark a user's answer for a practice question
 */
router.post("/practice-mark", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { questionId, topic, answer } = req.body;

    if (!topic || !questionId || answer === undefined) {
      return res.status(400).json({
        error: "Topic, questionId, and answer are required",
      });
    }

    const templates = questionTemplates[topic] || [];
    const question = templates.find(q => q.id === questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // AI Marking Logic (Simulated)
    // Enhanced normalization for flexible answer matching
    const normalize = (str: string) => {
      if (!str) return "";
      return str.toLowerCase()
        .replace(/\s+/g, '') // Remove all whitespace
        .replace(/[=]/g, '') // Remove equals signs
        .replace(/and/g, ',') // Replace 'and' with comma for multiple answers
        .replace(/&/g, ',') // Replace '&' with comma
        .replace(/x/g, '') // Remove variable name if typed like 'x=3'
        .replace(/theta/g, '') // Remove 'theta'
        .split(',') // Split by comma
        .sort() // Sort to handle (2,3) vs (3,2)
        .join(','); // Rejoin
    };

    const normalizedUserAnswer = normalize(answer);
    const normalizedCorrectAnswer = normalize(question.solutions.answer);

    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    res.json({
      success: true,
      isCorrect,
      feedback: isCorrect
        ? "Excellent! Your answer matches the solution."
        : `Not quite. Your answer was "${answer}", but the expected result involves ${question.solutions.answer}. Check your working or upload it for analysis!`,
      solution: question.solutions,
      markScheme: question.markScheme
    });
  } catch (error) {
    console.error("Error marking answer:", error);
    res.status(500).json({ error: "Failed to mark answer" });
  }
});

/**
 * Analyze working out image (Simulated)
 */
router.post("/practice-analyze-working", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { questionId, topic, imageData } = req.body;

    if (!topic || !questionId || !imageData) {
      return res.status(400).json({
        error: "Topic, questionId, and imageData are required",
      });
    }

    // AI Vision Analysis (Simulated)
    const topicMistakes: Record<string, string> = {
      Algebra: "I noticed you made a sign error in the second step when moving terms across the equals sign. Remember, when you move a term, its sign must flip!",
      Calculus: "It looks like you forgot the power rule for the constant term. Remember that the derivative of a constant is 0, not the constant itself.",
      Trigonometry: "You used the Sine rule but forgot to account for the ambiguous case (SSA). Check if there's a second possible angle for your triangle.",
      Mechanics: "Your resolution of forces seems correct, but you missed the frictional force acting against the direction of motion. Re-calculate the net force.",
    };

    const feedback = topicMistakes[topic] || "I've analyzed your working. It seems there's a small calculation error mid-way through. Re-check the arithmetic in your second step.";

    res.json({
      success: true,
      feedback,
      mistakeFound: true
    });
  } catch (error) {
    console.error("Error analyzing working:", error);
    res.status(500).json({ error: "Failed to analyze working" });
  }
});

export { router as aiQuestionsRouter };
