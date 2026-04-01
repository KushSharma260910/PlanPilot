import { useMemo } from "react";
import { calculateBurnoutScore } from "@/lib/behavior-engine";

interface BurnoutIndicatorProps {
  idleTime: number;
  contextSwitchCount: number;
  activeTaskCount: number;
}

export default function BurnoutIndicator({ idleTime, contextSwitchCount, activeTaskCount }: BurnoutIndicatorProps) {
  const score = useMemo(
    () => calculateBurnoutScore(idleTime, contextSwitchCount, activeTaskCount),
    [idleTime, contextSwitchCount, activeTaskCount]
  );

  const color =
    score < 40 ? "hsl(160, 60%, 45%)" : score < 70 ? "hsl(38, 92%, 50%)" : "hsl(0, 72%, 51%)";
  const label = score < 40 ? "Low" : score < 70 ? "Moderate" : "High";
  const bgClass = score < 40 ? "bg-success/10" : score < 70 ? "bg-warning/10" : "bg-destructive/10";

  return (
    <div className={`glass-card p-4 ${bgClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Burnout Risk</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: color, color: "#fff" }}>
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold" style={{ color }}>{score}</div>
      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
