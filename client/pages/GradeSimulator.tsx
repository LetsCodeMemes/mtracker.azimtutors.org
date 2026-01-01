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
  Cell,
} from "recharts";
import {
  Loader,
  AlertCircle,
  TrendingUp,
  Target,
  ArrowUp,
} from "lucide-react";

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

export default function GradeSimulator() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [improvements, setImprovements] = useState<Record<string, number>>({});
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [currentOverall, setCurrentOverall] = useState(0);
  const [projectedOverall, setProjectedOverall] = useState(0);

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

      // Initialize improvements
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

  const handleImprovement = (topicName: string, value: number) => {
    const newImprovements = { ...improvements, [topicName]: value };
    setImprovements(newImprovements);

    // Calculate projected overall score
    let totalCurrentMarks = 0;
    let totalPossibleMarks = 0;
    let totalProjectedMarks = 0;

    topics.forEach((topic) => {
      const currentAccuracy = topic.marks_obtained / topic.marks_available;
      const improvement = newImprovements[topic.topic] || 0;
      const projectedAccuracy = Math.min(
        1,
        currentAccuracy + improvement / 100
      );

      totalCurrentMarks += topic.marks_obtained;
      totalProjectedMarks += topic.marks_available * projectedAccuracy;
      totalPossibleMarks += topic.marks_available;
    });

    const newProjectedOverall =
      totalPossibleMarks > 0
        ? Math.round((totalProjectedMarks / totalPossibleMarks) * 100)
        : currentOverall;

    setProjectedOverall(newProjectedOverall);

    // Create simulation data for chart
    const simData = topics.map((topic) => ({
      topic: topic.topic.substring(0, 8), // Shorten for chart
      current: Math.round(topic.marks_obtained),
      simulated: Math.round(
        topic.marks_available *
          Math.min(1, topic.marks_obtained / topic.marks_available + (newImprovements[topic.topic] || 0) / 100)
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
                {error ||
                  "Submit some papers first to use the grade simulator."}
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Grade Uplift Simulator</h1>
            <p className="text-muted-foreground">
              Adjust your performance in each topic to see how it affects your overall grade
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Current Score */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Current Score</h3>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-4xl font-bold text-primary mb-2">
                {currentOverall}%
              </div>
              <div className="text-xl font-semibold text-primary">{currentGrade}</div>
            </Card>

            {/* Projected Score */}
            <Card className="p-6 border-2 border-success/50 bg-success/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Projected Score</h3>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="text-4xl font-bold text-success mb-2">
                {projectedOverall}%
              </div>
              <div className="text-xl font-semibold text-success">
                {projectedGrade}
              </div>
            </Card>

            {/* Improvement */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Improvement</h3>
                <ArrowUp className="h-5 w-5 text-accent" />
              </div>
              <div
                className={`text-4xl font-bold mb-2 ${
                  gradeDifference > 0 ? "text-success" : "text-muted-foreground"
                }`}
              >
                {gradeDifference > 0 ? "+" : ""}{gradeDifference}%
              </div>
              <div className="text-sm text-muted-foreground">
                {gradeDifference > 0
                  ? `${Math.abs(gradeDifference)} point improvement`
                  : "Adjust sliders to improve"}
              </div>
            </Card>
          </div>

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
                  <Bar dataKey="current" fill="#991B1B" name="Current Marks" />
                  <Bar dataKey="simulated" fill="#10B981" name="Projected Marks" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Topic Sliders */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6">Adjust Topic Performance</h2>
            <div className="space-y-8">
              {topics.map((topic) => (
                <div key={topic.topic}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {topic.topic}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Current accuracy: {Math.round(topic.accuracy)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {improvements[topic.topic] || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">improvement</p>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="relative pt-2">
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
                </div>
              ))}
            </div>
          </Card>

          {/* Reset Button */}
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
