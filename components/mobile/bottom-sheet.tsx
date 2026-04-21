"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** Título visível no topo do sheet. Se omitido, `srOnlyTitle` é obrigatório. */
  title?: string;
  /** Descrição visível (opcional). */
  description?: string;
  /**
   * Título apenas para leitores de tela, quando o consumer renderiza um
   * cabeçalho próprio dentro de `children`. Necessário para acessibilidade
   * (Radix Dialog exige DialogTitle).
   */
  srOnlyTitle?: string;
  /** Descrição apenas para leitores de tela (opcional). */
  srOnlyDescription?: string;
  className?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  srOnlyTitle,
  srOnlyDescription,
  className,
}: BottomSheetProps) {
  // Fallback de acessibilidade: sempre que possível, usar `title` ou `srOnlyTitle`.
  // Se nada for informado, cai em um default genérico para não quebrar a a11y.
  const a11yTitle = title ?? srOnlyTitle ?? "Conteúdo";
  const a11yDescription = description ?? srOnlyDescription;
  const hideTitle = !title;
  const hideDescription = !description && !!a11yDescription;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-background",
            "max-h-[90dvh]",
            className
          )}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Title — sempre presente para a11y. Oculta visualmente se consumer
              já renderiza cabeçalho próprio em children. */}
          <Drawer.Title
            className={cn(
              hideTitle ? "sr-only" : "px-4 pb-2 text-base font-semibold text-foreground"
            )}
          >
            {a11yTitle}
          </Drawer.Title>

          {a11yDescription && (
            <Drawer.Description
              className={cn(
                hideDescription
                  ? "sr-only"
                  : "px-4 pb-2 text-sm text-muted-foreground"
              )}
            >
              {a11yDescription}
            </Drawer.Description>
          )}

          <div
            className="flex-1 overflow-y-auto px-4 pb-4"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
