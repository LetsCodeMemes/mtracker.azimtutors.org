import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Download, FileText, ArrowLeft, Loader, CheckCircle, BarChart3, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { aLevelMathsChapters, topicToChapter } from "@shared/chapters";

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

interface PaperBreakdown {
  submission_id: number;
  paper_id: number;
  exam_board: string;
  year: number;
  paper_number: number;
  total_obtained: number;
  total_available: number;
  submission_date: string;
  questions: Array<{
    question_number: number;
    topic: string;
    sub_topic: string;
    marks_available: number;
    marks_obtained: number;
  }>;
}

export default function ExportData() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [detailedData, setDetailedData] = useState<{ papers: PaperBreakdown[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, detailedRes] = await Promise.all([
        fetch("/api/performance/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/performance/detailed-report", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (detailedRes.ok) {
        setDetailedData(await detailedRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // If height is more than one page, we might need to split it
      // For now, let's just add one long page or use multiple captures if needed
      // Simple approach: add image to first page
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`AzimTutors_Report_${user?.first_name}_${user?.last_name}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const gradeMapping = (percentage: number) => {
    if (percentage >= 83.7) return "A*";
    if (percentage >= 68.3) return "A";
    if (percentage >= 55.7) return "B";
    if (percentage >= 43.3) return "C";
    if (percentage >= 31.0) return "D";
    if (percentage >= 18.7) return "E";
    return "U";
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <Button onClick={generatePDF} disabled={isGenerating}>
              {isGenerating ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : "Download PDF Report"}
            </Button>
          </div>

          <Card className="p-8 shadow-sm bg-white overflow-hidden" ref={reportRef}>
            {/* Report Header */}
            <div className="border-b border-slate-100 pb-8 mb-8 flex justify-between items-start">
              <div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fb1054737047f425f9516bbb02043979d%2F07d0ac73e1e34cf1a308b90dca923a08?format=webp&width=200"
                  alt="Azim Tutors"
                  className="h-10 w-auto mb-4"
                />
                <h1 className="text-3xl font-bold text-slate-900">Performance Report</h1>
                <p className="text-slate-500">Student: {user?.first_name} {user?.last_name}</p>
                <p className="text-slate-500">Subject: {user?.subject}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Date Generated</p>
                <p className="text-slate-900 font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Accuracy</p>
                <p className="text-4xl font-bold text-slate-900">{Math.round(stats?.overallScore || 0)}%</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Working at Grade</p>
                <p className="text-4xl font-bold text-primary">{gradeMapping(stats?.overallScore || 0)}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Papers Analyzed</p>
                <p className="text-4xl font-bold text-slate-900">{stats?.paperCount || 0}</p>
              </div>
            </div>

            {/* Topic Breakdown grouped by Category */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Topic Performance Breakdown
              </h2>

              <div className="space-y-8">
                {["Pure", "Statistics", "Mechanics"].map(category => {
                  const categoryTopics = stats?.topics.filter(t => {
                    const chapterId = topicToChapter[t.topic];
                    const chapter = aLevelMathsChapters.find(c => c.id === chapterId);
                    return chapter?.category === category || (category === "Pure" && !chapter); // Default to Pure if not found
                  }) || [];

                  if (categoryTopics.length === 0) return null;

                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">{category}</h3>
                      <div className="space-y-3">
                        {categoryTopics.map((topic) => (
                          <div key={topic.topic} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-slate-700">{topic.topic}</span>
                              <span className={`text-sm font-bold ${topic.accuracy >= 70 ? 'text-emerald-600' : topic.accuracy >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {Math.round(topic.accuracy)}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${topic.accuracy >= 70 ? 'bg-emerald-500' : topic.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${topic.accuracy}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Paper Breakdown */}
            <div className="mb-12 pt-8 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Individual Paper Breakdown
              </h2>
              <div className="space-y-8">
                {detailedData?.papers.map((paper) => (
                  <div key={paper.submission_id} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {paper.exam_board} {paper.year} - Paper {paper.paper_number}
                        </h3>
                        <p className="text-sm text-slate-500">Submitted: {new Date(paper.submission_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{Math.round((paper.total_obtained / paper.total_available) * 100)}%</p>
                        <p className="text-xs text-slate-500 uppercase font-bold">{paper.total_obtained} / {paper.total_available} marks</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {paper.questions.map((q) => (
                        <div key={q.question_number} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-400 uppercase">Q{q.question_number}</span>
                            <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{q.topic}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${q.marks_obtained === q.marks_available ? 'text-emerald-600' : q.marks_obtained > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                              {q.marks_obtained}/{q.marks_available}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tutor Note Section */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <CheckCircle className="h-4 w-4" />
                Verified Azim Tutors Assessment
              </div>
              <p className="text-slate-500 text-sm max-w-lg mx-auto italic">
                "This student has been using Azim Tutors to track their Edexcel A-Level Maths progress. 
                The data above represents their performance across actual past paper questions."
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
