"use client";

/**
 * Follow-ups do PAR-Q+: Checkboxes e Textarea.
 *
 * FollowUpCheckboxes agora delega para <MultiChoiceChips /> (componente
 * único do design system para multi-choice). API antiga preservada.
 */

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { MultiChoiceChips } from "@/components/ui/multi-choice-chips";

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
}: FollowUpCheckboxesProps) {
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
      <MultiChoiceChips
        options={options.map((o) => ({ value: o, label: o }))}
        values={selected}
        onChange={onChange}
        ariaLabel={label}
        helperText={null}
      />
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
