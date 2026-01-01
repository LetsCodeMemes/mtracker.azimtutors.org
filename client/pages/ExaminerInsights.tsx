import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Loader,
  Lock,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  BookMarked,
  Sparkles,
} from "lucide-react";

interface Topic {
  topic: string;
  accuracy: number;
}

interface ExamTip {
  topic: string;
  commonMistakes: string[];
  keyPoints: string[];
  examTechnique: string;
  markAllocation: string;
}

const EXAMINER_INSIGHTS: Record<string, ExamTip> = {
  Algebra: {
    topic: "Algebra",
    commonMistakes: [
      "Sign errors when expanding brackets",
      "Forgetting to check all solutions satisfy the original equation",
      "Incorrect simplification of surds",
      "Computational errors with negative numbers",
    ],
    keyPoints: [
      "Always show full working - examiners award method marks",
      "Write out each step clearly, even if it seems obvious",
      "Check your answer by substituting back into the original",
      "Use correct notation (= and ≡ appropriately)",
      "Simplify surds fully and rationalize denominators",
    ],
    examTechnique:
      "Take your time with algebra questions. Accuracy is worth more marks than speed. Show ALL working and check your solutions.",
    markAllocation:
      "Typically worth 6-9 marks per question. Method marks available even if final answer is wrong.",
  },
  Calculus: {
    topic: "Calculus",
    commonMistakes: [
      "Incorrect differentiation of composite functions (chain rule errors)",
      "Forgetting to integrate the constant term",
      "Confusion between definite and indefinite integrals",
      "Sign errors in finding turning points",
      "Not checking second derivative for nature of turning points",
    ],
    keyPoints: [
      "Chain rule: differentiate the outer function, multiply by derivative of inner",
      "Integration by parts: Use LIATE rule (Logarithmic, Inverse, Algebraic, Trigonometric, Exponential)",
      "Always add + C to indefinite integrals",
      "For turning points: find where f'(x) = 0, then verify with second derivative",
      "Show the equation you're solving and the steps to get your answer",
    ],
    examTechnique:
      "Calculus questions require careful working. Practice substitution and by-parts integration. Show your method clearly.",
    markAllocation:
      "High-mark questions (8-10 marks). Full working essential. Method marks typically worth 60-70%.",
  },
  Trigonometry: {
    topic: "Trigonometry",
    commonMistakes: [
      "Using degree instead of radian mode (or vice versa)",
      "Failing to find all solutions in the given range",
      "Incorrect use of trigonometric identities",
      "Sign errors with CAST/ASTC rule",
      "Not recognizing when to use identities vs calculator",
    ],
    keyPoints: [
      "Check your calculator is in the correct mode (radians vs degrees)",
      "When solving equations, always find ALL solutions in the given range",
      "sin²x + cos²x ≡ 1 is the most important identity",
      "Use CAST rule: All Students Take Calculus (A-S-T-C for positive quadrants)",
      "Show which identities you're using in your working",
    ],
    examTechnique:
      "Read the question carefully - is it asking for degrees or radians? List all solutions clearly.",
    markAllocation:
      "Usually 6-8 marks. Exact values (like sin60°) should be given in simplified form.",
  },
  Statistics: {
    topic: "Statistics",
    commonMistakes: [
      "Incorrect use of normal distribution tables",
      "Confusing P(X < a) with P(X = a)",
      "Wrong test statistic calculation in hypothesis testing",
      "Not considering context when interpreting confidence intervals",
      "Forgetting to state assumptions for statistical tests",
    ],
    keyPoints: [
      "Normal distribution is continuous: P(X = a) = 0, use P(X < a) or P(X > a)",
      "Standardize using Z = (X - μ) / σ before using normal tables",
      "State assumptions explicitly: Random sample, large n, etc.",
      "For hypothesis tests: state H₀ and H₁ clearly, show your calculation, state conclusion",
      "Confidence intervals are about the parameter, not predicting individual values",
    ],
    examTechnique:
      "Show all steps in calculations. State your hypotheses clearly. Give conclusions in context.",
    markAllocation:
      "Usually 5-7 marks per question. Full method marks available even with arithmetic errors.",
  },
  Geometry: {
    topic: "Geometry",
    commonMistakes: [
      "Incorrect use of vector notation",
      "Confusing parallel and perpendicular conditions",
      "Not finding the equation in the correct form",
      "Arithmetic errors in distance calculations",
      "Forgetting to verify answers satisfy original conditions",
    ],
    keyPoints: [
      "Two lines are parallel if they have the same direction vector",
      "Two lines are perpendicular if their direction vectors have dot product = 0",
      "Always express equations in the form requested (parametric, Cartesian, etc.)",
      "Check your equation by substituting a known point",
      "Use the distance formula carefully: d = √[(x₂-x₁)² + (y₂-y₁)²]",
    ],
    examTechnique:
      "Draw diagrams to visualize the problem. Check your conditions carefully.",
    markAllocation:
      "Usually 5-8 marks. Working is essential - show vector operations clearly.",
  },
  "Functions": {
    topic: "Functions",
    commonMistakes: [
      "Not stating the domain and range clearly",
      "Confusing f(x) with f'(x)",
      "Incorrect transformation of functions",
      "Sign errors when reflecting graphs",
      "Not simplifying composite functions",
    ],
    keyPoints: [
      "State domain as an inequality or set notation",
      "For transformations: f(x) + a shifts UP, f(x + a) shifts LEFT",
      "For composite functions gf(x): apply f first, then g",
      "When finding inverse: swap x and y, then rearrange for y",
      "Check your transformation by testing a point",
    ],
    examTechnique:
      "Always state domain and range. Label transformed graphs clearly.",
    markAllocation:
      "Usually 4-7 marks. Showing transformations step-by-step earns more marks.",
  },
};

export default function ExaminerInsights() {
  const [stats, setStats] = useState<Topic[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isPremium] = useState(false);

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
      setStats(data.topics);
      if (data.topics.length > 0) {
        setSelectedTopic(data.topics[0].topic);
      }
    } catch (err) {
      console.error("Error fetching performance data:", err);
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
            <p className="text-muted-foreground">Loading exam insights...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentInsight = selectedTopic
    ? EXAMINER_INSIGHTS[selectedTopic]
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Examiner Insights & Tips</h1>
              {!isPremium && (
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                  <Lock className="h-4 w-4" />
                  Premium
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              Expert guidance from experienced Maths teachers and examiners
            </p>
          </div>

          {!isPremium && (
            <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-4">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground mb-2">
                    Get Expert Tips from Examiners
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn exactly what examiners are looking for, common mistakes to avoid,
                    and pro techniques to maximize your marks in each topic.
                  </p>
                  <Button>Upgrade to Premium</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Topic Selection */}
          {stats && stats.length > 0 && (
            <>
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Select a Topic</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.map((topic) => (
                    <button
                      key={topic.topic}
                      onClick={() => setSelectedTopic(topic.topic)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedTopic === topic.topic
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-semibold text-foreground">
                        {topic.topic}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Accuracy: {Math.round(topic.accuracy)}%
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Insights Content */}
              {currentInsight && (
                <div className="space-y-6">
                  {/* Common Mistakes */}
                  <Card className="p-6 border-l-4 border-l-destructive">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-4">
                          Common Mistakes Students Make
                        </h3>
                        <ul className="space-y-3">
                          {currentInsight.commonMistakes.map((mistake, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <span className="text-destructive font-bold mt-0.5">
                                ✕
                              </span>
                              <span className="text-foreground">{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>

                  {/* Key Points */}
                  <Card className="p-6 border-l-4 border-l-success">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-4">
                          Key Points to Remember
                        </h3>
                        <ul className="space-y-3">
                          {currentInsight.keyPoints.map((point, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <span className="text-success font-bold mt-0.5">
                                ✓
                              </span>
                              <span className="text-foreground">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>

                  {/* Exam Technique */}
                  <Card className="p-6 border-l-4 border-l-accent">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Exam Technique
                        </h3>
                        <p className="text-foreground leading-relaxed">
                          {currentInsight.examTechnique}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Mark Allocation */}
                  <Card className="p-6 border-l-4 border-l-primary">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookMarked className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Mark Allocation & Tips
                        </h3>
                        <p className="text-foreground leading-relaxed">
                          {currentInsight.markAllocation}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* AI Recommendations Placeholder */}
          <Card className="p-6 border-primary/20 bg-primary/5 my-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Personalized Recommendations (Coming Soon)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Based on your paper submissions, we'll provide specific tips for your
                  weak areas, highlighting exactly where you're losing marks.
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
