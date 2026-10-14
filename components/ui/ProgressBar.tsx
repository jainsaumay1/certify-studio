import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  className?: string;
  color?: "blue" | "green" | "yellow";
}

export function ProgressBar({
  value,
  label,
  className,
  color = "blue",
}: ProgressBarProps) {
  const colors = {
    blue: "bg-blue-600",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
  };

  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-medium text-gray-700">{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", colors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
