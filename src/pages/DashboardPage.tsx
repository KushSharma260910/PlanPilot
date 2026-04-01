import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { calculateBurnoutScore } from "@/lib/behavior-engine";
import DashboardLayout from "@/components/DashboardLayout";
import CharterDisplay from "@/components/CharterDisplay";
import BurnoutIndicator from "@/components/BurnoutIndicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [charters, setCharters] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("charters").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setCharters(data);
    });
    supabase.from("tasks").select("*").eq("user_id", user.id).then(({ data }) => {
      if (data) setTasks(data);
    });
  }, [user]);

  const totalIdle = tasks.reduce((s, t) => s + (t.idle_time || 0), 0);
  const totalSwitches = tasks.reduce((s, t) => s + (t.context_switch_count || 0), 0);
  const activeCount = tasks.filter((t) => t.status === "In Progress").length;

  const sprintTasks = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.status !== "Done")
        .sort((a, b) => b.priority_score - a.priority_score)
        .slice(0, 5),
    [tasks]
  );

  const latestCharter = charters[0];

  return (
    <DashboardLayout>
      <div className="animate-slide-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/dashboard/charter">
              <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" /> New Charter</Button>
            </Link>
            <Link to="/dashboard/tasks">
              <Button className="gradient-primary" size="sm"><ArrowRight className="h-4 w-4 mr-1" /> Kanban Board</Button>
            </Link>
          </div>
        </div>

        {/* Burnout + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BurnoutIndicator idleTime={totalIdle} contextSwitchCount={totalSwitches} activeTaskCount={activeCount} />

          <div className="glass-card p-4">
            <span className="text-sm font-medium text-muted-foreground">Total Tasks</span>
            <div className="text-3xl font-bold mt-1">{tasks.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{tasks.filter((t) => t.status === "Done").length} Done</Badge>
              <Badge variant="outline">{activeCount} Active</Badge>
            </div>
          </div>

          <div className="glass-card p-4">
            <span className="text-sm font-medium text-muted-foreground">Projects</span>
            <div className="text-3xl font-bold mt-1">{charters.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {charters.length === 0 ? "Create your first charter to begin" : `Latest: ${latestCharter?.project_name}`}
            </p>
          </div>
        </div>

        {/* Auto Sprint */}
        {sprintTasks.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Auto Sprint — Top Priority Tasks
            </h2>
            <div className="space-y-2">
              {sprintTasks.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-secondary/50">
                  <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium">{t.title}</span>
                  <Badge variant="outline" className="text-xs">P{t.base_priority}</Badge>
                  <span className="text-xs font-mono text-primary">{Number(t.priority_score).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Charter */}
        {latestCharter && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Latest Charter
            </h2>
            <CharterDisplay charterData={latestCharter.charter_data} projectName={latestCharter.project_name} />
          </div>
        )}

        {charters.length === 0 && (
          <div className="text-center py-16 glass-card">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Welcome to PlanPilot</h2>
            <p className="text-muted-foreground mb-4">Start by creating a project charter to define your project scope.</p>
            <Link to="/dashboard/charter">
              <Button className="gradient-primary">
                <Plus className="h-4 w-4 mr-1" /> Create First Charter
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
