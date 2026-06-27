"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TableSkeleton, EmptyState } from "./States";

export interface ColumnDef<T> {
  header: ReactNode;
  accessorKey?: keyof T | string;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  emptyIcon,
  emptyTitle = "Tidak ada data",
  emptyDescription,
  pagination,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("admin-card overflow-hidden", className)}>
        <TableSkeleton rows={5} cols={columns.length} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("admin-card overflow-hidden", className)}>
        <EmptyState
          icon={emptyIcon || <div className="h-10 w-10 rounded-full bg-muted" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className={cn("admin-card overflow-hidden flex flex-col", className)}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-card">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "py-3.5 px-4 font-semibold text-muted-foreground whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "group transition-colors",
                  onRowClick ? "cursor-pointer hover:bg-muted" : "hover:bg-muted"
                )}
              >
                {columns.map((col, i) => (
                  <td key={i} className={cn("py-3 px-4", col.className)}>
                    {col.cell
                      ? col.cell(item)
                      : col.accessorKey
                      ? (item as any)[col.accessorKey]
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card mt-auto">
          <div className="text-[10px] text-muted-foreground">
            Menampilkan halaman <span className="font-semibold text-foreground">{pagination.page}</span> dari{" "}
            <span className="font-semibold text-foreground">{pagination.totalPages}</span>
            {" • "}Total {pagination.totalItems} item
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
