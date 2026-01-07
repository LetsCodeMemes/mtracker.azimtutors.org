import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  Lightbulb,
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader,
} from "lucide-react";

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

interface QuestionSet {
  success: boolean;
  topic: string;
  difficulty: string;
  questions: PracticeQuestion[];
  totalQuestions: number;
}

export default function PracticeQuestions() {
  const { token } = useAuth();
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("mixed");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<"select" | "practice">("select");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/ai/practice-topics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTopics(data.topics);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    }
  };

  const generateQuestions = async (topic: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/practice-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          difficulty: selectedDifficulty === "mixed" ? null : selectedDifficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch questions");
      }

      const data: QuestionSet = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setShowSolution(false);
        setShowHint(false);
        setUserAnswers({});
        setStep("practice");
      } else {
        console.warn("No questions returned from API");
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    const question = questions[currentQuestionIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [question.id]: isCorrect,
    }));

    try {
      await fetch("/api/ai/practice-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: question.id,
          topic: selectedTopic,
          isCorrect,
          timeSpent: 120,
        }),
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowSolution(false);
      setShowHint(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowSolution(false);
      setShowHint(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "hard":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (step === "select") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Lightbulb className="w-8 h-8 text-amber-500" />
                  <h1 className="text-4xl font-bold text-slate-900">
                    AI Practice Questions
                  </h1>
                </div>
                <p className="text-lg text-slate-600">
                  Master each topic with AI-generated practice questions tailored to your learning level
                </p>
              </div>

              {/* Difficulty Selection */}
              <Card className="p-6 mb-8 bg-white border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Select Difficulty Level
                </h2>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { value: "mixed", label: "Mixed", icon: "🎯" },
                    { value: "easy", label: "Easy", icon: "🟢" },
                    { value: "medium", label: "Medium", icon: "🟡" },
                    { value: "hard", label: "Hard", icon: "🔴" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedDifficulty(option.value)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        selectedDifficulty === option.value
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {option.icon} {option.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Topic Selection */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Choose a Topic
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedTopic(topic);
                        generateQuestions(topic);
                      }}
                      disabled={loading}
                      className="p-6 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg mb-1">
                            {topic}
                          </h3>
                          <p className="text-sm text-slate-600">
                            Master key concepts and techniques
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = currentQuestion ? userAnswers[currentQuestion.id] : false;
  const correctCount = Object.values(userAnswers).filter(Boolean).length;

  if (step === "practice" && !currentQuestion) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Questions Found</h2>
            <p className="text-slate-600 mb-6">
              We couldn't find any questions for {selectedTopic} at the {selectedDifficulty} level.
            </p>
            <Button onClick={() => setStep("select")} className="w-full">
              Back to Topic Selection
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-slate-900">
                  {selectedTopic}
                </h2>
                <span className="text-sm text-slate-600">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="p-8 bg-white border border-slate-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    currentQuestion.difficulty
                  )}`}
                >
                  {currentQuestion.difficulty.toUpperCase()}
                </span>
                <span className="text-sm text-slate-600">
                  Question {currentQuestionIndex + 1}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                {currentQuestion.question}
              </h3>

              {/* Hints Section */}
              {!showSolution && (
                <div className="mb-6">
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <Lightbulb className="w-5 h-5" />
                      Show Hint
                    </button>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <p className="font-semibold text-amber-900 mb-2">
                        💡 Hint:
                      </p>
                      {currentQuestion.hints.map((hint, idx) => (
                        <p key={idx} className="text-amber-800 mb-2">
                          {idx + 1}. {hint}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Solution Section */}
              {showSolution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-green-900 mb-4">
                    ✓ Solution
                  </h4>
                  <div className="space-y-3">
                    {currentQuestion.solutions.steps.map((step, idx) => (
                      <p key={idx} className="text-green-800">
                        <span className="font-semibold">Step {idx + 1}:</span>{" "}
                        {step}
                      </p>
                    ))}
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-green-900">
                        <span className="font-semibold">Answer:</span>{" "}
                        {currentQuestion.solutions.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Answer Buttons */}
              {!isAnswered && !showSolution && (
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => {
                      handleAnswer(true);
                      setShowSolution(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    I Got It Right
                  </button>
                  <button
                    onClick={() => {
                      handleAnswer(false);
                      setShowSolution(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    I Need Help
                  </button>
                </div>
              )}

              {isAnswered && (
                <div
                  className={`p-4 rounded-lg mb-6 ${
                    userAnswers[currentQuestion.id]
                      ? "bg-green-50 border border-green-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <p
                    className={
                      userAnswers[currentQuestion.id]
                        ? "text-green-800"
                        : "text-blue-800"
                    }
                  >
                    {userAnswers[currentQuestion.id]
                      ? "✓ Great work! Review the solution below to solidify your understanding."
                      : "✓ Review the solution below and try a similar question next time!"}
                  </p>
                </div>
              )}
            </Card>

            {/* Navigation and Stats */}
            <div className="space-y-4">
              {/* Stats */}
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Progress</p>
                      <p className="font-semibold text-slate-900">
                        {correctCount}/{questions.length} correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Accuracy</p>
                    <p className="font-semibold text-slate-900">
                      {questions.length > 0
                        ? Math.round(
                            (correctCount / Object.keys(userAnswers).length) *
                              100
                          ) || 0
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium disabled:opacity-50 transition-colors"
                >
                  ← Previous
                </button>
                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={() => setStep("select")}
                    className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
                  >
                    Start New Topic
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
