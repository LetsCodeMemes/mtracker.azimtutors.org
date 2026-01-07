/**
 * Exam question to topic mapping system
 * Allows easy association of exam questions to specific topics
 * Designed to scale for multiple subjects (Maths, Physics, Economics, etc.)
 */

import { ExamQuestion } from "./types";

import {
  edexcelALevelMaths2018_P2,
  edexcelALevelMaths2019,
  edexcelALevelMaths2020,
  edexcelALevelMaths2021,
  edexcelALevelMaths2022,
  edexcelALevelMaths2023_Full,
} from "./exam-mappings-full";

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
  { id: "ed_2018_p1_q1", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 1, topic: "Small Angle Approximations", marksAvailable: 3 },
  { id: "ed_2018_p1_q2", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 2, topic: "Differentiation - Stationary Points", marksAvailable: 7 },
  { id: "ed_2018_p1_q3", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 3, topic: "Radians", marksAvailable: 4 },
  { id: "ed_2018_p1_q4", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 4, topic: "Iteration", marksAvailable: 4 },
  { id: "ed_2018_p1_q5", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 5, topic: "Differentiation - Quotient Rule", marksAvailable: 5 },
  { id: "ed_2018_p1_q6", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 6, topic: "Circles", marksAvailable: 7 },
  { id: "ed_2018_p1_q7", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 7, topic: "Integration - Standard", marksAvailable: 7 },
  { id: "ed_2018_p1_q8", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 8, topic: "Modelling with Trigonometry", marksAvailable: 5 },
  { id: "ed_2018_p1_q9", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 9, topic: "Differentiation - Implicit", marksAvailable: 10 },
  { id: "ed_2018_p1_q10", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 10, topic: "Modelling with Differential Equations", marksAvailable: 8 },
  { id: "ed_2018_p1_q11", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 11, topic: "Binomial Expansion (A2)", marksAvailable: 9 },
  { id: "ed_2018_p1_q12", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 12, topic: "Geometric Sequences", marksAvailable: 10 },
  { id: "ed_2018_p1_q13", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 13, topic: "Integration - By Parts", marksAvailable: 7 },
  { id: "ed_2018_p1_q14", examBoard: "Edexcel", year: 2018, paperNumber: 1, questionNumber: 14, topic: "Parametric Equations", marksAvailable: 10 },
];

/**
 * Get exam questions by exam board, year, and paper
 */
export function getExamQuestions(
  examBoard: string,
  year: number,
  paperNumber: number
): ExamQuestion[] {
  const allData = [
    ...edexcelALevelMaths2024,
    ...edexcelALevelMaths2023,
    ...edexcelALevelMaths2023_Full,
    ...edexcelALevelMaths2022,
    ...edexcelALevelMaths2021,
    ...edexcelALevelMaths2020,
    ...edexcelALevelMaths2019,
    ...edexcelALevelMaths2018,
    ...edexcelALevelMaths2018_P2,
  ];

  if (examBoard === "Edexcel") {
    return allData.filter((q) => q.year === year && q.paperNumber === paperNumber);
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
    ...edexcelALevelMaths2023_Full,
    ...edexcelALevelMaths2022,
    ...edexcelALevelMaths2021,
    ...edexcelALevelMaths2020,
    ...edexcelALevelMaths2019,
    ...edexcelALevelMaths2018,
    ...edexcelALevelMaths2018_P2,
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
      ? [
          ...edexcelALevelMaths2024,
          ...edexcelALevelMaths2023,
          ...edexcelALevelMaths2023_Full,
          ...edexcelALevelMaths2022,
          ...edexcelALevelMaths2021,
          ...edexcelALevelMaths2020,
          ...edexcelALevelMaths2019,
          ...edexcelALevelMaths2018,
          ...edexcelALevelMaths2018_P2,
        ]
      : [];

  const topics = new Set(allQuestions.map((q) => q.topic));
  return Array.from(topics).sort();
}
