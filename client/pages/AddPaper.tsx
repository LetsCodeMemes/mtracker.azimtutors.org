import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, ChevronRight, Calendar, BookOpen, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ExamQuestion {
  id: number;
  question_number: number;
  topic: string;
  sub_topic: string;
  marks_available: number;
}

interface Paper {
  id: number;
  exam_board: string;
  year: number;
  paper_number: number;
  total_marks: number;
}

interface MistakeLogEntry {
  questionId: number;
  mistakeType: "didnt_understand" | "misread_question" | "algebra_error" | "forgot_formula" | "time_pressure";
}

export default function AddPaper() {
  const [step, setStep] = useState<"select" | "enter">("select");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [marks, setMarks] = useState<Record<number, number>>({});
  const [mistakeLogs, setMistakeLogs] = useState<MistakeLogEntry[]>([]);
  const [submissionDate, setSubmissionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await fetch("/api/papers");
      const data = await response.json();
      setPapers(data);
    } catch (err) {
      setError("Failed to load papers");
    }
  };

  const handleSelectPaper = async (paper: Paper) => {
    setSelectedPaper(paper);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/papers/${paper.id}/questions`);
      const data = await response.json();
      setQuestions(data);

      const initialMarks: Record<number, number> = {};
      data.forEach((q: ExamQuestion) => {
        initialMarks[q.id] = 0;
      });
      setMarks(initialMarks);
      setMistakeLogs([]);
      setStep("enter");
    } catch (err) {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (questionId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setMarks((prev) => ({
      ...prev,
      [questionId]: Math.max(0, numValue),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state?.token
        : null;

      const response = await fetch(`/api/papers/${selectedPaper.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ marks }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user streak after submission
        try {
          await fetch("/api/gamification/streaks/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (streakErr) {
          console.error("Failed to update streak:", streakErr);
        }

        setSuccess(true);
        setStep("select");
        setSelectedPaper(null);
        setQuestions([]);
        setMarks({});
        setMistakeLogs([]);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to submit paper");
      }
    } catch (err) {
      setError("Failed to submit paper");
    } finally {
      setSubmitting(false);
    }
  };

  const totalMarks = Object.values(marks).reduce((a, b) => a + b, 0);
  const maxMarks = questions.reduce((a, q) => a + q.marks_available, 0);
  const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">Add Past Paper</h1>
            <p className="text-lg text-muted-foreground">
              Submit your exam paper and track your progress across topics
            </p>
          </div>

          {/* Messages */}
          {error && (
            <Card className="mb-6 p-4 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {success && (
            <Card className="mb-6 p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900">Success! 🎉</h3>
                  <p className="text-sm text-green-700">
                    Paper submitted. Check your dashboard for insights!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Paper Selection Step */}
          {step === "select" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Select Exam Paper</h2>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading papers...</p>
                    </div>
                  </div>
                ) : papers.length === 0 ? (
                  <Card className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No papers available yet</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {papers.map((paper) => (
                      <button
                        key={paper.id}
                        onClick={() => handleSelectPaper(paper)}
                        className="group relative p-6 border border-border rounded-xl hover:border-primary hover:bg-accent hover:shadow-md transition-all duration-200 text-left overflow-hidden"
                      >
                        {/* Background gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-sm font-medium text-primary mb-1">
                                {paper.exam_board}
                              </div>
                              <div className="font-bold text-lg text-foreground">
                                Paper {paper.paper_number}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{paper.year}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <span className="font-semibold text-foreground">{paper.total_marks}</span>
                            <span>total marks</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Marketing section */}
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-start gap-4">
                  <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold mb-2">Track Your Progress</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Each paper you submit helps us identify your weak topics and generate personalized revision recommendations.
                    </p>
                    <a
                      href="https://www.azimtutors.org/tuition"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Get A Level maths tutoring today →
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Enter Marks Step */}
          {step === "enter" && selectedPaper && (
            <div className="space-y-6">
              {/* Back button and title */}
              <div>
                <button
                  onClick={() => setStep("select")}
                  className="text-primary hover:underline text-sm font-medium flex items-center gap-1 mb-4"
                >
                  ← Back to select paper
                </button>
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedPaper.exam_board} {selectedPaper.year}
                  </h2>
                  <p className="text-muted-foreground">Paper {selectedPaper.paper_number}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Submission date picker */}
                <Card className="p-4 border-border">
                  <Label htmlFor="submission-date" className="font-semibold">
                    Submission Date
                  </Label>
                  <Input
                    id="submission-date"
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="mt-2 max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This helps track your progress over time
                  </p>
                </Card>

                {/* Questions */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Enter Marks</h3>
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <Card
                        key={question.id}
                        className="p-4 border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {question.question_number}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-foreground">
                                  {question.topic}
                                </div>
                                {question.sub_topic && (
                                  <div className="text-sm text-muted-foreground">
                                    {question.sub_topic}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 md:ml-4">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max={question.marks_available}
                                value={marks[question.id] || 0}
                                onChange={(e) =>
                                  handleMarksChange(question.id, e.target.value)
                                }
                                className="w-16 text-center"
                              />
                              <span className="text-sm text-muted-foreground font-medium">
                                / {question.marks_available}
                              </span>
                            </div>
                            {marks[question.id] === question.marks_available && (
                              <span className="text-green-600 text-sm font-semibold">✓</span>
                            )}
                          </div>
                        </div>

                        {/* Progress bar for this question */}
                        {question.marks_available > 0 && (
                          <div className="mt-3 ml-11">
                            <Progress
                              value={(marks[question.id] || 0) / question.marks_available * 100}
                              className="h-1"
                            />
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="text-sm text-muted-foreground mb-1">Marks Achieved</div>
                    <div className="text-3xl font-bold text-foreground">{totalMarks}</div>
                    <div className="text-xs text-muted-foreground mt-1">out of {maxMarks}</div>
                  </Card>

                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-sm text-muted-foreground mb-1">Percentage</div>
                    <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                    <Progress
                      value={parseFloat(percentage as string)}
                      className="mt-2 h-1"
                    />
                  </Card>

                  <Card className="p-4 bg-amber-50 border-amber-200">
                    <div className="text-sm text-muted-foreground mb-1">Estimated Grade</div>
                    <div className="text-3xl font-bold text-amber-600">
                      {calculateGrade(parseFloat(percentage as string))}
                    </div>
                  </Card>

                  <Card className="p-4 bg-emerald-50 border-emerald-200">
                    <div className="text-sm text-muted-foreground mb-1">Questions Done</div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {questions.filter((q) => marks[q.id] > 0).length}/{questions.length}
                    </div>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("select")}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                    size="lg"
                  >
                    {submitting ? "Submitting..." : "Submit Paper & View Insights"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A*";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 40) return "E";
  return "U";
}
