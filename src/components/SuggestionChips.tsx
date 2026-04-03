import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface SuggestionChipsProps {
  suggestions: string[];
  current: string[];
  onAdd: (value: string) => void;
}

export default function SuggestionChips({ suggestions, current, onAdd }: SuggestionChipsProps) {
  const available = suggestions.filter((s) => !current.includes(s));
  if (available.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <span className="text-xs text-muted-foreground self-center mr-1">Suggestions:</span>
      {available.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onAdd(s)}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus className="h-3 w-3" />
          {s}
        </button>
      ))}
    </div>
  );
}
