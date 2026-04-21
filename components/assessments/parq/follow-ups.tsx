"use client";

/**
 * Follow-ups do PAR-Q+: Checkboxes e Textarea.
 *
 * Ambos seguem o padrão Figma:
 *  - Título "Como você respondeu SIM à pergunta acima"
 *  - Hint em text-muted-foreground (ex: "Selecione TODAS as opções que se aplicam.")
 *  - Conteúdo específico abaixo
 */

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FollowUpCheckboxesProps {
  label: string;
  hint?: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  idBase: string;
}

export function FollowUpCheckboxes({
  label,
  hint,
  options,
  selected,
  onChange,
  idBase,
}: FollowUpCheckboxesProps) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((o) => o !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hint}
          </p>
        )}
      </div>
      <div className="space-y-2" role="group" aria-label={label}>
        {options.map((opt, i) => {
          const checked = selected.includes(opt);
          const id = `${idBase}-opt-${i}`;
          return (
            <div
              key={opt}
              className={cn(
                "flex items-center gap-3 min-h-11 rounded-lg px-3 py-2",
                "border transition-colors cursor-pointer",
                checked
                  ? "bg-primary/5 border-primary/30"
                  : "bg-background border-border hover:border-primary/30"
              )}
              onClick={() => toggle(opt)}
            >
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => toggle(opt)}
                aria-label={opt}
              />
              <Label
                htmlFor={id}
                className="text-sm text-foreground cursor-pointer flex-1"
              >
                {opt}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface FollowUpTextareaProps {
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
  idBase: string;
}

export function FollowUpTextarea({
  label,
  hint,
  placeholder = "Liste aqui",
  value,
  onChange,
  idBase,
}: FollowUpTextareaProps) {
  const id = `${idBase}-ta`;
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {hint && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hint}
          </p>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        enterKeyHint="enter"
        className={cn(
          "w-full rounded-lg border border-border bg-background",
          "px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70",
          "resize-none",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "transition-colors"
        )}
      />
    </div>
  );
}
