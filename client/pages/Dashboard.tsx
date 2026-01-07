import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import {
  Plus,
  TrendingUp,
  BookMarked,
  Target,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Award,
  Zap,
  Brain,
  GraduationCap,
  CheckCircle2,
  Clock,
  Loader,
  Sparkles,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RandomMistake } from "@/components/RandomMistake";
import FeedbackWidget from "@/components/FeedbackWidget";
import { Leaderboard } from "@/components/Leaderboard";
import { topicToChapter } from "@shared/chapters";

interface PerformanceStats {
  overallScore: number;
  paperCount: number;
  topics: Array<{
    topic: string;
    accuracy: number;
    marks_obtained: number;
    marks_available: number;
  }>;
  questionTypeWeakness: Array<{
    question_type: string;
    marks_lost: number;
    accuracy: number;
  }>;
}

interface UserPaper {
  id: number;
  exam_board: string;
  year: number;
  paper_number: number;
  marks_obtained: number;
  total_marks: number;
  submission_date: string;
  percentage: number;
}

interface UserStreak {
  current_streak: number;
  longest_streak: number;
}

interface UserPoints {
  total_points: number;
  level: number;
}

interface UserPlan {
  plan_type: string;
  max_papers: number;
  papers_submitted: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [papers, setPapers] = useState<UserPaper[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem("heatmap-thresholds");
    return saved ? JSON.parse(saved) : { strong: 80, shaky: 60 };
  });
  const isPremium = user?.plan_type === 'premium';

  useEffect(() => {
    localStorage.setItem("heatmap-thresholds", JSON.stringify(thresholds));
  }, [thresholds]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state?.token
        : null;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [statsRes, papersRes, streakRes, pointsRes, planRes] = await Promise.all([
        fetch("/api/performance/stats", { headers }),
        fetch("/api/performance/papers", { headers }),
        fetch("/api/gamification/streaks", { headers }),
        fetch("/api/gamification/points", { headers }),
        fetch("/api/gamification/plan", { headers }),
      ]);

      if (!statsRes.ok || !papersRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const statsData = await statsRes.json();
      const papersData = await papersRes.json();
      const streakData = streakRes.ok ? await streakRes.json() : null;
      const pointsData = pointsRes.ok ? await pointsRes.json() : null;
      const planData = planRes.ok ? await planRes.json() : null;

      setStats(statsData);
      setPapers(papersData);
      setStreak(streakData);
      setPoints(pointsData);
      setPlan(planData);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="p-6 max-w-md">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Unable to Load Dashboard</h2>
              <p className="text-muted-foreground mb-4">
                {error || "We couldn't load your performance data. Please try again."}
              </p>
              <Button onClick={fetchDashboardData}>Retry</Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const overallScore = stats.overallScore;
  const topicCount = stats.topics.length;
  const paperCount = stats.paperCount;

  // Calculate exam readiness metrics
  const sortedTopics = [...stats.topics].sort((a, b) => b.accuracy - a.accuracy);
  const weakestTopics = [...stats.topics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  const strongTopics = sortedTopics.slice(0, 3);
  
  // Topics left before A* (90% required)
  const topicsNeedingWork = stats.topics.filter((t) => t.accuracy < 90).length;
  
  // Predicted grade based on average performance
  const predictedGrade = calculateGrade(overallScore);
  
  // Weakest 10% of content (bottom performing topics)
  const totalQuestions = stats.topics.reduce((sum, t) => sum + t.marks_available, 0);
  let cumulativeMarks = 0;
  const weakest10Percent = stats.topics
    .sort((a, b) => a.accuracy - b.accuracy)
    .filter((topic) => {
      if (cumulativeMarks >= totalQuestions * 0.1) return false;
      cumulativeMarks += topic.marks_available;
      return true;
    });

  // Grade distribution
  const gradeDistribution = [
    { name: "A*", percentage: 83.7 },
    { name: "A", percentage: 68.3 },
    { name: "B", percentage: 55.7 },
    { name: "C", percentage: 43.3 },
    { name: "D", percentage: 31.0 },
    { name: "E", percentage: 18.7 },
  ];

  // Prepare chart data for improvement graph
  const chartData = [...papers]
    .sort((a, b) => new Date(a.submission_date).getTime() - new Date(b.submission_date).getTime())
    .map(p => ({
      date: new Date(p.submission_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: p.percentage,
      name: `${p.year} P${p.paper_number}`
    }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/10">
      <Header />

      <main className="flex-1">
        {/* Dashboard Header */}
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="container max-w-6xl px-4 md:px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Maths Progress</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  A Level Edexcel Maths - Data-driven insights for your exam success
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                {!isPremium && (
                  <Button variant="default" asChild className="gap-2 bg-amber-500 hover:bg-amber-600 border-none shadow-lg animate-pulse hover:animate-none flex-1 sm:flex-none">
                    <Link to="/premium">
                      <Sparkles className="h-4 w-4" />
                      Upgrade to Premium
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild className="gap-2 flex-1 sm:flex-none">
                  <Link to="/export-data">
                    <FileText className="h-4 w-4" />
                    Export for Tutor
                  </Link>
                </Button>
                <Button size="lg" asChild className="gap-2 flex-1 sm:flex-none">
                  <Link to="/add-paper">
                    <Plus className="h-4 w-4" />
                    Add Past Paper
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-6xl px-4 md:px-6 py-8">
          <div className="mb-8">
            <RandomMistake />
          </div>

          {/* Improvement Graph */}
          {papers.length > 1 && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Score Improvement Over Time
              </h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Gamification Section */}
          {streak && points && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Streak Card */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-600">{streak.current_streak} days</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Best: {streak.longest_streak} days
                    </p>
                  </div>
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
              </Card>

              {/* Points Card */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Level</p>
                    <p className="text-3xl font-bold text-blue-600">{points.level}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {points.total_points} points earned
                    </p>
                  </div>
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </Card>

              {/* Plan Card */}
              {plan && (
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Papers Submitted</p>
                      <p className="text-3xl font-bold text-green-600">
                        {plan.papers_submitted} <span className="text-lg">/ {plan.max_papers}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {plan.plan_type === "free" ? "Free Plan" : "Premium Plan"}
                      </p>
                    </div>
                    <BookMarked className="h-6 w-6 text-green-600" />
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Overall Score */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm font-medium text-success">+12%</div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Average Score</p>
              <p className="text-3xl font-bold">{overallScore}%</p>
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(overallScore, 100)}%` }}
                />
              </div>
            </Card>

            {/* Papers Tracked */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookMarked className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Papers Tracked</p>
              <p className="text-3xl font-bold">{paperCount}</p>
              <p className="text-xs text-muted-foreground mt-2">submitted & analyzed</p>
            </Card>

            {/* Topics Mastered */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Topics Mastered</p>
              <p className="text-3xl font-bold">{strongTopics.length}</p>
              <p className="text-xs text-muted-foreground mt-2">80%+ accuracy</p>
            </Card>

            {/* Predicted Grade */}
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Predicted Grade</p>
              <p className="text-3xl font-bold text-amber-600">{predictedGrade}</p>
              <p className="text-xs text-muted-foreground mt-2">at current pace</p>
            </Card>
          </div>

          {/* Exam Readiness Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Exam Readiness Dashboard */}
            <Card className="p-6 border-l-4 border-l-primary">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Exam Readiness Dashboard
              </h2>

              <div className="space-y-5">
                {/* Topics left before A* */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Topics Left Before A*</p>
                  <p className="text-2xl font-bold text-primary">{topicsNeedingWork}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {topicsNeedingWork} topics below 90% accuracy
                  </p>
                </div>

                {/* Weakest 10% of content */}
                {weakest10Percent.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-semibold mb-3">Critical Topics (Weakest 10%)</p>
                    <div className="space-y-2">
                      {weakest10Percent.map((topic) => (
                        <div
                          key={topic.topic}
                          className="flex items-center justify-between p-2 bg-destructive/5 rounded"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground">{topic.topic}</span>
                            {topicToChapter[topic.topic] && (
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                {topicToChapter[topic.topic].replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-destructive">
                            {topic.accuracy}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Topic Heatmap */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Topic Performance Heatmap
                </h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-4">
                      <h4 className="font-medium leading-none">Threshold Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Customize the accuracy thresholds for the heatmap colors.
                      </p>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="strong" className="text-xs">Strong (%)</Label>
                          <Input
                            id="strong"
                            type="number"
                            className="col-span-2 h-8"
                            value={thresholds.strong}
                            onChange={(e) => setThresholds({ ...thresholds, strong: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="shaky" className="text-xs">Shaky (%)</Label>
                          <Input
                            id="shaky"
                            type="number"
                            className="col-span-2 h-8"
                            value={thresholds.shaky}
                            onChange={(e) => setThresholds({ ...thresholds, shaky: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {stats.topics.map((topic) => {
                  let bgColor = "bg-red-100";
                  let textColor = "text-red-700";

                  if (topic.accuracy >= thresholds.strong) {
                    bgColor = "bg-green-100";
                    textColor = "text-green-700";
                  } else if (topic.accuracy >= thresholds.shaky) {
                    bgColor = "bg-yellow-100";
                    textColor = "text-yellow-700";
                  }

                  return (
                    <div
                      key={topic.topic}
                      className={`p-3 rounded-lg ${bgColor} ${textColor} text-center relative overflow-hidden transition-colors duration-300`}
                    >
                      <p className="text-xs font-semibold line-clamp-1">{topic.topic}</p>
                      <p className="text-lg font-bold">{topic.accuracy}%</p>
                      {topicToChapter[topic.topic] && (
                        <p className="text-[8px] font-bold opacity-50 uppercase absolute bottom-1 right-2">
                          {topicToChapter[topic.topic].replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-100" />
                  <span>Strong ({thresholds.strong}%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-yellow-100" />
                  <span>Shaky ({thresholds.shaky}-{thresholds.strong - 1}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-red-100" />
                  <span>Weak (&lt;{thresholds.shaky}%)</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Mistake Intelligence Section */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Mistake Intelligence
            </h2>

            {stats.questionTypeWeakness.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No mistake data yet. Submit more papers to see patterns.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.questionTypeWeakness.slice(0, 5).map((weakness, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{weakness.question_type}</p>
                      <p className="text-sm text-muted-foreground">
                        Losing {weakness.marks_lost} marks
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{weakness.accuracy}%</p>
                      <p className="text-xs text-muted-foreground">accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Smart Revision Mode */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Smart Revision Mode
                </h2>
                <p className="text-muted-foreground mt-1">
                  Focus on these topics today to maximize your improvement:
                </p>
              </div>
              <Button asChild variant="default" className="gap-2">
                <Link to="/practice-questions">
                  <Sparkles className="h-4 w-4" />
                  Try AI Practice Bot
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {weakestTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col">
                      <p className="font-semibold text-foreground text-sm">{topic.topic}</p>
                      {topicToChapter[topic.topic] && (
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">
                          {topicToChapter[topic.topic].replace('_', ' ')}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-destructive/10 text-destructive">
                      Low {topic.accuracy}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Targeted Practice Available</p>
                  <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                    <Link to="/practice-questions">Practice Now</Link>
                  </Button>
                </div>
              ))}
            </div>

            <a
              href="https://www.azimtutors.org/tuition"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary hover:underline flex items-center gap-2"
            >
              Need personalized help? Get A Level maths tutoring today →
            </a>
          </Card>

          {/* Paper Replay Mode */}
          {papers.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Paper Performance Replay
              </h2>

              <div className="space-y-4">
                {papers.slice(0, 5).map((paper) => (
                  <div
                    key={paper.id}
                    className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {paper.exam_board} {paper.year} - Paper {paper.paper_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(paper.submission_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 md:mt-0">
                        <div>
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="text-2xl font-bold text-primary">
                            {paper.marks_obtained}/{paper.total_marks}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Percentage</p>
                          <p className="text-2xl font-bold text-amber-600">{paper.percentage}%</p>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-primary">
                      Review mistakes →
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Upgrade Prompt */}
          {plan?.plan_type === "free" && (
            <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-2">Upgrade to Premium</h3>
                  <p className="text-muted-foreground mb-4">
                    Get unlimited past papers, AI-powered study plans, and weekly revision schedules
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Unlimited paper submissions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      AI revision plans
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Personalized study timetable
                    </li>
                  </ul>
                </div>
                <Button size="lg" asChild className="gap-2">
                  <Link to="/premium">
                    <Sparkles className="h-4 w-4" />
                    Upgrade Now
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Leaderboard Section */}
          <div className="mb-8">
            <Leaderboard />
          </div>

          {/* Recent Papers List */}
          {papers.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">All Submitted Papers</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Paper</th>
                      <th className="text-center py-3 px-4 font-semibold">Date</th>
                      <th className="text-center py-3 px-4 font-semibold">Score</th>
                      <th className="text-center py-3 px-4 font-semibold">Percentage</th>
                      <th className="text-center py-3 px-4 font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {papers.map((paper) => (
                      <tr key={paper.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-4 px-4 font-medium">
                          {paper.exam_board} {paper.year} - Paper {paper.paper_number}
                        </td>
                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {new Date(paper.submission_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-primary">
                          {paper.marks_obtained}/{paper.total_marks}
                        </td>
                        <td className="py-4 px-4 text-center font-bold">{paper.percentage}%</td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">
                            {calculateGrade(paper.percentage)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
      <FeedbackWidget />
    </div>
  );
}

function calculateGrade(percentage: number): string {
  if (percentage >= 83.7) return "A*";
  if (percentage >= 68.3) return "A";
  if (percentage >= 55.7) return "B";
  if (percentage >= 43.3) return "C";
  if (percentage >= 31.0) return "D";
  if (percentage >= 18.7) return "E";
  return "U";
}
