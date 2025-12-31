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
      title: "Fast Paper Entry",
      description:
        "Add past papers in seconds with our intuitive form. Log marks per question and automatically map to topics.",
      benefits: [
        "Quick data entry",
        "Automatic topic mapping",
        "Instant calculations",
      ],
    },
    {
      icon: BarChart3,
      title: "Beautiful Analytics",
      description:
        "Visualize your progress with professional charts and graphs. Understand your performance at a glance.",
      benefits: ["Progress charts", "Topic breakdown", "Trend analysis"],
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description:
        "Get intelligent recommendations on what to study next based on your weak areas and past performance.",
      benefits: ["Smart recommendations", "Personalized feedback", "Study plans"],
    },
    {
      icon: Target,
      title: "Detailed Topic Analysis",
      description:
        "Deep dive into each topic to see exactly where you're losing marks and how to improve.",
      benefits: ["Marks lost tracking", "Accuracy metrics", "Consistency data"],
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
        "Use StudyTrack on any device. Access your data on desktop, tablet, or phone.",
      benefits: ["Responsive design", "Offline support", "Fast loading"],
    },
    {
      icon: Database,
      title: "Data Export",
      description:
        "Export your data anytime in multiple formats. Your data belongs to you.",
      benefits: ["CSV export", "PDF reports", "Data portability"],
    },
    {
      icon: Zap,
      title: "Collaboration Ready",
      description:
        "Share your progress with tutors or study groups. Get feedback and guidance.",
      benefits: ["Share insights", "Tutor feedback", "Group studies"],
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
              Everything you need to track your Edexcel Maths progress, identify weak areas, and ace your exams.
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
                  q: "Can I use StudyTrack on my phone?",
                  a: "Yes! StudyTrack is fully responsive and works on phones, tablets, and desktops. You can also install it as a PWA for offline access.",
                },
                {
                  q: "How do I import my existing papers?",
                  a: "You can manually add papers one by one using our quick entry form, or bulk import from a CSV file.",
                },
                {
                  q: "Is my data secure?",
                  a: "Absolutely. We use industry-standard encryption and comply with GDPR. Your data is never shared with third parties.",
                },
                {
                  q: "Can I export my data?",
                  a: "Yes, you can export all your data in CSV or PDF format anytime. Your data belongs to you.",
                },
                {
                  q: "Do you offer student discounts?",
                  a: "We offer free accounts for students with a .edu email. No credit card required!",
                },
                {
                  q: "What subjects does StudyTrack support?",
                  a: "StudyTrack works with any subject. You define your own topics and customize the system to fit your needs.",
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
