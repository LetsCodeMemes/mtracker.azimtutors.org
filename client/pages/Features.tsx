import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import {
  BookMarked,
  BarChart3,
  Brain,
  Target,
  Zap,
  Shield,
  Smartphone,
  Database,
  ChevronRight,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: BookMarked,
      title: "Fast Edexcel Paper Entry",
      description:
        "Add Edexcel Maths papers in seconds. Log marks per question and organize by topic automatically.",
      benefits: [
        "Quick form entry",
        "Pre-categorized Maths topics",
        "Instant score calculation",
      ],
    },
    {
      icon: BarChart3,
      title: "Maths Performance Analytics",
      description:
        "Visualize your maths progress with professional charts. See which topics need the most work.",
      benefits: ["Progress tracking", "Topic accuracy charts", "Paper comparisons"],
    },
    {
      icon: Brain,
      title: "Smart Study Guide",
      description:
        "Get personalized study priorities based on your performance patterns across all papers.",
      benefits: ["Revision priorities", "Weak topic identification", "Study recommendations"],
    },
    {
      icon: Target,
      title: "Detailed Topic Analysis",
      description:
        "Deep dive into Algebra, Calculus, Statistics, Geometry and more. See exactly where marks are lost.",
      benefits: ["Marks lost tracking", "Question accuracy", "Topic consistency"],
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your data is encrypted and stored securely. We never share your information with third parties.",
      benefits: [
        "End-to-end encryption",
        "GDPR compliant",
        "Regular backups",
      ],
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description:
        "Track your progress on any device. Access your maths papers on desktop, tablet, or phone.",
      benefits: ["Responsive design", "Quick access", "Fast loading"],
    },
    {
      icon: Database,
      title: "Data Export",
      description:
        "Export your progress reports anytime in multiple formats. Your data belongs to you.",
      benefits: ["CSV export", "PDF reports", "Data portability"],
    },
    {
      icon: Zap,
      title: "Tutor Integration",
      description:
        "Share your progress with your tutor. Get personalized guidance based on your data.",
      benefits: ["Share insights", "Tutor feedback", "Collaborative learning"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container max-w-6xl px-4 md:px-6 py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              A Level Maths Tracking Made Easy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Everything you need to track your Edexcel Maths progress, identify weak areas and ace your exams.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container max-w-6xl px-4 md:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="p-8 hover:border-primary/50 transition-all duration-200">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, bidx) => (
                      <li key={bidx} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-muted/30 py-16">
          <div className="container max-w-6xl px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  q: "Can I use this on my phone?",
                  a: "Yes! Fully responsive and works on phones, tablets, and desktops. Track your papers on the go.",
                },
                {
                  q: "Which Edexcel Maths papers do you support?",
                  a: "We support all A Level Edexcel Maths past papers. You can add papers from any year and both Paper 1 and Paper 2.",
                },
                {
                  q: "Is my data secure?",
                  a: "Absolutely. We use industry-standard encryption and comply with GDPR. Your data is never shared.",
                },
                {
                  q: "Can I export my progress?",
                  a: "Yes, export all your progress data in CSV or PDF format anytime. Share with tutors if you wish.",
                },
                {
                  q: "Do you offer student discounts?",
                  a: "We offer discounted rates for A Level students. Contact us for current pricing.",
                },
                {
                  q: "Can I share my results with my tutor?",
                  a: "Yes! You can generate shareable reports or grant your tutor view-only access to track your progress.",
                },
              ].map((item, idx) => (
                <Card key={idx} className="p-6">
                  <h4 className="font-semibold mb-2">{item.q}</h4>
                  <p className="text-muted-foreground text-sm">{item.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
