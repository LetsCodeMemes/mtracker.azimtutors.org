import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "react-router-dom";
import {
  Lightbulb,
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader,
  Sparkles,
  Send,
  Upload,
  Camera,
  MessageSquare,
  AlertCircle,
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
  const { token, user } = useAuth();
  const isPremium = user?.plan_type === 'premium';
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
  const [userTypedAnswer, setUserTypedAnswer] = useState("");
  const [markingFeedback, setMarkingFeedback] = useState<string | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setUserTypedAnswer("");
      setMarkingFeedback(null);
      setAiAnalysis(null);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowSolution(false);
      setShowHint(false);
      setUserTypedAnswer("");
      setMarkingFeedback(null);
      setAiAnalysis(null);
    }
  };

  const checkAnswer = async () => {
    if (!userTypedAnswer) return;
    setIsMarking(true);
    setAiAnalysis(null);

    try {
      const question = questions[currentQuestionIndex];
      const response = await fetch("/api/ai/practice-mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: question.id,
          topic: selectedTopic,
          answer: userTypedAnswer
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMarkingFeedback(data.feedback);
        if (data.isCorrect) {
          handleAnswer(true);
          setShowSolution(true);
        }
      }
    } catch (error) {
      console.error("Failed to mark answer:", error);
    } finally {
      setIsMarking(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      analyzeWorking(file);
    }
  };

  const analyzeWorking = async (file: File) => {
    setIsAnalyzing(true);
    // Simulate uploading and analyzing
    setTimeout(async () => {
      try {
        const question = questions[currentQuestionIndex];
        const response = await fetch("/api/ai/practice-analyze-working", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            questionId: question.id,
            topic: selectedTopic,
            imageData: "base64_simulated_data"
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAiAnalysis(data.feedback);
        }
      } catch (error) {
        console.error("Failed to analyze working:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500);
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

              {!isPremium && (
                <Card className="p-4 mb-8 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-semibold text-amber-900 text-sm">Upgrade to Premium</p>
                        <p className="text-xs text-amber-800">Get unlimited AI questions and detailed explanations</p>
                      </div>
                    </div>
                    <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-700" asChild>
                      <Link to="/premium">Upgrade</Link>
                    </Button>
                  </div>
                </Card>
              )}

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

              {/* Answer Input Area */}
              {!showSolution && (
                <div className="mb-6 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your answer here..."
                      value={userTypedAnswer}
                      onChange={(e) => setUserTypedAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                      className="text-lg py-6"
                    />
                    <Button
                      size="lg"
                      onClick={checkAnswer}
                      disabled={!userTypedAnswer || isMarking}
                      className="px-8"
                    >
                      {isMarking ? <Loader className="animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>

                  {markingFeedback && (
                    <div className={`p-4 rounded-lg flex gap-3 ${markingFeedback.includes('Excellent') ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-rose-50 border border-rose-100 text-rose-800'}`}>
                      {markingFeedback.includes('Excellent') ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{markingFeedback}</p>
                        {!markingFeedback.includes('Excellent') && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white hover:bg-rose-100 border-rose-200 text-rose-700 h-8"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Camera className="w-3 h-3 mr-2" />
                              Upload Working Out
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-rose-600 hover:text-rose-700 h-8"
                              onClick={() => {
                                handleAnswer(false);
                                setShowSolution(true);
                              }}
                            >
                              Show Solution
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />

                  {isAnalyzing && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 animate-pulse">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      <p className="text-sm font-medium">AI is spotting your mistake...</p>
                    </div>
                  )}

                  {aiAnalysis && (
                    <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 shadow-inner">
                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">AI Mistake Analysis</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis}</p>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-xs text-indigo-600 font-bold mt-2"
                            onClick={() => {
                              handleAnswer(false);
                              setShowSolution(true);
                            }}
                          >
                            Show step-by-step solution →
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

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
