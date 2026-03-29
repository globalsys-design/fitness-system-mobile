"use client";

import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ListHeaderProps {
  /** Search input value */
  searchValue: string;
  /** Search input change handler */
  onSearchChange: (value: string) => void;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Total items count */
  count?: number;
  /** Count label (singular) */
  countLabelSingular?: string;
  /** Count label (plural) */
  countLabelPlural?: string;
  /** Additional actions to render right-aligned */
  actions?: ReactNode;
  /** Custom wrapper className */
  className?: string;
}

/**
 * Standardized list header component with search and count display
 * Used consistently across Clients, Assistants, Assessments lists
 */
export function ListHeader({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  count,
  countLabelSingular = "item",
  countLabelPlural = "itens",
  actions,
  className,
}: ListHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 p-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {/* Count + Actions */}
      {(count !== undefined || actions) && (
        <div className="flex items-center justify-between px-1">
          {count !== undefined && count > 0 && (
            <p className="text-xs text-muted-foreground">
              {count} {count === 1 ? countLabelSingular : countLabelPlural}
            </p>
          )}
          {actions && <div className="ml-auto">{actions}</div>}
        </div>
      )}
    </div>
  );
}

/**
 * Empty state component for lists
 * Shows when no items match the search
 */
interface ListEmptyStateProps {
  /** Icon to display */
  icon: ReactNode;
  /** Main message */
  message: string;
  /** Secondary message (optional) */
  subMessage?: string;
  /** Whether this is a filtered empty state (search returned no results) */
  isFiltered?: boolean;
}

export function ListEmptyState({
  icon,
  message,
  subMessage,
  isFiltered,
}: ListEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="flex items-center justify-center size-16 rounded-full bg-muted">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-64 mx-auto">
        {message}
      </p>
      {subMessage && (
        <p className="text-xs text-muted-foreground text-center max-w-64 mx-auto">
          {subMessage}
        </p>
      )}
    </div>
  );
}
