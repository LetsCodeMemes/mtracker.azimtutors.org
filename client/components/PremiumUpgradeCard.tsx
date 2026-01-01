import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface PremiumUpgradeCardProps {
  title: string;
  description: string;
  features?: string[];
}

export function PremiumUpgradeCard({
  title,
  description,
  features,
}: PremiumUpgradeCardProps) {
  return (
    <Card className="p-6 border-primary/20 bg-primary/5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          {features && features.length > 0 && (
            <ul className="space-y-2 mb-4">
              {features.map((feature, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
          <Button size="sm">Upgrade to Premium</Button>
        </div>
      </div>
    </Card>
  );
}
