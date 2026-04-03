import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { calculateBurnoutScore } from "@/lib/behavior-engine";
import DashboardLayout from "@/components/DashboardLayout";
import CharterDisplay from "@/components/CharterDisplay";
import BurnoutIndicator from "@/components/BurnoutIndicator";
import ProjectDialog from "@/components/ProjectDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowRight, FolderOpen } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [charters, setCharters] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchProjects = async () => {
    if (!user) return;
    const { data } = await supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) {
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) setSelectedProjectId(data[0].id);
    }
  };

  useEffect(() => { fetchProjects(); }, [user]);

  useEffect(() => {
    if (!user) return;
    // Fetch charters - filter by project if selected
    let charterQuery = supabase.from("charters").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (selectedProjectId) charterQuery = charterQuery.eq("project_id", selectedProjectId);
    charterQuery.then(({ data }) => { if (data) setCharters(data); });

    // Fetch tasks
    let taskQuery = supabase.from("tasks").select("*").eq("user_id", user.id);
    if (selectedProjectId) taskQuery = taskQuery.eq("project_id", selectedProjectId);
    taskQuery.then(({ data }) => { if (data) setTasks(data); });
  }, [user, selectedProjectId]);

  const totalIdle = tasks.reduce((s, t) => s + (t.idle_time || 0), 0);
  const totalSwitches = tasks.reduce((s, t) => s + (t.context_switch_count || 0), 0);
  const activeCount = tasks.filter((t) => t.status === "In Progress").length;

  const sprintTasks = useMemo(
    () => [...tasks].filter((t) => t.status !== "Done").sort((a, b) => b.priority_score - a.priority_score).slice(0, 5),
    [tasks]
  );

  const latestCharter = charters[0];

  return (
    <DashboardLayout>
      <div className="animate-slide-in space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {projects.length > 0 && (
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex gap-2">
            <ProjectDialog onCreated={fetchProjects} />
            <Link to={`/dashboard/charter${selectedProjectId ? `?projectId=${selectedProjectId}` : ""}`}>
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
            <div className="text-3xl font-bold mt-1">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {projects.length === 0 ? "Create your first project to begin" : `${charters.length} charter(s) in current project`}
            </p>
          </div>
        </div>

        {/* Auto Sprint */}
        {sprintTasks.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Auto Sprint — Top Priority Tasks</h2>
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Latest Charter</h2>
              <Link to={`/dashboard/charter?charterId=${latestCharter.id}`}>
                <Button variant="ghost" size="sm">Edit</Button>
              </Link>
            </div>
            <CharterDisplay charterData={latestCharter.charter_data} projectName={latestCharter.project_name} />
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center py-16 glass-card">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Welcome to PlanPilot</h2>
            <p className="text-muted-foreground mb-4">Start by creating a project, then generate a charter to define your scope.</p>
            <ProjectDialog onCreated={fetchProjects} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
