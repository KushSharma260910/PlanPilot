import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StructuredCharter, Stakeholder, Risk, Milestone } from "@/lib/charter-generator";
import { Plus, Trash2, Save, FileDown, ArrowLeft, Pencil, X, Check } from "lucide-react";

interface CharterReviewProps {
  charter: StructuredCharter;
  onSave: (charter: StructuredCharter) => void;
  onExportPdf: (charter: StructuredCharter) => void;
  onBack: () => void;
  saving?: boolean;
}

function EditableList({
  title,
  items,
  onChange,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  const add = () => {
    if (newVal.trim()) {
      onChange([...items, newVal.trim()]);
      setNewVal("");
      setAdding(false);
    }
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setEditVal(items[i]);
  };

  const saveEdit = () => {
    if (editVal.trim() && editIdx !== null) {
      const updated = [...items];
      updated[editIdx] = editVal.trim();
      onChange(updated);
    }
    setEditIdx(null);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 group text-sm py-1">
            {editIdx === i ? (
              <>
                <Input value={editVal} onChange={(e) => setEditVal(e.target.value)} className="h-8 text-sm" autoFocus />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}><Check className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditIdx(null)}><X className="h-3.5 w-3.5" /></Button>
              </>
            ) : (
              <>
                <span className="text-primary mr-1">•</span>
                <span className="flex-1">{item}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => startEdit(i)}><Pencil className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></Button>
              </>
            )}
          </li>
        ))}
      </ul>
      {adding && (
        <div className="flex gap-2 mt-2">
          <Input value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="Enter value..." className="h-8 text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button size="sm" variant="outline" onClick={add}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewVal(""); }}>Cancel</Button>
        </div>
      )}
    </div>
  );
}

export default function CharterReview({ charter, onSave, onExportPdf, onBack, saving }: CharterReviewProps) {
  const [data, setData] = useState<StructuredCharter>(charter);

  const updateStakeholder = (i: number, field: keyof Stakeholder, value: string) => {
    const updated = [...data.stakeholders];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, stakeholders: updated });
  };

  const addStakeholder = () => {
    setData({ ...data, stakeholders: [...data.stakeholders, { name: "", role: "" }] });
  };

  const removeStakeholder = (i: number) => {
    setData({ ...data, stakeholders: data.stakeholders.filter((_, j) => j !== i) });
  };

  const updateRisk = (i: number, field: keyof Risk, value: string) => {
    const updated = [...data.risks];
    updated[i] = { ...updated[i], [field]: value } as Risk;
    setData({ ...data, risks: updated });
  };

  const addRisk = () => {
    setData({ ...data, risks: [...data.risks, { description: "", impact: "Medium", mitigation: "" }] });
  };

  const removeRisk = (i: number) => {
    setData({ ...data, risks: data.risks.filter((_, j) => j !== i) });
  };

  const updateMilestone = (i: number, field: keyof Milestone, value: string) => {
    const updated = [...data.milestones];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, milestones: updated });
  };

  const addMilestone = () => {
    setData({ ...data, milestones: [...data.milestones, { name: "", targetDate: "" }] });
  };

  const removeMilestone = (i: number) => {
    setData({ ...data, milestones: data.milestones.filter((_, j) => j !== i) });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="text-xs text-muted-foreground">Generated {data.generatedDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExportPdf(data)}>
            <FileDown className="h-4 w-4 mr-1" /> Export PDF
          </Button>
          <Button className="gradient-primary" size="sm" onClick={() => onSave(data)} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Objectives */}
      <EditableList title="Objectives" items={data.objectives} onChange={(objectives) => setData({ ...data, objectives })} />

      {/* Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableList title="In Scope" items={data.scope.inScope} onChange={(inScope) => setData({ ...data, scope: { ...data.scope, inScope } })} />
        <EditableList title="Out of Scope" items={data.scope.outOfScope} onChange={(outOfScope) => setData({ ...data, scope: { ...data.scope, outOfScope } })} />
      </div>

      {/* Stakeholders */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Stakeholders</h3>
          <Button type="button" variant="ghost" size="sm" onClick={addStakeholder}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {data.stakeholders.map((s, i) => (
            <div key={i} className="flex gap-2 items-center group">
              <Input value={s.name} onChange={(e) => updateStakeholder(i, "name", e.target.value)} placeholder="Name" className="h-8 text-sm flex-1" />
              <Input value={s.role} onChange={(e) => updateStakeholder(i, "role", e.target.value)} placeholder="Role" className="h-8 text-sm flex-1" />
              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeStakeholder(i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <EditableList title="Constraints" items={data.constraints} onChange={(constraints) => setData({ ...data, constraints })} />

      {/* Risks */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Risks</h3>
          <Button type="button" variant="ghost" size="sm" onClick={addRisk}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {data.risks.map((r, i) => (
            <div key={i} className="flex gap-2 items-center group">
              <Input value={r.description} onChange={(e) => updateRisk(i, "description", e.target.value)} placeholder="Risk" className="h-8 text-sm flex-[2]" />
              <Select value={r.impact} onValueChange={(v) => updateRisk(i, "impact", v)}>
                <SelectTrigger className="h-8 text-sm w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              <Input value={r.mitigation} onChange={(e) => updateRisk(i, "mitigation", e.target.value)} placeholder="Mitigation" className="h-8 text-sm flex-[2]" />
              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeRisk(i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Milestones</h3>
          <Button type="button" variant="ghost" size="sm" onClick={addMilestone}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {data.milestones.map((m, i) => (
            <div key={i} className="flex gap-2 items-center group">
              <Input value={m.name} onChange={(e) => updateMilestone(i, "name", e.target.value)} placeholder="Milestone name" className="h-8 text-sm flex-1" />
              <Input type="date" value={m.targetDate} onChange={(e) => updateMilestone(i, "targetDate", e.target.value)} className="h-8 text-sm w-40" />
              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeMilestone(i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* Success Criteria */}
      <EditableList title="Success Criteria" items={data.successCriteria} onChange={(successCriteria) => setData({ ...data, successCriteria })} />

      {/* Budget & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Budget</h3>
          <Input value={data.budget} onChange={(e) => setData({ ...data, budget: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Timeline</h3>
          <div className="space-y-2">
            {data.timeline.phases.map((p, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="font-medium">{p.phase}</span>
                <span className="text-muted-foreground">{p.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
