export interface ExamQuestion {
  id: string;
  examBoard: string;
  year: number;
  paperNumber: number;
  questionNumber: number;
  topic: string;
  subTopic?: string;
  chapterId?: string;
  marksAvailable: number;
  difficultyLevel?: "easy" | "medium" | "hard";
}
