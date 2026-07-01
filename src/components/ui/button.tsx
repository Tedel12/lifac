import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lifac-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // CTA principal — rouge sacré
        default:
          "bg-lifac-red-600 text-white shadow-lg shadow-lifac-red-600/30 hover:bg-lifac-red-700 hover:shadow-xl hover:shadow-lifac-red-600/40 active:scale-[0.98]",
        primary:
          "bg-lifac-red-600 text-white shadow-lg hover:bg-lifac-red-700 active:scale-[0.98]",
        navy:
          "bg-lifac-navy-800 text-white shadow-md hover:bg-lifac-navy-700 active:scale-[0.98]",
        ghost: "hover:bg-white/10 text-white",
        outline:
          "border border-white/20 text-white bg-transparent hover:bg-white hover:text-lifac-navy-900",
        outlineDark:
          "border-2 border-lifac-navy-900 text-lifac-navy-900 bg-transparent hover:bg-lifac-navy-900 hover:text-white",
        secondary:
          "bg-white text-lifac-navy-900 shadow-sm hover:bg-gray-50 border border-gray-200",
        destructive:
          "bg-lifac-red-700 text-white shadow-sm hover:bg-lifac-red-800",
        link: "text-lifac-red-600 underline-offset-4 hover:underline rounded",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
