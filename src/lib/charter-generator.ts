export interface CharterInput {
  projectName: string;
  objective: string;
  targetUsers: string;
  features: string;
  constraints: string;
  successCriteria: string;
}

export interface CharterData {
  title: string;
  objective: string;
  scope: string[];
  outOfScope: string[];
  deliverables: string[];
  timeline: { phase: string; description: string; duration: string }[];
  stakeholders: { role: string; description: string }[];
  risks: { risk: string; mitigation: string }[];
  successCriteria: string[];
}

export function generateCharter(input: CharterInput): CharterData {
  const features = input.features
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  return {
    title: input.projectName,
    objective: input.objective,
    scope: features.map((f) => `Implement ${f}`),
    outOfScope: [
      "Third-party integrations not specified in scope",
      "Features beyond the defined requirements",
      "Legacy system migration",
    ],
    deliverables: features.map((f) => `Working ${f} module`),
    timeline: [
      { phase: "Planning", description: "Requirements gathering and architecture design", duration: "1-2 weeks" },
      { phase: "Development", description: "Core feature implementation and iteration", duration: "4-6 weeks" },
      { phase: "Testing", description: "QA, user acceptance testing, and bug fixes", duration: "1-2 weeks" },
      { phase: "Deployment", description: "Production release and monitoring", duration: "1 week" },
    ],
    stakeholders: [
      { role: "Primary User", description: input.targetUsers },
      { role: "System", description: "Automated processes and integrations" },
    ],
    risks: [
      { risk: "Time overrun", mitigation: "Regular progress reviews and scope management" },
      { risk: "Resource constraints", mitigation: "Prioritize critical features and plan for contingency" },
      { risk: "Scope creep", mitigation: "Strict change management process" },
    ],
    successCriteria: input.successCriteria
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
  };
}
