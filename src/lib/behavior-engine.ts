export function calculatePriorityScore(
  basePriority: number,
  lastActive: string | null,
  contextSwitchCount: number,
  idleTime: number,
  timeSpent: number
): { priorityScore: number; personalityState: string } {
  const timeSinceLastActive = lastActive
    ? Date.now() - new Date(lastActive).getTime()
    : 0;

  let priorityScore =
    basePriority +
    Math.log(timeSinceLastActive / 1000 / 60 + 1) -
    contextSwitchCount * 0.5;

  // Determine personality state
  const idleMinutes = idleTime / 1000 / 60;
  let personalityState = "Calm";

  if (contextSwitchCount > 5) {
    personalityState = "Impatient";
    priorityScore -= 1;
  } else if (idleMinutes > 30 && basePriority >= 4) {
    personalityState = "Critical";
    priorityScore += 2;
  }

  return {
    priorityScore: Math.max(0, Math.round(priorityScore * 100) / 100),
    personalityState,
  };
}

export function calculateBurnoutScore(
  idleTime: number,
  contextSwitchCount: number,
  activeTaskCount: number
): number {
  const raw = idleTime / 1000 / 60 + contextSwitchCount + activeTaskCount;
  return Math.min(100, Math.round(raw));
}
