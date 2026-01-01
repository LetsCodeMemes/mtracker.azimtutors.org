import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Loader, AlertCircle, Lock, Download, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PerformanceStats {
  overallScore: number;
  paperCount: number;
  topics: Array<{
    topic: string;
    accuracy: number;
    marks_obtained: number;
    marks_available: number;
  }>;
}

export default function ProgressReport() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isPremium] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const generatePDF = async () => {
    if (!reportRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210 - 20; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      heightLeft -= 287; // A4 height minus margins

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position + 10, imgWidth, imgHeight);
        heightLeft -= 287;
      }

      pdf.save(
        `Azim-Tutors-Progress-Report-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const getGrade = (percentage: number) => {
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
            <p className="text-muted-foreground">Generating report...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="p-6 max-w-md">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Data Available</h2>
              <p className="text-muted-foreground mb-4">
                Submit some papers first to generate a report.
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Progress Report</h1>
              {!isPremium && (
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                  <Lock className="h-4 w-4" />
                  Premium
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              Comprehensive analysis of your Edexcel Maths performance
            </p>
          </div>

          {!isPremium && (
            <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-4">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground mb-2">
                    Get Detailed Progress Reports
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download professional PDF reports showing your performance trends,
                    topic mastery, and personalized recommendations for improvement.
                  </p>
                  <Button>Upgrade to Premium</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Report Preview */}
          <Card
            ref={reportRef}
            className="p-8 mb-8 border-2 border-border bg-white"
          >
            {/* Header */}
            <div className="text-center mb-8 pb-8 border-b border-border">
              <div className="mb-4">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fb1054737047f425f9516bbb02043979d%2F07d0ac73e1e34cf1a308b90dca923a08?format=webp&width=150"
                  alt="Azim Tutors"
                  className="h-10 mx-auto mb-4"
                />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Progress Report
              </h1>
              <p className="text-muted-foreground">
                A Level Edexcel Mathematics Analysis
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Generated on{" "}
                {new Date().toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Overall Performance */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Overall Score
                </p>
                <p className="text-4xl font-bold text-primary">
                  {stats.overallScore}%
                </p>
                <p className="text-xl font-semibold text-primary mt-2">
                  Grade {getGrade(stats.overallScore)}
                </p>
              </div>

              <div className="text-center p-6 bg-secondary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Papers Completed
                </p>
                <p className="text-4xl font-bold text-secondary">
                  {stats.paperCount}
                </p>
              </div>

              <div className="text-center p-6 bg-accent/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Topics Covered
                </p>
                <p className="text-4xl font-bold text-accent">
                  {stats.topics.length}
                </p>
              </div>
            </div>

            {/* Topic Breakdown */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Topic Performance Breakdown
              </h2>
              <div className="space-y-4">
                {stats.topics.map((topic) => (
                  <div key={topic.topic}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-foreground">
                        {topic.topic}
                      </span>
                      <span className="font-bold text-primary">
                        {Math.round(topic.accuracy)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {topic.marks_obtained} / {topic.marks_available} marks
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t border-border pt-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Recommendations
              </h2>
              <div className="space-y-3">
                {stats.topics
                  .sort((a, b) => a.accuracy - b.accuracy)
                  .slice(0, 3)
                  .map((topic) => (
                    <div key={topic.topic} className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-semibold text-foreground">
                        Focus on {topic.topic}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current accuracy: {Math.round(topic.accuracy)}%. Continue
                        practicing this topic to improve your overall performance.
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
              <p>
                For more detailed analysis and personalized guidance, visit your
                dashboard.
              </p>
              <p className="mt-2">
                © {new Date().getFullYear()} Azim Tutors. All rights reserved.
              </p>
            </div>
          </Card>

          {/* Download Button */}
          <div className="flex gap-3">
            <Button
              onClick={generatePDF}
              disabled={generating}
              className="gap-2 flex-1"
            >
              <Download className="h-4 w-4" />
              {generating ? "Generating PDF..." : "Download as PDF"}
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </div>

          {/* AI Insights Placeholder */}
          <Card className="p-6 border-primary/20 bg-primary/5 mt-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Advanced Reports (Coming Soon)
                </h3>
                <p className="text-sm text-muted-foreground">
                  We're working on AI-generated insights that will provide detailed
                  analysis of your learning patterns and predictive grade forecasts.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
