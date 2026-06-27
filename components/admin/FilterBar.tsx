"use client";

import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, string>;
  onFilterChange: (groupId: string, value: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterBar({
  groups,
  selectedFilters,
  onFilterChange,
  onClearAll,
  className,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(selectedFilters).some((val) => val !== "ALL" && val !== "");

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 items-start sm:items-center", className)}>
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {groups.map((group) => (
          <div key={group.id} className="flex items-center">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase mr-2 hidden sm:inline-block">
              {group.label}
            </span>
            <div className="flex bg-card p-0.5 rounded-lg border border-border">
              {group.options.map((opt) => {
                const isActive = (selectedFilters[group.id] || "ALL") === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onFilterChange(group.id, opt.value)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer",
                      isActive
                        ? "bg-muted text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="text-[10px] font-semibold text-muted-foreground hover:text-rose-400 transition-colors shrink-0 px-2 cursor-pointer"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
}
