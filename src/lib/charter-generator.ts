export interface Stakeholder {
  name: string;
  role: string;
}

export interface Risk {
  description: string;
  impact: "Low" | "Medium" | "High";
  mitigation: string;
}

export interface Milestone {
  name: string;
  targetDate: string;
}

export interface CharterWizardData {
  // Step 1: Project Info
  projectName: string;
  objective: string;
  targetUsers: string;
  features: string[];
  successCriteria: string[];
  budget: string;
  timelineStart: string;
  timelineEnd: string;
  // Step 2: Stakeholders
  stakeholders: Stakeholder[];
  // Step 3: Constraints
  constraints: string[];
}

export interface StructuredCharter {
  title: string;
  generatedDate: string;
  objectives: string[];
  scope: {
    inScope: string[];
    outOfScope: string[];
  };
  stakeholders: Stakeholder[];
  constraints: string[];
  risks: Risk[];
  milestones: Milestone[];
  successCriteria: string[];
  budget: string;
  timeline: {
    start: string;
    end: string;
    phases: { phase: string; description: string; duration: string }[];
  };
}

export function generateStructuredCharter(input: CharterWizardData): StructuredCharter {
  const objectives = [input.objective];
  if (input.targetUsers) {
    objectives.push(`Serve ${input.targetUsers} as primary users`);
  }

  const inScope = input.features.map((f) => `Implement ${f}`);
  const outOfScope = [
    "Third-party integrations not specified in scope",
    "Features beyond the defined requirements",
    "Legacy system migration",
  ];

  // Generate risks based on constraints
  const risks: Risk[] = [
    { description: "Schedule overrun", impact: "High", mitigation: "Regular progress reviews and agile iterations" },
    { description: "Resource constraints", impact: "Medium", mitigation: "Prioritize critical features; plan contingency resources" },
    { description: "Scope creep", impact: "High", mitigation: "Strict change management process with stakeholder sign-off" },
  ];

  if (input.constraints.some((c) => c.toLowerCase().includes("budget"))) {
    risks.push({ description: "Budget overrun", impact: "High", mitigation: "Track spending weekly; define cost caps per phase" });
  }
  if (input.constraints.some((c) => c.toLowerCase().includes("regulatory") || c.toLowerCase().includes("compliance"))) {
    risks.push({ description: "Regulatory non-compliance", impact: "High", mitigation: "Engage compliance team early; schedule audits" });
  }
  if (input.constraints.some((c) => c.toLowerCase().includes("technical") || c.toLowerCase().includes("technology"))) {
    risks.push({ description: "Technical feasibility issues", impact: "Medium", mitigation: "Conduct early proof-of-concept; identify fallback solutions" });
  }

  // Generate milestones from timeline
  const milestones: Milestone[] = [];
  if (input.timelineStart && input.timelineEnd) {
    const start = new Date(input.timelineStart);
    const end = new Date(input.timelineEnd);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const phases = [
      { name: "Planning Complete", pct: 0.15 },
      { name: "Development Midpoint", pct: 0.5 },
      { name: "Testing Start", pct: 0.75 },
      { name: "Project Delivery", pct: 1.0 },
    ];
    phases.forEach(({ name, pct }) => {
      const d = new Date(start.getTime() + totalDays * pct * 24 * 60 * 60 * 1000);
      milestones.push({ name, targetDate: d.toISOString().split("T")[0] });
    });
  }

  // Generate timeline phases
  const phases = [
    { phase: "Planning", description: "Requirements gathering and architecture design", duration: "15% of timeline" },
    { phase: "Development", description: "Core feature implementation and iteration", duration: "50% of timeline" },
    { phase: "Testing", description: "QA, user acceptance testing, and bug fixes", duration: "25% of timeline" },
    { phase: "Deployment", description: "Production release and monitoring", duration: "10% of timeline" },
  ];

  return {
    title: input.projectName,
    generatedDate: new Date().toISOString().split("T")[0],
    objectives,
    scope: { inScope, outOfScope },
    stakeholders: input.stakeholders.length > 0 ? input.stakeholders : [{ name: "TBD", role: "Project Lead" }],
    constraints: input.constraints,
    risks,
    milestones,
    successCriteria: input.successCriteria,
    budget: input.budget || "Not specified",
    timeline: {
      start: input.timelineStart,
      end: input.timelineEnd,
      phases,
    },
  };
}
