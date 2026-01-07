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

import { aLevelMathsChapters, Chapter } from "@shared/chapters";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

function TopicItem({ chapter, isCompleted, onToggle }: { chapter: Chapter, isCompleted: boolean, onToggle: () => void }) {
  return (
    <div
      className={`p-4 border rounded-xl transition-all flex items-center gap-4 ${
        isCompleted ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-card border-border hover:border-primary/50'
      }`}
    >
      <Checkbox
        id={chapter.id}
        checked={isCompleted}
        onCheckedChange={onToggle}
        className="w-5 h-5 rounded-md"
      />
      <div className="flex-1 min-w-0">
        <label
          htmlFor={chapter.id}
          className={`text-sm font-semibold block truncate cursor-pointer ${isCompleted ? 'text-emerald-900' : 'text-foreground'}`}
        >
          {chapter.number}. {chapter.title}
        </label>
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
          {chapter.category} Year {chapter.year}
        </span>
      </div>
      {isCompleted && (
        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      )}
    </div>
  );
}

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
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPerformanceData();
    fetchCompletedTopics();
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

  const fetchCompletedTopics = async () => {
    try {
      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state?.token
        : null;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch("/api/performance/completed-topics", { headers });
      if (response.ok) {
        const data = await response.json();
        setCompletedTopicIds(new Set(data.completedTopicIds));
      }
    } catch (err) {
      console.error("Error fetching completed topics:", err);
    }
  };

  const toggleTopicCompletion = async (topicId: string) => {
    const isCompleted = completedTopicIds.has(topicId);
    const newCompleted = new Set(completedTopicIds);

    if (isCompleted) {
      newCompleted.delete(topicId);
    } else {
      newCompleted.add(topicId);
    }

    setCompletedTopicIds(newCompleted);

    try {
      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state?.token
        : null;

      await fetch("/api/performance/toggle-topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topicId, completed: !isCompleted }),
      });
    } catch (err) {
      console.error("Error toggling topic:", err);
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

  const pureYear1 = aLevelMathsChapters.filter(c => c.category === "Pure" && c.year === 1);
  const pureYear2 = aLevelMathsChapters.filter(c => c.category === "Pure" && c.year === 2);
  const statsChapters = aLevelMathsChapters.filter(c => c.category === "Statistics");
  const mechChapters = aLevelMathsChapters.filter(c => c.category === "Mechanics");

  const totalChapters = aLevelMathsChapters.length;
  const completedChaptersCount = completedTopicIds.size;
  const progressPercentage = Math.round((completedChaptersCount / totalChapters) * 100);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                <span className="text-sm text-muted-foreground">Syllabus Progress</span>
              </div>
              <div className="text-3xl font-bold">
                {progressPercentage}%
              </div>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-muted-foreground">Topics Mastered</span>
              </div>
              <div className="text-3xl font-bold">
                {completedChaptersCount}/{totalChapters}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-muted-foreground">Weak Topics</span>
              </div>
              <div className="text-3xl font-bold">
                {stats?.topics.filter(t => t.accuracy < 60).length || 0}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Topics List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Syllabus Checklist
                </h2>

                <Tabs defaultValue="Pure" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-8">
                    <TabsTrigger value="Pure">Pure</TabsTrigger>
                    <TabsTrigger value="Statistics">Statistics</TabsTrigger>
                    <TabsTrigger value="Mechanics">Mechanics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="Pure" className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Year 1</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pureYear1.map((chapter) => (
                          <TopicItem
                            key={chapter.id}
                            chapter={chapter}
                            isCompleted={completedTopicIds.has(chapter.id)}
                            onToggle={() => toggleTopicCompletion(chapter.id)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Year 2</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pureYear2.map((chapter) => (
                          <TopicItem
                            key={chapter.id}
                            chapter={chapter}
                            isCompleted={completedTopicIds.has(chapter.id)}
                            onToggle={() => toggleTopicCompletion(chapter.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="Statistics">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {statsChapters.map((chapter) => (
                        <TopicItem
                          key={chapter.id}
                          chapter={chapter}
                          isCompleted={completedTopicIds.has(chapter.id)}
                          onToggle={() => toggleTopicCompletion(chapter.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="Mechanics">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mechChapters.map((chapter) => (
                        <TopicItem
                          key={chapter.id}
                          chapter={chapter}
                          isCompleted={completedTopicIds.has(chapter.id)}
                          onToggle={() => toggleTopicCompletion(chapter.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Weekly Schedule */}
              <Card className="p-6 mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Schedule
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
            </div>

            {/* Right Column - Recommendations */}
            <div className="space-y-6">
              {/* Key Focus Areas */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-warning" />
                  Focus Areas
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Based on paper analysis, these need attention:
                </p>
                <div className="space-y-3">
                  {stats?.topics
                    .sort((a, b) => a.accuracy - b.accuracy)
                    .slice(0, 4)
                    .map((topic) => (
                      <div
                        key={topic.topic}
                        className="p-3 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-xs truncate">
                            {topic.topic}
                          </h3>
                          <div className="text-xs font-bold text-destructive">
                            {Math.round(topic.accuracy)}%
                          </div>
                        </div>
                        <Progress value={topic.accuracy} className="h-1 bg-muted" />
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="p-6 border-amber-200 bg-amber-50">
                <h3 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Revision Tip
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Focus on <strong>Topic interleaving</strong>: Mix different types of problems in one study session rather than doing all of one type. This improves long-term retention!
                </p>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/add-paper">Add More Papers</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>

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
