import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "yellow" | "red" | "blue" | "gray" | "orange";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  green: "bg-green-100 text-green-800 border border-green-200",
  yellow: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  red: "bg-red-100 text-red-800 border border-red-200",
  blue: "bg-blue-100 text-blue-800 border border-blue-200",
  gray: "bg-gray-100 text-gray-700 border border-gray-200",
  orange: "bg-orange-100 text-orange-800 border border-orange-200",
};

export function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
