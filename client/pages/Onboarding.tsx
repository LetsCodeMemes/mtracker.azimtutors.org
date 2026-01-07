import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Target, BookOpen, Zap, Trophy } from "lucide-react";

interface OnboardingData {
  targetGrade: string;
  examBoard: string;
  papersCompleted: number;
  studyStartDate: string;
  studyHours: number;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    targetGrade: "A*",
    examBoard: "Edexcel",
    papersCompleted: 0,
    studyStartDate: new Date().toISOString().split("T")[0],
    studyHours: 5,
  });

  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    // Store onboarding data in localStorage
    localStorage.setItem("onboarding-complete", "true");
    localStorage.setItem("onboarding-data", JSON.stringify(data));
    setCompleted(true);

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  if (completed) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/10 to-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="p-12 max-w-md text-center">
            <div className="mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Welcome! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              Your profile is set up and ready. Let's get you started with your first past paper!
            </p>
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Let's Get Started! 🚀</h1>
              <span className="text-sm font-medium text-muted-foreground">
                Step {step + 1} of 5
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((step + 1) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Target Grade */}
          {step === 0 && (
            <Card className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  What Grade Do You Want?
                </h2>
                <p className="text-muted-foreground">
                  This helps us personalize your study plan and track progress
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {["A*", "A", "B", "C"].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setData({ ...data, targetGrade: grade })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      data.targetGrade === grade
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <div className="text-2xl font-bold text-foreground">{grade}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {grade === "A*"
                        ? "Outstanding"
                        : grade === "A"
                        ? "Excellent"
                        : grade === "B"
                        ? "Good"
                        : "Satisfactory"}
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Pro tip:</strong> Setting an ambitious goal motivates you to study more
                  consistently. You can adjust this later!
                </p>
              </div>
            </Card>
          )}

          {/* Step 2: Exam Board */}
          {step === 1 && (
            <Card className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Which Exam Board?
                </h2>
                <p className="text-muted-foreground">
                  We currently support Edexcel A Level Maths
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {["Edexcel", "AQA (Coming Soon)", "OCR (Coming Soon)"].map((board) => (
                  <button
                    key={board}
                    onClick={() =>
                      !board.includes("Coming") && setData({ ...data, examBoard: board })
                    }
                    disabled={board.includes("Coming")}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      data.examBoard === board && !board.includes("Coming")
                        ? "border-primary bg-primary/10"
                        : board.includes("Coming")
                        ? "border-border bg-muted opacity-50 cursor-not-allowed"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <div className="font-semibold text-foreground">{board}</div>
                    {board.includes("Coming") && (
                      <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  📚 More exam boards coming soon! Follow us on social media for updates.
                </p>
              </div>
            </Card>
          )}

          {/* Step 3: Papers Completed */}
          {step === 2 && (
            <Card className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  How Many Papers Have You Done?
                </h2>
                <p className="text-muted-foreground">
                  This helps us understand your current progress
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Number of papers</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={data.papersCompleted}
                    onChange={(e) =>
                      setData({ ...data, papersCompleted: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[0, 5, 10, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setData({ ...data, papersCompleted: num })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        data.papersCompleted === num
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="font-bold text-foreground">{num}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✨ You can always go back and add previous papers. We'll analyze your progress
                  across them!
                </p>
              </div>
            </Card>
          )}

          {/* Step 4: Study Commitment */}
          {step === 3 && (
            <Card className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  How Much Time Can You Study Weekly?
                </h2>
                <p className="text-muted-foreground">
                  This helps us create a realistic study plan for you
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Hours per week</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={data.studyHours}
                      onChange={(e) => setData({ ...data, studyHours: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <div className="text-3xl font-bold text-primary min-w-20 text-center">
                      {data.studyHours}h
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => setData({ ...data, studyHours: hours })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        data.studyHours === hours
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="font-bold text-foreground">{hours}h/week</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💪 <strong>Research shows:</strong> 8-10 hours of focused A Level Maths study per
                  week is optimal for exam success
                </p>
              </div>
            </Card>
          )}

          {/* Step 5: Summary */}
          {step === 4 && (
            <Card className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
                <p className="text-muted-foreground">Here's your study profile</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Target Grade</div>
                  <div className="text-2xl font-bold text-primary">{data.targetGrade}</div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Exam Board</div>
                  <div className="text-2xl font-bold text-foreground">{data.examBoard}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Papers Done</div>
                    <div className="text-2xl font-bold text-foreground">
                      {data.papersCompleted}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Weekly Study Time</div>
                    <div className="text-2xl font-bold text-foreground">{data.studyHours}h</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ <strong>Ready to begin:</strong> Add your first past paper or jump to the
                  dashboard to see your personalized insights!
                </p>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {step === 4 ? (
                <>
                  Complete <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
