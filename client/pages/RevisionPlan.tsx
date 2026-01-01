import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Loader,
  AlertCircle,
  Lock,
  BookOpen,
  Clock,
  Zap,
  Target,
  CheckCircle,
  Calendar,
  Sparkles,
} from "lucide-react";

interface RevisionTask {
  id: string;
  topic: string;
  day: string;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  focusPoints: string[];
}

interface PerformanceStats {
  overallScore: number;
  topics: Array<{
    topic: string;
    accuracy: number;
  }>;
  questionTypeWeakness: Array<{
    question_type: string;
    marks_lost: number;
  }>;
}

const SAMPLE_REVISION_PLAN: RevisionTask[] = [
  {
    id: "1",
    topic: "Calculus",
    day: "Monday",
    duration: 90,
    difficulty: "hard",
    description: "Focus on differentiation techniques and chain rule applications",
    focusPoints: [
      "Chain rule practice problems",
      "Second derivatives",
      "Maximum and minimum problems",
    ],
  },
  {
    id: "2",
    topic: "Statistics",
    day: "Tuesday",
    duration: 60,
    difficulty: "medium",
    description: "Revision of probability distributions",
    focusPoints: [
      "Normal distribution calculations",
      "Confidence intervals",
      "Hypothesis testing basics",
    ],
  },
  {
    id: "3",
    topic: "Algebra",
    day: "Wednesday",
    duration: 45,
    difficulty: "easy",
    description: "Quick review of surds and indices",
    focusPoints: ["Surds simplification", "Index rules", "Logarithms review"],
  },
  {
    id: "4",
    topic: "Trigonometry",
    day: "Thursday",
    duration: 75,
    difficulty: "hard",
    description: "Trigonometric identities and equations",
    focusPoints: [
      "Identity proofs",
      "Solving trigonometric equations",
      "Double angle formulas",
    ],
  },
  {
    id: "5",
    topic: "Calculus",
    day: "Friday",
    duration: 90,
    difficulty: "hard",
    description: "Integration techniques and applications",
    focusPoints: [
      "Integration by substitution",
      "Integration by parts",
      "Definite integrals",
    ],
  },
  {
    id: "6",
    topic: "Mixed Topics",
    day: "Saturday",
    duration: 120,
    difficulty: "hard",
    description: "Full practice paper under timed conditions",
    focusPoints: ["Time management", "Past paper practice", "Exam technique"],
  },
];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const difficultyColors = {
  easy: "bg-green-50 border-green-200",
  medium: "bg-yellow-50 border-yellow-200",
  hard: "bg-red-50 border-red-200",
};
const difficultyTextColors = {
  easy: "text-green-700",
  medium: "text-yellow-700",
  hard: "text-red-700",
};

export default function RevisionPlan() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium] = useState(false); // Set to true for actual premium users
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state?.token
        : null;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch("/api/performance/stats", { headers });
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching performance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    const newChecked = new Set(checkedTasks);
    if (newChecked.has(taskId)) {
      newChecked.delete(taskId);
    } else {
      newChecked.add(taskId);
    }
    setCheckedTasks(newChecked);
  };

  const totalMinutes = SAMPLE_REVISION_PLAN.reduce(
    (sum, task) => sum + task.duration,
    0
  );
  const completedTasks = checkedTasks.size;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading revision plan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Weekly Revision Plan</h1>
              {!isPremium && (
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                  <Lock className="h-4 w-4" />
                  Premium
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              Personalized study schedule based on your performance analysis
            </p>
          </div>

          {!isPremium && (
            <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-4">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground mb-2">
                    Unlock Personalized Study Plans
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get AI-generated revision schedules tailored to your weak areas,
                    optimized study timing, and expert tips to maximize your improvement.
                  </p>
                  <Button>Upgrade to Premium</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Weekly Study Time</span>
              </div>
              <div className="text-3xl font-bold">
                {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Topics to Cover</span>
              </div>
              <div className="text-3xl font-bold">
                {stats?.topics.length || 0}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
              </div>
              <div className="text-3xl font-bold">
                {completedTasks}/{SAMPLE_REVISION_PLAN.length}
              </div>
            </Card>
          </div>

          {/* Key Focus Areas */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              Key Focus Areas
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your recent paper submissions, prioritize these areas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats?.topics
                .sort((a, b) => a.accuracy - b.accuracy)
                .slice(0, 4)
                .map((topic) => (
                  <div
                    key={topic.topic}
                    className="p-4 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {topic.topic}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Current accuracy: {Math.round(topic.accuracy)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-warning">
                          {100 - Math.round(topic.accuracy)}%
                        </div>
                        <p className="text-xs text-muted-foreground">to improve</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Weekly Schedule */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Study Schedule
            </h2>

            <div className="space-y-6">
              {days.map((day) => {
                const dayTasks = SAMPLE_REVISION_PLAN.filter(
                  (task) => task.day === day
                );
                const dayCompleted = dayTasks.filter((task) =>
                  checkedTasks.has(task.id)
                ).length;

                if (dayTasks.length === 0 && day !== "Sunday") {
                  return null;
                }

                if (day === "Sunday") {
                  return (
                    <div key={day} className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold text-foreground mb-2">
                        {day}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Rest day - Review notes or relax
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={day}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground text-lg">
                        {day}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {dayCompleted}/{dayTasks.length} completed
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 border rounded-lg transition-all ${
                            difficultyColors[task.difficulty]
                          }`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checkedTasks.has(task.id)}
                              onChange={() => toggleTaskCompletion(task.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4
                                  className={`font-semibold ${
                                    checkedTasks.has(task.id)
                                      ? "line-through text-muted-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {task.topic}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                                      difficultyTextColors[task.difficulty]
                                    } bg-white/50`}
                                  >
                                    {task.difficulty}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {task.duration}m
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3">
                                {task.description}
                              </p>

                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  Focus on:
                                </p>
                                <ul className="space-y-1">
                                  {task.focusPoints.map((point, idx) => (
                                    <li
                                      key={idx}
                                      className="text-xs text-muted-foreground flex items-start gap-2"
                                    >
                                      <span className="mt-1">•</span>
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI Insights Placeholder */}
          <Card className="p-6 border-primary/20 bg-primary/5 mb-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  AI Study Recommendations (Coming Soon)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our AI will analyze your learning patterns and provide personalized
                  study recommendations, optimal study times, and adaptive difficulty
                  levels to maximize your learning efficiency.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="/add-paper">Add More Papers</a>
            </Button>
            <Button asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
