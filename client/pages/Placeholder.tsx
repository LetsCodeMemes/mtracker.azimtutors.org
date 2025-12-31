import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ConstructionIcon } from "lucide-react";

interface PlaceholderProps {
  title?: string;
  description?: string;
}

export function Placeholder({
  title = "Coming Soon",
  description = "This page is under development. Check back soon!",
}: PlaceholderProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <ConstructionIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3">{title}</h1>
          <p className="text-muted-foreground mb-8">{description}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Would you like to help us build this? Continue prompting and we'll add this page's content together!
          </p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ComingSoonPage() {
  return <Placeholder />;
}
