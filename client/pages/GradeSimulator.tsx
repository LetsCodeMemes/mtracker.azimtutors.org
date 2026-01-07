import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Loader,
  AlertCircle,
  TrendingUp,
  Target,
  ArrowUp,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Topic {
  topic: string;
  accuracy: number;
  marks_available: number;
  marks_obtained: number;
}

interface SimulationData {
  topic: string;
  current: number;
  simulated: number;
}

interface GradeThreshold {
  grade: string;
  minPercentage: number;
  target: string;
  color: string;
}

const GRADE_THRESHOLDS: GradeThreshold[] = [
  { grade: "A*", minPercentage: 90, target: "Outstanding", color: "bg-green-600" },
  { grade: "A", minPercentage: 80, target: "Excellent", color: "bg-green-500" },
  { grade: "B", minPercentage: 70, target: "Good", color: "bg-blue-500" },
  { grade: "C", minPercentage: 60, target: "Satisfactory", color: "bg-yellow-500" },
  { grade: "D", minPercentage: 50, target: "Pass", color: "bg-orange-500" },
  { grade: "E", minPercentage: 40, target: "Borderline", color: "bg-red-500" },
];

// Key mistakes by topic
const KEY_MISTAKES_BY_TOPIC: Record<string, string[]> = {
  "Calculus": [
    "Forgetting chain rule in composite functions",
    "Sign errors in integration",
    "Not checking limits in definite integrals",
    "Miscalculating stationary points",
    "Wrong application of product/quotient rules",
  ],
  "Algebra": [
    "Expanding brackets incorrectly",
    "Losing marks on rearrangement",
    "Sign errors in simultaneous equations",
    "Not simplifying final answers",
    "Arithmetic errors in substitution",
  ],
  "Trigonometry": [
    "Confusing radians and degrees",
    "Missing negative angles in range",
    "Incorrect use of trig identities",
    "Rounding too early in calculations",
    "Not checking angle values are in range",
  ],
  "Coordinate Geometry": [
    "Wrong gradient formula application",
    "Circle equation mistakes",
    "Parametric form conversion errors",
    "Distance formula errors",
    "Not checking intersection conditions",
  ],
  "Sequences and Series": [
    "Wrong common ratio/difference identification",
    "Sum formula application errors",
    "Not recognizing convergence conditions",
    "Indexing errors in series",
    "Forgetting domain restrictions",
  ],
  "Statistics": [
    "Misidentifying distribution types",
    "Normal approximation mistakes",
    "Incorrect use of probability formulas",
    "Hypothesis test errors",
    "Confidence interval calculation mistakes",
  ],
  "Mechanics": [
    "Forgetting resistance forces",
    "Incorrect acceleration formulas",
    "Newton's laws application errors",
    "Energy conservation mistakes",
    "Projectile motion calculation errors",
  ],
};

export default function GradeSimulator() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [improvements, setImprovements] = useState<Record<string, number>>({});
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [currentOverall, setCurrentOverall] = useState(0);
  const [projectedOverall, setProjectedOverall] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    fetchTopicData();
  }, []);

  const fetchTopicData = async () => {
    try {
      const token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state?.token
        : null;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch("/api/performance/stats", { headers });
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setTopics(data.topics);

      const initialImprovements: Record<string, number> = {};
      data.topics.forEach((topic: Topic) => {
        initialImprovements[topic.topic] = 0;
      });
      setImprovements(initialImprovements);

      setCurrentOverall(data.overallScore);
      setProjectedOverall(data.overallScore);
    } catch (err) {
      setError("Failed to load topic data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMarksNeededForGrade = (targetGrade: string): number => {
    const threshold = GRADE_THRESHOLDS.find((g) => g.grade === targetGrade);
    if (!threshold) return 0;

    // Estimate total marks (usually 300 for A-Level Maths)
    const totalMarks = 300;
    return Math.ceil((threshold.minPercentage / 100) * totalMarks);
  };

  const handleImprovement = (topicName: string, value: number) => {
    const newImprovements = { ...improvements, [topicName]: value };
    setImprovements(newImprovements);

    let totalCurrentMarks = 0;
    let totalPossibleMarks = 0;
    let totalProjectedMarks = 0;

    topics.forEach((topic) => {
      const currentAccuracy = topic.marks_obtained / topic.marks_available;
      const improvement = newImprovements[topic.topic] || 0;
      const projectedAccuracy = Math.min(1, currentAccuracy + improvement / 100);

      totalCurrentMarks += topic.marks_obtained;
      totalProjectedMarks += topic.marks_available * projectedAccuracy;
      totalPossibleMarks += topic.marks_available;
    });

    const newProjectedOverall =
      totalPossibleMarks > 0
        ? Math.round((totalProjectedMarks / totalPossibleMarks) * 100)
        : currentOverall;

    setProjectedOverall(newProjectedOverall);

    const simData = topics.map((topic) => ({
      topic: topic.topic.substring(0, 10),
      current: Math.round(topic.marks_obtained),
      simulated: Math.round(
        topic.marks_available *
          Math.min(
            1,
            topic.marks_obtained / topic.marks_available +
              (newImprovements[topic.topic] || 0) / 100
          )
      ),
    }));
    setSimulationData(simData);
  };

  const resetSimulation = () => {
    const initialImprovements: Record<string, number> = {};
    topics.forEach((topic) => {
      initialImprovements[topic.topic] = 0;
    });
    setImprovements(initialImprovements);
    setProjectedOverall(currentOverall);
    setSimulationData([]);
    setSelectedTopic(null);
  };

  const gradeMapping = (percentage: number) => {
    if (percentage >= 90) return "A*";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= 40) return "E";
    return "U";
  };

  const getTopicMistakes = (topicName: string): string[] => {
    // Check for exact match first
    if (KEY_MISTAKES_BY_TOPIC[topicName]) {
      return KEY_MISTAKES_BY_TOPIC[topicName];
    }
    // Check for partial match
    for (const [key, mistakes] of Object.entries(KEY_MISTAKES_BY_TOPIC)) {
      if (topicName.includes(key) || key.includes(topicName.split(" ")[0])) {
        return mistakes;
      }
    }
    return [
      "Practice more problems",
      "Review key formulas",
      "Check worked examples",
      "Try similar past paper questions",
      "Seek tutor help if still struggling",
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading simulator...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || topics.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="p-6 max-w-md">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Data Available</h2>
              <p className="text-muted-foreground mb-4">
                {error || "Submit some papers first to use the grade simulator."}
              </p>
              <Button asChild>
                <a href="/add-paper">Add Past Paper</a>
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const gradeDifference = projectedOverall - currentOverall;
  const currentGrade = gradeMapping(currentOverall);
  const projectedGrade = gradeMapping(projectedOverall);
  const lowestTopic = [...topics].sort((a, b) => a.accuracy - b.accuracy)[0];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/10">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Grade Uplift Simulator</h1>
            <p className="text-muted-foreground">
              Simulate your performance improvements and see exactly what you need to reach your target grade
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Current Score */}
            <Card className="p-6">
              <h3 className="text-sm text-muted-foreground font-semibold mb-4">Current Score</h3>
              <div className="text-4xl font-bold text-primary mb-2">{currentOverall}%</div>
              <div className="text-2xl font-bold text-amber-600">{currentGrade}</div>
              <div className="text-xs text-muted-foreground mt-2">Across all papers</div>
            </Card>

            {/* Projected Score */}
            <Card className="p-6 border-2 border-green-500/50 bg-green-50">
              <h3 className="text-sm text-muted-foreground font-semibold mb-4">Projected Score</h3>
              <div className="text-4xl font-bold text-green-600 mb-2">{projectedOverall}%</div>
              <div className="text-2xl font-bold text-green-600">{projectedGrade}</div>
              <div className="text-xs text-green-700 mt-2">If improvements made</div>
            </Card>

            {/* Improvement */}
            <Card className={`p-6 ${gradeDifference > 0 ? "bg-blue-50" : "bg-muted"}`}>
              <h3 className="text-sm text-muted-foreground font-semibold mb-4">Improvement</h3>
              <div
                className={`text-4xl font-bold mb-2 ${
                  gradeDifference > 0 ? "text-blue-600" : "text-muted-foreground"
                }`}
              >
                {gradeDifference > 0 ? "+" : ""}{gradeDifference}%
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {gradeDifference > 0
                  ? `Grade increase: ${currentGrade} → ${projectedGrade}`
                  : "Adjust sliders to improve"}
              </div>
            </Card>

            {/* Weakest Topic */}
            <Card className="p-6 bg-orange-50">
              <h3 className="text-sm text-muted-foreground font-semibold mb-4">Priority Topic</h3>
              <div className="text-sm font-bold text-orange-600 mb-2">{lowestTopic.topic}</div>
              <div className="text-2xl font-bold text-orange-600">{lowestTopic.accuracy}%</div>
              <div className="text-xs text-orange-700 mt-2">Lowest accuracy</div>
            </Card>
          </div>

          {/* Grade Thresholds Guide */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Grade Thresholds</h2>
            <div className="space-y-3">
              {GRADE_THRESHOLDS.map((threshold) => (
                <div key={threshold.grade} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-8 rounded ${threshold.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{threshold.grade}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground">{threshold.target}</span>
                      <span className="text-sm text-muted-foreground">{threshold.minPercentage}%+</span>
                    </div>
                    <Progress value={threshold.minPercentage} className="h-1.5" />
                  </div>
                  {projectedOverall >= threshold.minPercentage && currentOverall < threshold.minPercentage && (
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Simulation Chart */}
          {simulationData.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-semibold mb-6">Topic Comparison</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="topic" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="current" fill="#DC2626" name="Current Marks" />
                  <Bar dataKey="simulated" fill="#10B981" name="Projected Marks" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Topic Sliders */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6">Adjust Topic Performance</h2>
            <div className="space-y-8">
              {topics.sort((a, b) => a.accuracy - b.accuracy).map((topic) => (
                <div key={topic.topic}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {topic.topic}
                        {topic.accuracy < 60 && (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current: {Math.round(topic.marks_obtained)} / {topic.marks_available} marks ({Math.round(topic.accuracy)}%)
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-primary">
                        {improvements[topic.topic] || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">improvement</p>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="relative pt-2 mb-4">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={improvements[topic.topic] || 0}
                      onChange={(e) =>
                        handleImprovement(topic.topic, parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                          ((improvements[topic.topic] || 0) / 20) * 100
                        }%, hsl(var(--muted)) ${
                          ((improvements[topic.topic] || 0) / 20) * 100
                        }%, hsl(var(--muted)) 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>0%</span>
                      <span>+20%</span>
                    </div>
                  </div>

                  {/* Key Mistakes Collapse */}
                  {improvements[topic.topic] > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <button
                        onClick={() =>
                          setSelectedTopic(
                            selectedTopic?.topic === topic.topic ? null : topic
                          )
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-blue-700 w-full"
                      >
                        <Info className="h-4 w-4" />
                        Common mistakes in {topic.topic}
                      </button>

                      {selectedTopic?.topic === topic.topic && (
                        <ul className="mt-3 space-y-2 text-sm text-blue-700">
                          {getTopicMistakes(topic.topic).map((mistake, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="font-bold flex-shrink-0">•</span>
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6 mb-8 border-l-4 border-l-blue-600">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Next Steps to Reach Your Target
            </h2>
            <div className="space-y-3">
              {currentGrade !== "A*" && (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-semibold text-foreground mb-2">
                      To reach {projectedGrade === "A*" ? "A*" : "next grade"}:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Focus on improving {lowestTopic.topic} from {lowestTopic.accuracy}% to 80%+
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-700 mb-2">💡 Strategy:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Practice 10+ questions from {lowestTopic.topic}</li>
                      <li>• Review common mistakes in this topic</li>
                      <li>• Work through step-by-step solutions</li>
                      <li>• Re-attempt previous exam questions</li>
                    </ul>
                  </div>
                </>
              )}
              {currentGrade === "A*" && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-green-700">✨ You're at A*! Maintain consistency and practice regularly.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetSimulation}
              className="flex-1"
            >
              Reset Simulator
            </Button>
            <Button asChild className="flex-1">
              <a href="/add-paper">Add More Papers</a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
