import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
  showText?: boolean;
}

export function Logo({ className, variant = "default", showText = true }: LogoProps) {
  const isWhite = variant === "white";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/logo.jpg"
        alt="Logo LiFAC"
        className="h-10 w-10 shrink-0 object-contain"
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-2xl font-extrabold tracking-tight",
              isWhite ? "text-white" : "text-lifac-navy-900"
            )}
          >
          </span>
          <span
            className={cn(
              "text-[9px] tracking-[0.18em] mt-0.5 font-semibold",
              isWhite ? "text-white/60" : "text-lifac-navy-500"
            )}
          >
            LIGHT FOR ALL CENTER
          </span>
        </div>
      )}
    </div>
  );
}
