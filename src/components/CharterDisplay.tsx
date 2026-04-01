import { CharterData } from "@/lib/charter-generator";
import { Badge } from "@/components/ui/badge";

interface CharterDisplayProps {
  charterData: CharterData;
  projectName: string;
}

export default function CharterDisplay({ charterData, projectName }: CharterDisplayProps) {
  return (
    <div className="glass-card p-6 space-y-6 animate-slide-in">
      <div>
        <h2 className="text-xl font-bold">{charterData.title}</h2>
        <p className="text-muted-foreground mt-1">{charterData.objective}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Scope</h3>
        <ul className="space-y-1">
          {charterData.scope.map((s, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="text-accent mt-1">•</span> {s}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Deliverables</h3>
        <div className="flex flex-wrap gap-2">
          {charterData.deliverables.map((d, i) => (
            <Badge key={i} variant="secondary">{d}</Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Timeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {charterData.timeline.map((t, i) => (
            <div key={i} className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs font-semibold text-primary">{t.phase}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.duration}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Risks</h3>
        <div className="space-y-2">
          {charterData.risks.map((r, i) => (
            <div key={i} className="flex justify-between text-sm bg-destructive/5 rounded-lg p-3">
              <span className="font-medium">{r.risk}</span>
              <span className="text-muted-foreground">{r.mitigation}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Success Criteria</h3>
        <ul className="space-y-1">
          {charterData.successCriteria.map((c, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="text-success mt-1">✓</span> {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
