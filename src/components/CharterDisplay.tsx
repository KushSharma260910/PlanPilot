import type { StructuredCharter } from "@/lib/charter-generator";
import { Badge } from "@/components/ui/badge";

interface CharterDisplayProps {
  charterData: StructuredCharter | any;
  projectName: string;
}

export default function CharterDisplay({ charterData, projectName }: CharterDisplayProps) {
  // Support both old and new charter format
  const isNewFormat = "objectives" in charterData;

  if (!isNewFormat) {
    // Legacy format
    return (
      <div className="glass-card p-6 space-y-4 animate-slide-in">
        <h2 className="text-xl font-bold">{charterData.title || projectName}</h2>
        {charterData.objective && <p className="text-muted-foreground">{charterData.objective}</p>}
        {charterData.scope && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Scope</h3>
            <ul className="space-y-1">
              {charterData.scope.map((s: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2"><span className="text-primary">•</span>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const charter = charterData as StructuredCharter;
  return (
    <div className="glass-card p-6 space-y-5 animate-slide-in">
      <div>
        <h2 className="text-xl font-bold">{charter.title}</h2>
        <p className="text-xs text-muted-foreground">Generated {charter.generatedDate}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Objectives</h3>
        <ul className="space-y-1">
          {charter.objectives.map((o, i) => (
            <li key={i} className="text-sm flex items-start gap-2"><span className="text-primary">•</span>{o}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">In Scope</h3>
          <ul className="space-y-1">
            {charter.scope.inScope.map((s, i) => (
              <li key={i} className="text-sm flex items-start gap-2"><span className="text-primary">•</span>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Out of Scope</h3>
          <ul className="space-y-1">
            {charter.scope.outOfScope.map((s, i) => (
              <li key={i} className="text-sm flex items-start gap-2"><span className="text-muted-foreground">•</span>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      {charter.stakeholders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Stakeholders</h3>
          <div className="flex flex-wrap gap-2">
            {charter.stakeholders.map((s, i) => (
              <Badge key={i} variant="secondary">{s.name} — {s.role}</Badge>
            ))}
          </div>
        </div>
      )}

      {charter.risks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Risks</h3>
          <div className="space-y-2">
            {charter.risks.slice(0, 3).map((r, i) => (
              <div key={i} className="flex justify-between text-sm bg-destructive/5 rounded-lg p-3">
                <span className="font-medium">{r.description}</span>
                <Badge variant={r.impact === "High" ? "destructive" : "secondary"} className="text-xs">{r.impact}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {charter.successCriteria.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Success Criteria</h3>
          <ul className="space-y-1">
            {charter.successCriteria.map((c, i) => (
              <li key={i} className="text-sm flex items-start gap-2"><span className="text-accent">✓</span>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
