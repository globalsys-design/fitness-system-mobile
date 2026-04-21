"use client";

/**
 * MultiSelectSheet — Multi-select mobile-first via BottomSheet.
 *
 * Por que BottomSheet em vez de Popover/Dropdown: no mobile, o teclado virtual
 * empurra o layout e corta listas em popovers. O BottomSheet (vaul) é resiliente
 * a isso e oferece gesto de arrastar para fechar, padrão esperado em PWAs.
 *
 * O trigger parece um input (min-h-14, rounded-lg, border) mas renderiza Badges
 * das opções selecionadas — o affordance é imediato.
 */

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectSheetProps {
  options: readonly MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  sheetTitle?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectSheet({
  options,
  value,
  onChange,
  placeholder = "Selecione",
  sheetTitle = "Selecionar",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado",
  id,
  className,
  disabled,
}: MultiSelectSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Filtro client-side — listas pequenas não justificam debounce.
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Mapa label para o trigger renderizar tags mesmo se value tiver itens
  // que não estão em options (robustez contra dados legados).
  const labelOf = React.useCallback(
    (v: string) => options.find((o) => o.value === v)?.label ?? v,
    [options]
  );

  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  const remove = (v: string) => {
    onChange(value.filter((x) => x !== v));
  };

  return (
    <>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "w-full min-h-14 flex items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-left transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-input/30",
          className
        )}
      >
        <div className="flex-1 flex flex-wrap gap-1.5 min-w-0">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-medium"
              >
                {labelOf(v)}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remover ${labelOf(v)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(v);
                  }}
                  className="inline-flex items-center justify-center size-4 rounded-sm hover:bg-muted-foreground/20 cursor-pointer"
                >
                  <X className="size-3" />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <BottomSheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery("");
        }}
        title={sheetTitle}
      >
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              autoFocus={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>

          <div className="flex flex-col">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {emptyMessage}
              </p>
            ) : (
              filtered.map((o) => {
                const selected = value.includes(o.value);
                return (
                  <Label
                    key={o.value}
                    htmlFor={`mss-${id ?? "opt"}-${o.value}`}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 min-h-12 rounded-lg cursor-pointer transition-colors",
                      selected ? "bg-primary/10" : "hover:bg-muted/60"
                    )}
                  >
                    <span className="text-sm text-foreground">{o.label}</span>
                    {/* checkbox nativo invisível para a11y; o Check visual indica estado */}
                    <input
                      id={`mss-${id ?? "opt"}-${o.value}`}
                      type="checkbox"
                      className="sr-only"
                      checked={selected}
                      onChange={() => toggle(o.value)}
                    />
                    <span
                      className={cn(
                        "flex items-center justify-center size-5 rounded border shrink-0",
                        selected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input"
                      )}
                      aria-hidden
                    >
                      {selected && <Check className="size-3.5" />}
                    </span>
                  </Label>
                );
              })
            )}
          </div>

          {value.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar tudo
              </button>
              <span className="text-xs text-muted-foreground">
                {value.length} selecionado{value.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
