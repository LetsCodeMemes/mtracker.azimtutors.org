import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Sparkles, Rocket, Shield, Clock, Calendar as CalendarIcon, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Premium() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "one-time">("monthly");
  const [yearGroup, setYearGroup] = useState("");
  const [examDate, setExamDate] = useState("");

  const features = [
    "Unlimited Paper Submissions",
    "Detailed Mistake Analysis",
    "AI-Generated Revision Plans",
    "Full Grade Improvement Simulator",
    "Priority Tutor Support",
    "Export Data as PDF for Tutors",
    "Early Access to New Features",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Upgrade to Azim Tutors Premium
            </h1>
            <p className="text-xl text-muted-foreground">
              Unlock the full power of AI-driven A-Level Maths preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Features List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Why go Premium?</h2>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex gap-4">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Secure Payment</h3>
                    <p className="text-sm text-muted-foreground">
                      Payments are processed securely via Stripe. Cancel anytime.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pricing Card */}
            <Card className="p-8 shadow-xl border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Rocket className="h-12 w-12 text-primary/10 rotate-12" />
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Select your plan</h3>
                <div className="grid grid-cols-2 gap-4 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      billingCycle === "monthly"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("one-time")}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      billingCycle === "one-time"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    One-time
                  </button>
                </div>
              </div>

              <div className="mb-8">
                {billingCycle === "monthly" ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">£2.50</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold">£25</span>
                      <span className="text-muted-foreground">once</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Full access until your final exam date
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="year-group">Year Group</Label>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <Select onValueChange={setYearGroup} value={yearGroup}>
                      <SelectTrigger id="year-group">
                        <SelectValue placeholder="Select year group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="year12">Year 12 (AS)</SelectItem>
                        <SelectItem value="year13">Year 13 (A2)</SelectItem>
                        <SelectItem value="resit">Resit Student</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-date">Final Exam Date</Label>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="exam-date"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 text-lg font-bold" disabled={!yearGroup || !examDate}>
                Upgrade Now
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                By upgrading, you agree to our Terms of Service
              </p>
            </Card>
          </div>
          
          {/* FAQ or additional info */}
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4 text-left">
              <div>
                <h4 className="font-semibold">Can I cancel my monthly subscription?</h4>
                <p className="text-sm text-muted-foreground">Yes, you can cancel at any time from your profile settings. You'll keep access until the end of your billing period.</p>
              </div>
              <div>
                <h4 className="font-semibold">What happens after my final exam?</h4>
                <p className="text-sm text-muted-foreground">The one-time payment plan expires after your specified exam date. You can always renew if you're resitting.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
