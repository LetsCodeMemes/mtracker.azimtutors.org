import { Lock, Star } from "lucide-react";

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg";
  variant?: "badge" | "inline";
}

export function PremiumBadge({ size = "md", variant = "badge" }: PremiumBadgeProps) {
  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">
        <Star className="h-3 w-3" />
        Premium
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold ${
        size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
      }`}
    >
      <Lock className={`${size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"}`} />
      Premium
    </div>
  );
}
