import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

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

  // Fetch available papers on mount
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

      // Initialize marks object
      const initialMarks: Record<number, number> = {};
      data.forEach((q: ExamQuestion) => {
        initialMarks[q.id] = 0;
      });
      setMarks(initialMarks);

      setStep("enter");
    } catch (err) {
      setError("Failed to load questions");
      setLoading(false);
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
        setSuccess(true);
        // Reset form
        setStep("select");
        setSelectedPaper(null);
        setQuestions([]);
        setMarks({});
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Add Past Paper</h1>
            <p className="text-muted-foreground">
              Select an exam paper and enter your marks to track your progress
            </p>
          </div>

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
                  <h3 className="font-semibold text-green-900">Success!</h3>
                  <p className="text-sm text-green-700">
                    Paper submitted successfully. Your dashboard has been updated.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {step === "select" && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Select Exam Paper</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading papers...</p>
                </div>
              ) : papers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No papers available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {papers.map((paper) => (
                    <button
                      key={paper.id}
                      onClick={() => handleSelectPaper(paper)}
                      className="p-4 border border-border rounded-lg hover:bg-card hover:border-primary transition-all text-left"
                    >
                      <div className="font-semibold text-foreground">
                        {paper.exam_board} {paper.year}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Paper {paper.paper_number}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          )}

          {step === "enter" && selectedPaper && (
            <Card className="p-6">
              <div className="mb-6">
                <button
                  onClick={() => setStep("select")}
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  ← Back to select paper
                </button>
                <h2 className="text-xl font-semibold mt-4">
                  {selectedPaper.exam_board} {selectedPaper.year} - Paper{" "}
                  {selectedPaper.paper_number}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Questions list */}
                <div className="space-y-4">
                  {questions.map((question) => (
                    <Card
                      key={question.id}
                      className="p-4 border border-border"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">
                            Question {question.question_number}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {question.topic}
                            {question.sub_topic && ` - ${question.sub_topic}`}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Max marks: {question.marks_available}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Label htmlFor={`q-${question.id}`} className="whitespace-nowrap">
                            Marks obtained:
                          </Label>
                          <Input
                            id={`q-${question.id}`}
                            type="number"
                            min="0"
                            max={question.marks_available}
                            value={marks[question.id] || 0}
                            onChange={(e) =>
                              handleMarksChange(question.id, e.target.value)
                            }
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">
                            / {question.marks_available}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Summary */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Marks</div>
                      <div className="text-2xl font-bold">
                        {totalMarks} / {maxMarks}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Percentage</div>
                      <div className="text-2xl font-bold">{percentage}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Grade</div>
                      <div className="text-2xl font-bold">
                        {calculateGrade(parseFloat(percentage as string))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
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
                  >
                    {submitting ? "Submitting..." : "Submit Paper"}
                  </Button>
                </div>
              </form>
            </Card>
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
