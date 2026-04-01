import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { calculateBurnoutScore } from "@/lib/behavior-engine";
import DashboardLayout from "@/components/DashboardLayout";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Backlog: "hsl(220, 15%, 70%)",
  "To-Do": "hsl(220, 80%, 60%)",
  "In Progress": "hsl(38, 92%, 50%)",
  Review: "hsl(280, 60%, 55%)",
  Done: "hsl(160, 60%, 45%)",
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setTasks(data);
      });
  }, [user]);

  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {
      Backlog: 0,
      "To-Do": 0,
      "In Progress": 0,
      Review: 0,
      Done: 0,
    };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [tasks]);

  const burnoutScore = useMemo(() => {
    const totalIdle = tasks.reduce((s, t) => s + (t.idle_time || 0), 0);
    const totalSwitches = tasks.reduce((s, t) => s + (t.context_switch_count || 0), 0);
    const active = tasks.filter((t) => t.status === "In Progress").length;
    return calculateBurnoutScore(totalIdle, totalSwitches, active);
  }, [tasks]);

  const burnoutColor =
    burnoutScore < 40 ? "hsl(160, 60%, 45%)" : burnoutScore < 70 ? "hsl(38, 92%, 50%)" : "hsl(0, 72%, 51%)";

  // Simulated productivity data (last 7 days)
  const productivityData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("en", { weekday: "short" });
      const completed = tasks.filter(
        (t) => t.status === "Done" && new Date(t.updated_at).toDateString() === d.toDateString()
      ).length;
      const inProgress = tasks.filter(
        (t) => t.status === "In Progress" && new Date(t.created_at) <= d
      ).length;
      days.push({ day: dayStr, completed, inProgress });
    }
    return days;
  }, [tasks]);

  return (
    <DashboardLayout>
      <div className="animate-slide-in space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Burnout Gauge */}
          <div className="glass-card p-6 text-center">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Burnout Score</h3>
            <div className="text-5xl font-bold mb-2" style={{ color: burnoutColor }}>{burnoutScore}</div>
            <div className="h-3 rounded-full bg-muted overflow-hidden max-w-xs mx-auto">
              <div className="h-full rounded-full transition-all" style={{ width: `${burnoutScore}%`, backgroundColor: burnoutColor }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {burnoutScore < 40 ? "You're in good shape!" : burnoutScore < 70 ? "Consider taking a break." : "High risk—slow down!"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <span className="font-semibold">{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-semibold text-success">{tasks.filter((t) => t.status === "Done").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="font-semibold text-warning">{tasks.filter((t) => t.status === "In Progress").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Context Switches</span>
                <span className="font-semibold">{tasks.reduce((s, t) => s + (t.context_switch_count || 0), 0)}</span>
              </div>
            </div>
          </div>

          {/* Auto Sprint */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Auto Sprint (Top 5)</h3>
            <div className="space-y-2">
              {[...tasks]
                .filter((t) => t.status !== "Done")
                .sort((a, b) => b.priority_score - a.priority_score)
                .slice(0, 5)
                .map((t, i) => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                    <span className="flex-1 truncate">{t.title}</span>
                    <span className="text-xs font-mono text-primary">{t.priority_score.toFixed(1)}</span>
                  </div>
                ))}
              {tasks.filter((t) => t.status !== "Done").length === 0 && (
                <p className="text-sm text-muted-foreground">No active tasks</p>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Productivity Chart */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Productivity vs Load (7 days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="hsl(160, 60%, 45%)" strokeWidth={2} name="Completed" />
                <Line type="monotone" dataKey="inProgress" stroke="hsl(38, 92%, 50%)" strokeWidth={2} name="In Progress" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Chart */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Work Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
