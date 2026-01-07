export interface Chapter {
  id: string;
  number: number;
  title: string;
  category: "Pure" | "Statistics" | "Mechanics";
  year: 1 | 2;
}

export const aLevelMathsChapters: Chapter[] = [
  // Pure Year 1
  { id: "p1_c1", number: 1, title: "Algebraic Expressions", category: "Pure", year: 1 },
  { id: "p1_c2", number: 2, title: "Quadratics", category: "Pure", year: 1 },
  { id: "p1_c3", number: 3, title: "Equations and Inequalities", category: "Pure", year: 1 },
  { id: "p1_c4", number: 4, title: "Graphs and Transformations", category: "Pure", year: 1 },
  { id: "p1_c5", number: 5, title: "Straight Line Graphs", category: "Pure", year: 1 },
  { id: "p1_c6", number: 6, title: "Circles", category: "Pure", year: 1 },
  { id: "p1_c7", number: 7, title: "Algebraic Methods", category: "Pure", year: 1 },
  { id: "p1_c8", number: 8, title: "The Binomial Expansion", category: "Pure", year: 1 },
  { id: "p1_c9", number: 9, title: "Trigonometric Ratios", category: "Pure", year: 1 },
  { id: "p1_c10", number: 10, title: "Trigonometric Identities and Equations", category: "Pure", year: 1 },
  { id: "p1_c11", number: 11, title: "Vectors", category: "Pure", year: 1 },
  { id: "p1_c12", number: 12, title: "Differentiation", category: "Pure", year: 1 },
  { id: "p1_c13", number: 13, title: "Integration", category: "Pure", year: 1 },
  { id: "p1_c14", number: 14, title: "Exponentials and Logarithms", category: "Pure", year: 1 },

  // Pure Year 2
  { id: "p2_c1", number: 1, title: "Algebraic Methods", category: "Pure", year: 2 },
  { id: "p2_c2", number: 2, title: "Functions and Graphs", category: "Pure", year: 2 },
  { id: "p2_c3", number: 3, title: "Sequences and Series", category: "Pure", year: 2 },
  { id: "p2_c4", number: 4, title: "Binomial Expansion", category: "Pure", year: 2 },
  { id: "p2_c5", number: 5, title: "Radians", category: "Pure", year: 2 },
  { id: "p2_c6", number: 6, title: "Trigonometric Functions", category: "Pure", year: 2 },
  { id: "p2_c7", number: 7, title: "Trigonometry and Modelling", category: "Pure", year: 2 },
  { id: "p2_c8", number: 8, title: "Parametric Equations", category: "Pure", year: 2 },
  { id: "p2_c9", number: 9, title: "Differentiation", category: "Pure", year: 2 },
  { id: "p2_c10", number: 10, title: "Numerical Methods", category: "Pure", year: 2 },
  { id: "p2_c11", number: 11, title: "Integration", category: "Pure", year: 2 },
  { id: "p2_c12", number: 12, title: "Vectors", category: "Pure", year: 2 },

  // Statistics
  { id: "s1_c1", number: 1, title: "Data Collection", category: "Statistics", year: 1 },
  { id: "s1_c2", number: 2, title: "Measures of Location and Spread", category: "Statistics", year: 1 },
  { id: "s1_c3", number: 3, title: "Representations of Data", category: "Statistics", year: 1 },
  { id: "s1_c4", number: 4, title: "Correlation", category: "Statistics", year: 1 },
  { id: "s1_c5", number: 5, title: "Probability", category: "Statistics", year: 1 },
  { id: "s1_c6", number: 6, title: "Statistical Distributions", category: "Statistics", year: 1 },
  { id: "s1_c7", number: 7, title: "Hypothesis Testing", category: "Statistics", year: 1 },

  // Mechanics
  { id: "m1_c1", number: 1, title: "Modelling in Mechanics", category: "Mechanics", year: 1 },
  { id: "m1_c2", number: 2, title: "Constant Acceleration", category: "Mechanics", year: 1 },
  { id: "m1_c3", number: 3, title: "Forces and Motion", category: "Mechanics", year: 1 },
  { id: "m1_c4", number: 4, title: "Variable Acceleration", category: "Mechanics", year: 1 },
];

/**
 * Mapping from Topic name to Chapter
 */
export const topicToChapter: Record<string, string> = {
  "Algebra": "p1_c1",
  "Functions": "p2_c2",
  "Trigonometry": "p1_c9",
  "Calculus": "p1_c12",
  "Coordinate Geometry": "p1_c5",
  "Sequences and Series": "p2_c3",
  "Vectors": "p1_c11",
  "Data Collection": "s1_c1",
  "Probability": "s1_c5",
  "Statistics": "s1_c6",
  "Mechanics": "m1_c3",
};
