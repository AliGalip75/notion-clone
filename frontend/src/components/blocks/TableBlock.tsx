import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { Block, TableBlockData } from "@/types";
import { Plus, X } from "lucide-react";

interface TableBlockProps {
  block: Block;
}

export default function TableBlock({ block }: TableBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as TableBlockData;
  const columns = data.columns || ["Kolon 1", "Kolon 2"];
  const rows = data.rows || [{ cells: ["", ""] }];

  const updateBlock = useMutation({
    mutationFn: (newData: Partial<TableBlockData>) =>
      pagesApi.updateBlock(block.id, { data: { ...data, ...newData } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const updateColumn = (colIndex: number, text: string) => {
    const newCols = [...columns];
    newCols[colIndex] = text;
    updateBlock.mutate({ columns: newCols });
  };

  const updateCell = (rowIndex: number, colIndex: number, text: string) => {
    const newRows = [...rows];
    newRows[rowIndex].cells[colIndex] = text;
    updateBlock.mutate({ rows: newRows });
  };

  const addRow = () => {
    const newRows = [...rows, { cells: Array(columns.length).fill("") }];
    updateBlock.mutate({ rows: newRows });
  };

  const addColumn = () => {
    const newCols = [...columns, `Kolon ${columns.length + 1}`];
    const newRows = rows.map((r) => ({ ...r, cells: [...r.cells, ""] }));
    updateBlock.mutate({ columns: newCols, rows: newRows });
  };

  return (
    <div className="py-2 overflow-x-auto notion-scrollbar group">
      <table className="min-w-full border-collapse" style={{ borderColor: "var(--color-border)" }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="p-0 font-medium text-left bg-[var(--color-bg-secondary)] relative"
                style={{ border: "1px solid var(--color-border)", minWidth: "120px" }}
              >
                <input
                  type="text"
                  defaultValue={col}
                  onBlur={(e) => updateColumn(i, e.target.value)}
                  className="w-full h-full px-3 py-2 bg-transparent outline-none"
                  style={{ color: "var(--color-text)" }}
                />
              </th>
            ))}
            <th className="w-8 p-0 bg-[var(--color-bg-secondary)]" style={{ border: "1px solid var(--color-border)" }}>
              <button
                onClick={addColumn}
                className="w-full h-full flex items-center justify-center text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors opacity-0 group-hover:opacity-100"
              >
                <Plus size={14} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.cells.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className="p-0 relative"
                  style={{ border: "1px solid var(--color-border)" }}
                >
                  <input
                    type="text"
                    defaultValue={cell}
                    onBlur={(e) => updateCell(rIdx, cIdx, e.target.value)}
                    className="w-full h-full px-3 py-2 bg-transparent outline-none"
                    style={{ color: "var(--color-text)" }}
                  />
                </td>
              ))}
              <td className="w-8 p-0 relative" style={{ border: "1px solid var(--color-border)" }}>
                <button
                  onClick={() => {
                    if (rows.length > 1) {
                      const newRows = rows.filter((_, i) => i !== rIdx);
                      updateBlock.mutate({ rows: newRows });
                    }
                  }}
                  className="w-full h-full flex items-center justify-center text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={columns.length + 1} className="p-0" style={{ borderTop: "none" }}>
              <button
                onClick={addRow}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors opacity-0 group-hover:opacity-100"
              >
                <Plus size={14} />
                Yeni Satır
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
