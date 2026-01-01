import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Plus,
  TrendingUp,
  BookMarked,
  Target,
  AlertCircle,
  ArrowUpRight,
  Clock,
  Loader,
} from "lucide-react";

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

export default function Dashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [papers, setPapers] = useState<UserPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state?.token
        : null;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [statsRes, papersRes] = await Promise.all([
        fetch("/api/performance/stats", { headers }),
        fetch("/api/performance/papers", { headers }),
      ]);

      if (!statsRes.ok || !papersRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const statsData = await statsRes.json();
      const papersData = await papersRes.json();

      setStats(statsData);
      setPapers(papersData);
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

  // Calculate additional metrics
  const improvementTrend = 8; // This could be calculated from progress data
  const topicCount = stats.topics.length;
  const overallScore = stats.overallScore;
  const paperCount = stats.paperCount;

  const progressData = [
    { month: "Sept", score: 65 },
    { month: "Oct", score: 68 },
    { month: "Nov", score: 70 },
    { month: "Dec", score: 72 },
  ];

  const topicBreakdown = [
    { topic: "Algebra", marks: 32, marksLost: 8, accuracy: 80 },
    { topic: "Calculus", marks: 28, marksLost: 12, accuracy: 70 },
    { topic: "Statistics", marks: 20, marksLost: 10, accuracy: 67 },
    { topic: "Geometry", marks: 15, marksLost: 5, accuracy: 75 },
    { topic: "Trigonometry", marks: 5, marksLost: 3, accuracy: 63 },
  ];

  const topicAccuracyData = [
    { name: "Algebra", value: 80, color: "#DC2626" },
    { name: "Calculus", value: 70, color: "#991B1B" },
    { name: "Statistics", value: 67, color: "#F87171" },
    { name: "Geometry", value: 75, color: "#7F1D1D" },
  ];

  const papersData = [
    { id: 1, name: "Edexcel Paper 1 (2024)", date: "Dec 15", score: 75, total: 100 },
    { id: 2, name: "Edexcel Paper 2 (2024)", date: "Dec 10", score: 68, total: 100 },
    { id: 3, name: "Edexcel Paper 1 (2023)", date: "Dec 5", score: 70, total: 100 },
    { id: 4, name: "Edexcel Paper 2 (2023)", date: "Nov 28", score: 65, total: 100 },
    { id: 5, name: "Edexcel Paper 1 (2023)", date: "Nov 20", score: 68, total: 100 },
  ];

  const weakestTopics = [
    { topic: "Calculus", marksLost: 12, priority: "High" },
    { topic: "Statistics", marksLost: 10, priority: "High" },
    { topic: "Trigonometry", marksLost: 3, priority: "Medium" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Dashboard Header */}
        <div className="border-b border-border">
          <div className="container max-w-6xl px-4 md:px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Maths Progress</h1>
                <p className="text-muted-foreground">
                  Track your A Level Edexcel Maths papers and identify areas to improve.
                </p>
              </div>
              <Button size="lg" asChild className="gap-2">
                <Link to="#add-paper">
                  <Plus className="h-4 w-4" />
                  Add Past Paper
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container max-w-6xl px-4 md:px-6 py-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Overall Score */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-success text-sm font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  {improvementTrend}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
              <p className="text-3xl font-bold">{overallScore}%</p>
              <p className="text-xs text-muted-foreground mt-2">Across all papers</p>
            </Card>

            {/* Papers Tracked */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <BookMarked className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex items-center gap-1 text-foreground text-sm font-medium">
                  {paperCount}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Papers Tracked</p>
              <p className="text-3xl font-bold">{paperCount}</p>
              <p className="text-xs text-muted-foreground mt-2">This month</p>
            </Card>

            {/* Topics Covered */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div className="flex items-center gap-1 text-foreground text-sm font-medium">
                  5
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Topics Covered</p>
              <p className="text-3xl font-bold">5</p>
              <p className="text-xs text-muted-foreground mt-2">Unique topics</p>
            </Card>

            {/* Average Time */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Study Time</p>
              <p className="text-3xl font-bold">24h</p>
              <p className="text-xs text-muted-foreground mt-2">Total this month</p>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Progress Chart */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-6">Progress Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Topic Accuracy Pie */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Topic Accuracy</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topicAccuracyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {topicAccuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {topicAccuracyData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Topic Breakdown */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6">Topic Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Topic</th>
                    <th className="text-center py-3 px-4 font-semibold">Marks Got</th>
                    <th className="text-center py-3 px-4 font-semibold">Marks Lost</th>
                    <th className="text-center py-3 px-4 font-semibold">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {topicBreakdown.map((topic, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/30">
                      <td className="py-4 px-4 font-medium">{topic.topic}</td>
                      <td className="py-4 px-4 text-center text-success font-semibold">
                        {topic.marks}
                      </td>
                      <td className="py-4 px-4 text-center text-destructive font-semibold">
                        {topic.marksLost}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex-1 max-w-xs bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${topic.accuracy}%` }}
                            />
                          </div>
                          <span className="font-semibold text-right">{topic.accuracy}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* What to Revise Next */}
          <Card className="p-6 border-l-4 border-l-warning mb-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-3">What To Revise Next</h2>
                <p className="text-muted-foreground mb-4">
                  Based on your analysis, prioritize these topics to maximize your score improvement:
                </p>
                <div className="space-y-3">
                  {weakestTopics.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{item.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          Currently losing {item.marksLost} marks
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.priority === "High"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {item.priority} Priority
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Papers */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">Recent Papers</h2>
            <div className="space-y-4">
              {papersData.map((paper) => (
                <div
                  key={paper.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-foreground">{paper.name}</p>
                    <p className="text-sm text-muted-foreground">{paper.date}</p>
                  </div>
                  <div className="mt-3 md:mt-0 flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {paper.score}
                        <span className="text-sm text-muted-foreground ml-1">/ {paper.total}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
