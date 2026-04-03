import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TagInput from "@/components/TagInput";
import SuggestionChips from "@/components/SuggestionChips";
import type { CharterWizardData, Stakeholder } from "@/lib/charter-generator";
import { ChevronLeft, ChevronRight, Check, Plus, Trash2 } from "lucide-react";

const STEPS = ["Project Info", "Stakeholders", "Constraints", "Generate"];

const CONSTRAINT_SUGGESTIONS = [
  "Budget limitations",
  "Time constraints",
  "Resource limitations",
  "Technical limitations",
  "Regulatory compliance",
  "Team size restrictions",
];

const FEATURE_SUGGESTIONS = [
  "User Authentication",
  "Dashboard",
  "Reporting",
  "Notifications",
  "Data Export",
  "Admin Panel",
];

const CRITERIA_SUGGESTIONS = [
  "User adoption > 80%",
  "System uptime > 99.9%",
  "Load time < 2 seconds",
  "Zero critical bugs at launch",
  "Customer satisfaction > 4/5",
];

interface CharterWizardProps {
  onComplete: (data: CharterWizardData) => void;
  loading?: boolean;
}

export default function CharterWizard({ onComplete, loading }: CharterWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CharterWizardData>({
    projectName: "",
    objective: "",
    targetUsers: "",
    features: [],
    successCriteria: [],
    budget: "",
    timelineStart: "",
    timelineEnd: "",
    stakeholders: [{ name: "", role: "" }],
    constraints: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 0) {
      if (!data.projectName.trim()) newErrors.projectName = "Project name is required";
      if (!data.objective.trim()) newErrors.objective = "Objective is required";
      if (data.features.length === 0) newErrors.features = "Add at least one feature";
      if (data.successCriteria.length === 0) newErrors.successCriteria = "Add at least one success criterion";
    }
    if (s === 1) {
      const validStakeholders = data.stakeholders.filter((s) => s.name.trim() && s.role.trim());
      if (validStakeholders.length === 0) newErrors.stakeholders = "Add at least one stakeholder with name and role";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep(step)) {
      if (step === STEPS.length - 1) {
        // Clean stakeholders
        const cleaned = {
          ...data,
          stakeholders: data.stakeholders.filter((s) => s.name.trim() && s.role.trim()),
        };
        onComplete(cleaned);
      } else {
        setStep(step + 1);
      }
    }
  };

  const back = () => setStep(Math.max(0, step - 1));

  const updateStakeholder = (index: number, field: keyof Stakeholder, value: string) => {
    const updated = [...data.stakeholders];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, stakeholders: updated });
  };

  const addStakeholder = () => {
    setData({ ...data, stakeholders: [...data.stakeholders, { name: "", role: "" }] });
  };

  const removeStakeholder = (index: number) => {
    if (data.stakeholders.length > 1) {
      setData({ ...data, stakeholders: data.stakeholders.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-xs mt-1.5 text-muted-foreground font-medium">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 -mt-5 ${i < step ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="glass-card p-6 space-y-5">
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input
                value={data.projectName}
                onChange={(e) => setData({ ...data, projectName: e.target.value })}
                placeholder="e.g. Customer Portal Redesign"
              />
              {errors.projectName && <p className="text-xs text-destructive">{errors.projectName}</p>}
            </div>
            <div className="space-y-2">
              <Label>Objective *</Label>
              <Textarea
                value={data.objective}
                onChange={(e) => setData({ ...data, objective: e.target.value })}
                placeholder="e.g. Build a modern web portal to improve customer self-service capabilities"
              />
              {errors.objective && <p className="text-xs text-destructive">{errors.objective}</p>}
            </div>
            <div className="space-y-2">
              <Label>Target Users</Label>
              <Input
                value={data.targetUsers}
                onChange={(e) => setData({ ...data, targetUsers: e.target.value })}
                placeholder="e.g. Small business owners, freelancers"
              />
            </div>
            <div className="space-y-2">
              <Label>Features / Scope Items *</Label>
              <TagInput
                values={data.features}
                onChange={(features) => setData({ ...data, features })}
                placeholder="e.g. User dashboard — press Enter to add"
              />
              <SuggestionChips
                suggestions={FEATURE_SUGGESTIONS}
                current={data.features}
                onAdd={(v) => setData({ ...data, features: [...data.features, v] })}
              />
              {errors.features && <p className="text-xs text-destructive">{errors.features}</p>}
            </div>
            <div className="space-y-2">
              <Label>Success Criteria *</Label>
              <TagInput
                values={data.successCriteria}
                onChange={(successCriteria) => setData({ ...data, successCriteria })}
                placeholder="e.g. User adoption > 80% — press Enter to add"
              />
              <SuggestionChips
                suggestions={CRITERIA_SUGGESTIONS}
                current={data.successCriteria}
                onAdd={(v) => setData({ ...data, successCriteria: [...data.successCriteria, v] })}
              />
              {errors.successCriteria && <p className="text-xs text-destructive">{errors.successCriteria}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timeline Start</Label>
                <Input
                  type="date"
                  value={data.timelineStart}
                  onChange={(e) => setData({ ...data, timelineStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Timeline End</Label>
                <Input
                  type="date"
                  value={data.timelineEnd}
                  onChange={(e) => setData({ ...data, timelineEnd: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input
                value={data.budget}
                onChange={(e) => setData({ ...data, budget: e.target.value })}
                placeholder="e.g. $50,000 or Not yet determined"
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-3">
              <Label>Stakeholders *</Label>
              {errors.stakeholders && <p className="text-xs text-destructive">{errors.stakeholders}</p>}
              {data.stakeholders.map((s, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    value={s.name}
                    onChange={(e) => updateStakeholder(i, "name", e.target.value)}
                    placeholder="Name (e.g. John Smith)"
                    className="flex-1"
                  />
                  <Input
                    value={s.role}
                    onChange={(e) => updateStakeholder(i, "role", e.target.value)}
                    placeholder="Role (e.g. Project Manager)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStakeholder(i)}
                    disabled={data.stakeholders.length === 1}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addStakeholder}>
                <Plus className="h-4 w-4 mr-1" /> Add Stakeholder
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label>Constraints</Label>
              <TagInput
                values={data.constraints}
                onChange={(constraints) => setData({ ...data, constraints })}
                placeholder="e.g. Must use existing infrastructure — press Enter to add"
              />
              <SuggestionChips
                suggestions={CONSTRAINT_SUGGESTIONS}
                current={data.constraints}
                onAdd={(v) => setData({ ...data, constraints: [...data.constraints, v] })}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Your charter will be generated with {data.features.length} scope items,{" "}
              {data.stakeholders.filter((s) => s.name.trim()).length} stakeholders, and{" "}
              {data.constraints.length} constraints. You can review and edit everything after generation.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button type="button" className="gradient-primary" onClick={next} disabled={loading}>
            {step === STEPS.length - 1 ? (
              loading ? "Generating..." : <>Generate Charter <Check className="h-4 w-4 ml-1" /></>
            ) : (
              <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
