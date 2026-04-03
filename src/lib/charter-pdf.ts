import type { StructuredCharter } from "./charter-generator";

export function exportCharterToPdf(charter: StructuredCharter) {
  const w = window.open("", "_blank");
  if (!w) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${charter.title} - Project Charter</title>
  <style>
    @media print { body { margin: 0; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; padding: 48px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; text-align: center; margin-bottom: 4px; color: #1a1a2e; }
    .date { text-align: center; color: #666; font-size: 13px; margin-bottom: 36px; }
    h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 1.5px; color: #3366cc; border-bottom: 2px solid #3366cc; padding-bottom: 4px; margin: 28px 0 12px; }
    ul { padding-left: 20px; margin: 0; }
    li { margin-bottom: 4px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 14px; }
    th { background: #f0f4ff; text-align: left; padding: 8px 12px; border: 1px solid #d0d8e8; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 8px 12px; border: 1px solid #d0d8e8; }
    .impact-high { color: #c0392b; font-weight: 600; }
    .impact-medium { color: #e67e22; font-weight: 600; }
    .impact-low { color: #27ae60; font-weight: 600; }
    .section { page-break-inside: avoid; }
    .budget-box { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px 16px; font-size: 14px; }
    .phase-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .phase-row:last-child { border-bottom: none; }
    .phase-name { font-weight: 600; }
    .phase-dur { color: #666; }
    @media print {
      body { padding: 24px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;margin-bottom:20px;">
    <button onclick="window.print()" style="padding:8px 24px;background:#3366cc;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;">Print / Save as PDF</button>
  </div>

  <h1>${charter.title}</h1>
  <p class="date">Project Charter — Generated ${charter.generatedDate}</p>

  <div class="section">
    <h2>Objectives</h2>
    <ul>${charter.objectives.map((o) => `<li>${o}</li>`).join("")}</ul>
  </div>

  <div class="section">
    <h2>Scope</h2>
    <h3 style="font-size:14px;margin:8px 0 4px;color:#333;">In Scope</h3>
    <ul>${charter.scope.inScope.map((s) => `<li>${s}</li>`).join("")}</ul>
    <h3 style="font-size:14px;margin:12px 0 4px;color:#333;">Out of Scope</h3>
    <ul>${charter.scope.outOfScope.map((s) => `<li>${s}</li>`).join("")}</ul>
  </div>

  <div class="section">
    <h2>Stakeholders</h2>
    <table>
      <thead><tr><th>Name</th><th>Role</th></tr></thead>
      <tbody>${charter.stakeholders.map((s) => `<tr><td>${s.name}</td><td>${s.role}</td></tr>`).join("")}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Constraints</h2>
    <ul>${charter.constraints.map((c) => `<li>${c}</li>`).join("")}</ul>
  </div>

  <div class="section">
    <h2>Risks</h2>
    <table>
      <thead><tr><th>Risk</th><th>Impact</th><th>Mitigation</th></tr></thead>
      <tbody>${charter.risks.map((r) => `<tr><td>${r.description}</td><td class="impact-${r.impact.toLowerCase()}">${r.impact}</td><td>${r.mitigation}</td></tr>`).join("")}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Milestones / Timeline</h2>
    ${charter.milestones.length > 0 ? `
    <table>
      <thead><tr><th>Milestone</th><th>Target Date</th></tr></thead>
      <tbody>${charter.milestones.map((m) => `<tr><td>${m.name}</td><td>${m.targetDate}</td></tr>`).join("")}</tbody>
    </table>` : "<p style='font-size:14px;color:#666;'>No milestones defined</p>"}
    <div style="margin-top:16px;">
      ${charter.timeline.phases.map((p) => `<div class="phase-row"><span class="phase-name">${p.phase}</span><span class="phase-dur">${p.duration}</span></div>`).join("")}
    </div>
  </div>

  <div class="section">
    <h2>Success Criteria</h2>
    <ul>${charter.successCriteria.map((c) => `<li>${c}</li>`).join("")}</ul>
  </div>

  <div class="section">
    <h2>Budget</h2>
    <div class="budget-box">${charter.budget}</div>
  </div>
</body>
</html>`;

  w.document.write(html);
  w.document.close();
}
