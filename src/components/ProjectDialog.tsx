import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface ProjectDialogProps {
  onCreated: () => void;
}

export default function ProjectDialog({ onCreated }: ProjectDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: name.trim(),
      description: description.trim(),
    } as any);

    if (error) {
      toast.error("Failed to create project: " + error.message);
    } else {
      toast.success("Project created!");
      setName("");
      setDescription("");
      setOpen(false);
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary" size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Project Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Customer Portal v2" />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the project..." />
          </div>
          <Button onClick={handleCreate} className="w-full gradient-primary" disabled={loading || !name.trim()}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
