import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, BarChart3, Focus, FileText, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="gradient-primary p-2 rounded-lg">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">PlanPilot</span>
        </div>
        <Link to="/auth">
          <Button className="gradient-primary">Get Started</Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-4 max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
          Ship projects faster with
          <span className="gradient-primary bg-clip-text text-transparent"> behavioral intelligence</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          PlanPilot combines project charters, kanban boards, and real-time behavior tracking
          to help you stay productive without burning out.
        </p>
        <Link to="/auth">
          <Button size="lg" className="gradient-primary text-lg px-8">
            Start Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: FileText, title: "Project Charters", desc: "Generate structured charters from simple inputs. Define scope, timeline, risks, and success criteria instantly." },
            { icon: Focus, title: "Smart Kanban + Focus", desc: "Drag tasks across 5 columns. Focus mode surfaces only your highest-priority work." },
            { icon: BarChart3, title: "Burnout Analytics", desc: "Track idle time, context switches, and workload. Get a real-time burnout score with actionable insights." },
          ].map((f, i) => (
            <div key={i} className="glass-card p-6 hover:shadow-md transition-shadow">
              <div className="gradient-accent w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
