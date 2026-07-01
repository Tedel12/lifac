import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valeur entre 0 et 100 */
  value: number;
  /** Hauteur de la barre */
  size?: "sm" | "md" | "lg";
  /** Couleur de la barre */
  variant?: "gold" | "blue" | "green";
  /** Affiche le pourcentage à droite de la barre */
  showLabel?: boolean;
}

export function Progress({
  value,
  size = "md",
  variant = "gold",
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const variantClasses = {
    gold: "bg-gradient-to-r from-lifac-gold-400 to-lifac-gold-600",
    blue: "bg-gradient-to-r from-lifac-blue-700 to-lifac-blue-900",
    green: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  };

  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-gray-100",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantClasses[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-700 tabular-nums shrink-0 min-w-[3ch]">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
