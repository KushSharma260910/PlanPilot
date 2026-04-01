import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { calculatePriorityScore } from "@/lib/behavior-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, GripVertical, Clock, Zap, Eye, EyeOff } from "lucide-react";

const STATUSES = ["Backlog", "To-Do", "In Progress", "Review", "Done"] as const;
type TaskStatus = (typeof STATUSES)[number];

const STATUS_CLASSES: Record<TaskStatus, string> = {
  Backlog: "kanban-col-backlog",
  "To-Do": "kanban-col-todo",
  "In Progress": "kanban-col-progress",
  Review: "kanban-col-review",
  Done: "kanban-col-done",
};

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  base_priority: number;
  priority_score: number;
  personality_state: string;
  time_spent: number;
  idle_time: number;
  context_switch_count: number;
  last_active: string;
  charter_id: string;
}

interface Charter {
  id: string;
  project_name: string;
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [charters, setCharters] = useState<Charter[]>([]);
  const [selectedCharter, setSelectedCharter] = useState<string>("");
  const [focusMode, setFocusMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", base_priority: 3 });
  const activeTimerRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCharters = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("charters")
      .select("id, project_name")
      .eq("user_id", user.id);
    if (data && data.length > 0) {
      setCharters(data);
      if (!selectedCharter) setSelectedCharter(data[0].id);
    }
  }, [user, selectedCharter]);

  const fetchTasks = useCallback(async () => {
    if (!user || !selectedCharter) return;
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("charter_id", selectedCharter);
    if (data) setTasks(data as Task[]);
  }, [user, selectedCharter]);

  useEffect(() => { fetchCharters(); }, [fetchCharters]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Idle detection
  useEffect(() => {
    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        // Mark idle after 5 minutes
        if (activeTimerRef.current) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === activeTimerRef.current ? { ...t, idle_time: t.idle_time + 300000 } : t
            )
          );
        }
      }, 300000);
    };

    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    return () => {
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let updates: Partial<Task> = { status: newStatus, last_active: new Date().toISOString() };

    // Track context switches
    if (task.status === "In Progress" && newStatus !== "In Progress") {
      // Stop timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      activeTimerRef.current = null;
      updates.context_switch_count = task.context_switch_count + 1;
    }

    if (newStatus === "In Progress") {
      // If another task was in progress, increment its switch count
      if (activeTimerRef.current && activeTimerRef.current !== taskId) {
        const prevTask = tasks.find((t) => t.id === activeTimerRef.current);
        if (prevTask) {
          await supabase
            .from("tasks")
            .update({ context_switch_count: prevTask.context_switch_count + 1 } as any)
            .eq("id", prevTask.id);
        }
      }

      // Start timer
      activeTimerRef.current = taskId;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, time_spent: t.time_spent + 1000 } : t
          )
        );
      }, 1000);
    }

    // Recalculate priority
    const { priorityScore, personalityState } = calculatePriorityScore(
      task.base_priority,
      updates.last_active || task.last_active,
      updates.context_switch_count ?? task.context_switch_count,
      task.idle_time,
      task.time_spent
    );
    updates.priority_score = priorityScore;
    updates.personality_state = personalityState;

    const { error } = await supabase
      .from("tasks")
      .update(updates as any)
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task");
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } as Task : t))
      );
    }
  };

  const createTask = async () => {
    if (!user || !selectedCharter) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      charter_id: selectedCharter,
      title: newTask.title,
      description: newTask.description,
      base_priority: newTask.base_priority,
      priority_score: newTask.base_priority,
    } as any);

    if (error) {
      toast.error("Failed to create task");
    } else {
      toast.success("Task created!");
      setNewTask({ title: "", description: "", base_priority: 3 });
      setDialogOpen(false);
      fetchTasks();
    }
  };

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const topTasks = focusMode
    ? [...tasks].sort((a, b) => b.priority_score - a.priority_score).slice(0, 2).map((t) => t.id)
    : [];

  if (charters.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold mb-2">No charters yet</h2>
          <p className="text-muted-foreground mb-4">Create a project charter first to start managing tasks.</p>
          <Button onClick={() => window.location.href = "/dashboard/charter"} className="gradient-primary">
            Create Charter
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Kanban Board</h1>
            <Select value={selectedCharter} onValueChange={setSelectedCharter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {charters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.project_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={focusMode ? "default" : "outline"}
              size="sm"
              onClick={() => setFocusMode(!focusMode)}
            >
              {focusMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {focusMode ? "Exit Focus" : "Focus Mode"}
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label>Title</Label>
                    <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Details..." />
                  </div>
                  <div>
                    <Label>Priority (1-5)</Label>
                    <Select value={String(newTask.base_priority)} onValueChange={(v) => setNewTask({ ...newTask, base_priority: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((p) => (
                          <SelectItem key={p} value={String(p)}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createTask} className="w-full gradient-primary">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-5 gap-3 min-h-[60vh]">
          {STATUSES.map((status) => (
            <div key={status} className={`${STATUS_CLASSES[status]} rounded-lg p-3`}>
              <h3 className="text-sm font-semibold mb-3 text-foreground/80">{status}</h3>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === status)
                  .sort((a, b) => b.priority_score - a.priority_score)
                  .map((task) => {
                    const dimmed = focusMode && !topTasks.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        className={`bg-card rounded-lg p-3 shadow-sm border border-border/50 transition-opacity ${
                          dimmed ? "opacity-30 pointer-events-none" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-sm font-medium leading-tight">{task.title}</span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            P{task.base_priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          {formatTime(task.time_spent)}
                          <Zap className="h-3 w-3 ml-1" />
                          {task.personality_state}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {STATUSES.filter((s) => s !== status).map((s) => (
                            <button
                              key={s}
                              onClick={() => moveTask(task.id, s)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              → {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
