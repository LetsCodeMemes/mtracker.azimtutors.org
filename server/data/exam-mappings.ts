/**
 * Exam question to topic mapping system
 * Allows easy association of exam questions to specific topics
 * Designed to scale for multiple subjects (Maths, Physics, Economics, etc.)
 */

export interface ExamQuestion {
  id: string;
  examBoard: string;
  year: number;
  paperNumber: number;
  questionNumber: number;
  topic: string;
  subTopic?: string;
  marksAvailable: number;
  difficultyLevel?: "easy" | "medium" | "hard";
}

/**
 * Edexcel A-Level Maths (8MA0) Question Mapping
 * Papers: 1 (Pure), 2 (Pure), 3 (Stats & Mechanics)
 * Total marks per paper: 100
 */
export const edexcelALevelMaths2024: ExamQuestion[] = [
  // Paper 1 (Pure Mathematics) 2024
  {
    id: "edexcel_2024_p1_q1",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 1,
    topic: "Algebra",
    subTopic: "Surds and Indices",
    marksAvailable: 3,
  },
  {
    id: "edexcel_2024_p1_q2",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 2,
    topic: "Algebra",
    subTopic: "Quadratic Equations",
    marksAvailable: 4,
  },
  {
    id: "edexcel_2024_p1_q3",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 3,
    topic: "Trigonometry",
    subTopic: "Trigonometric Ratios",
    marksAvailable: 6,
  },
  {
    id: "edexcel_2024_p1_q4",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 4,
    topic: "Calculus",
    subTopic: "Differentiation",
    marksAvailable: 8,
  },
  {
    id: "edexcel_2024_p1_q5",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 5,
    topic: "Algebra",
    subTopic: "Sequences and Series",
    marksAvailable: 7,
  },
  {
    id: "edexcel_2024_p1_q6",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 6,
    topic: "Calculus",
    subTopic: "Integration",
    marksAvailable: 8,
  },
  {
    id: "edexcel_2024_p1_q7",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 7,
    topic: "Trigonometry",
    subTopic: "Trigonometric Identities",
    marksAvailable: 9,
  },
  {
    id: "edexcel_2024_p1_q8",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 8,
    topic: "Calculus",
    subTopic: "Differential Equations",
    marksAvailable: 10,
  },
  {
    id: "edexcel_2024_p1_q9",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 9,
    topic: "Algebra",
    subTopic: "Functions",
    marksAvailable: 10,
  },
  {
    id: "edexcel_2024_p1_q10",
    examBoard: "Edexcel",
    year: 2024,
    paperNumber: 1,
    questionNumber: 10,
    topic: "Calculus",
    subTopic: "Applied Calculus",
    marksAvailable: 9,
  },
];

export const edexcelALevelMaths2023: ExamQuestion[] = [
  {
    id: "edexcel_2023_p1_q1",
    examBoard: "Edexcel",
    year: 2023,
    paperNumber: 1,
    questionNumber: 1,
    topic: "Algebra",
    subTopic: "Surds and Indices",
    marksAvailable: 3,
  },
  {
    id: "edexcel_2023_p1_q2",
    examBoard: "Edexcel",
    year: 2023,
    paperNumber: 1,
    questionNumber: 2,
    topic: "Functions",
    subTopic: "Polynomial Functions",
    marksAvailable: 4,
  },
  {
    id: "edexcel_2023_p1_q3",
    examBoard: "Edexcel",
    year: 2023,
    paperNumber: 1,
    questionNumber: 3,
    topic: "Calculus",
    subTopic: "Differentiation",
    marksAvailable: 6,
  },
  {
    id: "edexcel_2023_p1_q4",
    examBoard: "Edexcel",
    year: 2023,
    paperNumber: 1,
    questionNumber: 4,
    topic: "Trigonometry",
    subTopic: "Trigonometric Ratios",
    marksAvailable: 7,
  },
  {
    id: "edexcel_2023_p1_q5",
    examBoard: "Edexcel",
    year: 2023,
    paperNumber: 1,
    questionNumber: 5,
    topic: "Algebra",
    subTopic: "Sequences and Series",
    marksAvailable: 8,
  },
];

/**
 * Edexcel A-Level Maths 2018 Paper 1 (Pure Mathematics)
 */
export const edexcelALevelMaths2018: ExamQuestion[] = [
  {
    id: "edexcel_2018_p1_q1",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 1,
    topic: "Trigonometry",
    subTopic: "Small Angle Approximations",
    marksAvailable: 3,
  },
  {
    id: "edexcel_2018_p1_q2",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 2,
    topic: "Calculus",
    subTopic: "Differentiation - Stationary Points",
    marksAvailable: 7,
  },
  {
    id: "edexcel_2018_p1_q3",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 3,
    topic: "Trigonometry",
    subTopic: "Radians",
    marksAvailable: 4,
  },
  {
    id: "edexcel_2018_p1_q4",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 4,
    topic: "Algebra",
    subTopic: "Iteration",
    marksAvailable: 4,
  },
  {
    id: "edexcel_2018_p1_q5",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 5,
    topic: "Calculus",
    subTopic: "Differentiation - Quotient Rule",
    marksAvailable: 5,
  },
  {
    id: "edexcel_2018_p1_q6",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 6,
    topic: "Coordinate Geometry",
    subTopic: "Circles",
    marksAvailable: 7,
  },
  {
    id: "edexcel_2018_p1_q7",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 7,
    topic: "Calculus",
    subTopic: "Integration - Standard",
    marksAvailable: 7,
  },
  {
    id: "edexcel_2018_p1_q8",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 8,
    topic: "Trigonometry",
    subTopic: "Modelling with Trigonometry",
    marksAvailable: 5,
  },
  {
    id: "edexcel_2018_p1_q9",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 9,
    topic: "Calculus",
    subTopic: "Differentiation - Implicit",
    marksAvailable: 10,
  },
  {
    id: "edexcel_2018_p1_q10",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 10,
    topic: "Calculus",
    subTopic: "Modelling with Differential Equations",
    marksAvailable: 8,
  },
  {
    id: "edexcel_2018_p1_q11",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 11,
    topic: "Algebra",
    subTopic: "Binomial Expansion (A2)",
    marksAvailable: 9,
  },
  {
    id: "edexcel_2018_p1_q12",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 12,
    topic: "Sequences and Series",
    subTopic: "Geometric Sequences",
    marksAvailable: 10,
  },
  {
    id: "edexcel_2018_p1_q13",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 13,
    topic: "Calculus",
    subTopic: "Integration - By Parts",
    marksAvailable: 7,
  },
  {
    id: "edexcel_2018_p1_q14",
    examBoard: "Edexcel",
    year: 2018,
    paperNumber: 1,
    questionNumber: 14,
    topic: "Coordinate Geometry",
    subTopic: "Parametric Equations",
    marksAvailable: 10,
  },
];

/**
 * Get exam questions by exam board, year, and paper
 */
export function getExamQuestions(
  examBoard: string,
  year: number,
  paperNumber: number
): ExamQuestion[] {
  if (examBoard === "Edexcel" && year === 2024) {
    return edexcelALevelMaths2024.filter((q) => q.paperNumber === paperNumber);
  }
  if (examBoard === "Edexcel" && year === 2023) {
    return edexcelALevelMaths2023.filter((q) => q.paperNumber === paperNumber);
  }
  if (examBoard === "Edexcel" && year === 2018) {
    return edexcelALevelMaths2018.filter((q) => q.paperNumber === paperNumber);
  }
  return [];
}

/**
 * Get a single question by ID
 */
export function getQuestionById(id: string): ExamQuestion | undefined {
  const allQuestions = [
    ...edexcelALevelMaths2024,
    ...edexcelALevelMaths2023,
    ...edexcelALevelMaths2018,
  ];
  return allQuestions.find((q) => q.id === id);
}

/**
 * Get all available topics for an exam board and subject
 */
export function getAvailableTopics(
  examBoard: string,
  _subject?: string
): string[] {
  const allQuestions =
    examBoard === "Edexcel"
      ? [...edexcelALevelMaths2024, ...edexcelALevelMaths2023, ...edexcelALevelMaths2018]
      : [];

  const topics = new Set(allQuestions.map((q) => q.topic));
  return Array.from(topics).sort();
}
