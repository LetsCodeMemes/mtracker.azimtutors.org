import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  BookMarked,
  AreaChart,
  Brain,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-red-50 to-background dark:from-slate-900 dark:to-background">
        <div className="container max-w-6xl px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Zap className="h-4 w-4" />
              Smart A Level Maths Tracking
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
              Master A Level Edexcel Maths with
              <span className="text-primary"> Data-Driven Insights</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Track your past papers, analyze your weak topics, and get personalized feedback on what to revise next. Build a winning study strategy backed by real data.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="h-12 px-8 text-base">
                <Link to="/signup">
                  Start Free Today
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link to="/dashboard">See Demo Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container max-w-6xl px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Ace A Level Maths
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you track progress, identify weak areas, and master every topic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="p-8 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-200">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookMarked className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Paper Entry</h3>
              <p className="text-muted-foreground mb-4">
                Add Edexcel Maths papers in seconds. Log marks per question, organize by topic, instant analysis.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  Fast form entry for all question types
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  Pre-categorized Edexcel Maths topics
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  Instant mark calculation
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-200">
              <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
              <p className="text-muted-foreground mb-4">
                See your maths performance with beautiful charts. Understand which topics need work.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-success" />
                  Progress tracking over time
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-success" />
                  Topic accuracy breakdowns
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-success" />
                  Paper-to-paper comparisons
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-200">
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Study Guide</h3>
              <p className="text-muted-foreground mb-4">
                Discover exactly which topics to focus on based on your performance patterns.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-accent" />
                  Personalized revision priorities
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-accent" />
                  Identify weak topics quickly
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-accent" />
                  Study time recommendations
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-200">
              <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Maths Topic Analysis</h3>
              <p className="text-muted-foreground mb-4">
                See exactly how many marks you're losing on Calculus, Algebra, Statistics, and more.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-warning" />
                  Marks lost per topic breakdown
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-warning" />
                  Question-type accuracy analysis
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-warning" />
                  Difficulty-based performance tracking
                </li>
              </ul>
            </div>
          </div>

          {/* Feature Highlight */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">
                  "What Should I Revise Next?"
                </h3>
                <p className="text-muted-foreground mb-4 text-lg">
                  Our system analyzes all your Edexcel Maths papers to identify your weakest topics and how many marks you're losing in each area. Get a personalized study priority list every time you log a new paper.
                </p>
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <TrendingUp className="h-5 w-5" />
                  Students see improvement within 3-4 weeks of consistent tracking
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center border border-primary/20">
                  <AreaChart className="h-32 w-32 text-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container max-w-6xl px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Start tracking your past papers today and unlock data-driven study strategies.
            It only takes 2 minutes to get started.
          </p>
          <Button size="lg" variant="secondary" asChild className="h-12 px-8 text-base">
            <Link to="/signup">Create Free Account</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
