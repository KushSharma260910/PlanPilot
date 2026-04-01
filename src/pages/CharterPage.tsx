import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { generateCharter, type CharterInput } from "@/lib/charter-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function CharterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CharterInput>({
    projectName: "",
    objective: "",
    targetUsers: "",
    features: "",
    constraints: "",
    successCriteria: "",
  });

  const update = (key: keyof CharterInput, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const charterData = generateCharter(form);

    const { error } = await supabase.from("charters").insert({
      user_id: user.id,
      project_name: form.projectName,
      charter_data: charterData as any,
    });

    if (error) {
      toast.error("Failed to save charter: " + error.message);
    } else {
      toast.success("Charter created!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-slide-in">
        <h1 className="text-2xl font-bold mb-6">Create Project Charter</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input value={form.projectName} onChange={(e) => update("projectName", e.target.value)} required placeholder="My Project" />
          </div>
          <div className="space-y-2">
            <Label>Objective</Label>
            <Textarea value={form.objective} onChange={(e) => update("objective", e.target.value)} required placeholder="What is the goal of this project?" />
          </div>
          <div className="space-y-2">
            <Label>Target Users</Label>
            <Input value={form.targetUsers} onChange={(e) => update("targetUsers", e.target.value)} required placeholder="Who will use this?" />
          </div>
          <div className="space-y-2">
            <Label>Features (comma-separated)</Label>
            <Textarea value={form.features} onChange={(e) => update("features", e.target.value)} required placeholder="Auth, Dashboard, Reports, Notifications" />
          </div>
          <div className="space-y-2">
            <Label>Constraints</Label>
            <Textarea value={form.constraints} onChange={(e) => update("constraints", e.target.value)} placeholder="Budget, timeline, tech limitations..." />
          </div>
          <div className="space-y-2">
            <Label>Success Criteria (comma-separated)</Label>
            <Textarea value={form.successCriteria} onChange={(e) => update("successCriteria", e.target.value)} required placeholder="User adoption > 80%, Load time < 2s" />
          </div>

          <Button type="submit" className="w-full gradient-primary" disabled={loading}>
            {loading ? "Generating..." : "Generate Charter"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
