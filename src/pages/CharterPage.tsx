import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { generateStructuredCharter, type CharterWizardData, type StructuredCharter } from "@/lib/charter-generator";
import { exportCharterToPdf } from "@/lib/charter-pdf";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import CharterWizard from "@/components/CharterWizard";
import CharterReview from "@/components/CharterReview";

export default function CharterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const charterId = searchParams.get("charterId");

  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"wizard" | "review">(charterId ? "review" : "wizard");
  const [generatedCharter, setGeneratedCharter] = useState<StructuredCharter | null>(null);
  const [currentCharterId, setCurrentCharterId] = useState<string | null>(charterId);

  // Load existing charter for editing
  useEffect(() => {
    if (!charterId || !user) return;
    supabase
      .from("charters")
      .select("*")
      .eq("id", charterId)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.charter_data) {
          setGeneratedCharter(data.charter_data as unknown as StructuredCharter);
          setPhase("review");
        }
      });
  }, [charterId, user]);

  const handleWizardComplete = (data: CharterWizardData) => {
    const charter = generateStructuredCharter(data);
    setGeneratedCharter(charter);
    setPhase("review");
  };

  const handleSave = async (charter: StructuredCharter) => {
    if (!user) return;
    setLoading(true);

    if (currentCharterId) {
      const { error } = await supabase
        .from("charters")
        .update({ charter_data: charter as any, project_name: charter.title })
        .eq("id", currentCharterId);
      if (error) toast.error("Failed to update: " + error.message);
      else toast.success("Charter updated!");
    } else {
      const insertData: any = {
        user_id: user.id,
        project_name: charter.title,
        charter_data: charter as any,
      };
      if (projectId) insertData.project_id = projectId;

      const { data, error } = await supabase.from("charters").insert(insertData).select("id").single();
      if (error) toast.error("Failed to save: " + error.message);
      else {
        toast.success("Charter saved!");
        setCurrentCharterId(data.id);
      }
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="animate-slide-in">
        {phase === "wizard" && (
          <>
            <h1 className="text-2xl font-bold mb-6">Create Project Charter</h1>
            <CharterWizard onComplete={handleWizardComplete} loading={loading} />
          </>
        )}
        {phase === "review" && generatedCharter && (
          <CharterReview
            charter={generatedCharter}
            onSave={handleSave}
            onExportPdf={exportCharterToPdf}
            onBack={() => setPhase("wizard")}
            saving={loading}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
