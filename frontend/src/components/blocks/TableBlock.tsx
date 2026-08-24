import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { Block, TableBlockData } from "@/types";
import { GripVertical, GripHorizontal, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Heading, Eraser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableBlockProps {
  block: Block;
}

export default function TableBlock({ block }: TableBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as TableBlockData;
  
  // Backwards compatibility for old data
  const oldData = data as any;
  let initialCells = data.cells;
  if (!initialCells) {
    if (oldData.columns && oldData.rows) {
      initialCells = [
        oldData.columns,
        ...oldData.rows.map((r: any) => r.cells)
      ];
    } else {
      // Default 3x3
      initialCells = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
      ];
    }
  }

  const cells = initialCells;
  const hasRowHeader = data.hasRowHeader || false;
  const hasColumnHeader = data.hasColumnHeader || false;

  const [localCells, setLocalCells] = useState<string[][]>(initialCells);

  useEffect(() => {
    setLocalCells(initialCells);
  }, [JSON.stringify(initialCells)]);

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const updateBlock = useMutation({
    mutationFn: (newData: Partial<TableBlockData>) =>
      pagesApi.updateBlock(block.id, { data: { ...data, ...newData } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const updateCell = (rIdx: number, cIdx: number, text: string) => {
    const newCells = localCells.map(row => [...row]);
    newCells[rIdx][cIdx] = text;
    setLocalCells(newCells);
    updateBlock.mutate({ cells: newCells });
  };

  const addRow = (index: number, position: 'above' | 'below') => {
    const newCells = localCells.map(row => [...row]);
    const emptyRow = Array(localCells[0].length).fill("");
    newCells.splice(position === 'above' ? index : index + 1, 0, emptyRow);
    setLocalCells(newCells);
    updateBlock.mutate({ cells: newCells });
  };

  const removeRow = (index: number) => {
    if (localCells.length <= 1) return;
    const newCells = localCells.filter((_, i) => i !== index);
    
    let nextHasRowHeader = hasRowHeader;
    if (index === 0 && hasRowHeader) {
        nextHasRowHeader = false;
    }
    
    setLocalCells(newCells);
    updateBlock.mutate({ cells: newCells, hasRowHeader: nextHasRowHeader });
  };

  const addColumn = (index: number, position: 'left' | 'right') => {
    const newCells = localCells.map(row => {
      const newRow = [...row];
      newRow.splice(position === 'left' ? index : index + 1, 0, "");
      return newRow;
    });
    setLocalCells(newCells);
    updateBlock.mutate({ cells: newCells });
  };

  const removeColumn = (index: number) => {
    if (localCells[0].length <= 1) return;
    const newCells = localCells.map(row => row.filter((_, i) => i !== index));
    
    let nextHasColHeader = hasColumnHeader;
    if (index === 0 && hasColumnHeader) {
        nextHasColHeader = false;
    }
    
    setLocalCells(newCells);
    updateBlock.mutate({ cells: newCells, hasColumnHeader: nextHasColHeader });
  };

  const clearColumn = (index: number) => {
    const newCells = localCells.map(row => {
      const newRow = [...row];
      newRow[index] = "";
      return newRow;
    });
    setLocalCells(newCells);
    updateBlock.mutate({ cells: newCells });
  };

  const clearRow = (index: number) => {
    const newCells = localCells.map(row => [...row]);
    newCells[index] = Array(localCells[0].length).fill("");
    setLocalCells(newCells);
    updateBlock.mutate({ cells: newCells });
  };

  return (
    <div className="py-2 overflow-x-auto notion-scrollbar group/block">
      <table 
        className="min-w-max border-collapse" 
        onMouseLeave={() => { setHoveredRow(null); setHoveredCol(null); }}
      >
        <tbody>
          {/* Column Handles Row */}
          <tr className="h-6">
            <td className="w-6 border-none p-0"></td>
            {localCells[0].map((_, cIdx) => (
              <td key={`col-handle-${cIdx}`} className="border-none p-0 align-bottom">
                <div 
                  className={`w-full flex justify-center items-center h-6 transition-opacity duration-200 ${hoveredCol === cIdx ? 'opacity-100' : 'opacity-0'}`}
                  onMouseEnter={() => setHoveredCol(cIdx)}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="w-6 h-4 flex items-center justify-center rounded hover:bg-[var(--color-bg-hover)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
                          <GripHorizontal size={14} />
                        </div>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {cIdx === 0 && (
                        <>
                          <DropdownMenuItem onClick={() => updateBlock.mutate({ hasColumnHeader: !hasColumnHeader })}>
                            <Heading className="mr-2 h-4 w-4" />
                            {hasColumnHeader ? "Başlık Sütununu Kaldır" : "Başlık Sütunu Yap"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => addColumn(cIdx, 'left')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Sola Sütun Ekle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addColumn(cIdx, 'right')}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Sağa Sütun Ekle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => clearColumn(cIdx)}>
                        <Eraser className="mr-2 h-4 w-4" />
                        İçeriği Temizle
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => removeColumn(cIdx)}
                        disabled={localCells[0].length <= 1}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sütunu Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            ))}
          </tr>

          {/* Data Rows */}
          {localCells.map((row, rIdx) => (
            <tr key={`row-${rIdx}`}>
              {/* Row Handle */}
              <td className="w-6 border-none p-0 align-middle">
                <div 
                  className={`w-full flex justify-center items-center transition-opacity duration-200 ${hoveredRow === rIdx ? 'opacity-100' : 'opacity-0'}`}
                  onMouseEnter={() => setHoveredRow(rIdx)}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="w-4 h-6 flex items-center justify-center rounded hover:bg-[var(--color-bg-hover)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]">
                          <GripVertical size={14} />
                        </div>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {rIdx === 0 && (
                        <>
                          <DropdownMenuItem onClick={() => updateBlock.mutate({ hasRowHeader: !hasRowHeader })}>
                            <Heading className="mr-2 h-4 w-4" />
                            {hasRowHeader ? "Başlık Satırını Kaldır" : "Başlık Satırı Yap"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => addRow(rIdx, 'above')}>
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Üste Satır Ekle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addRow(rIdx, 'below')}>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Alta Satır Ekle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => clearRow(rIdx)}>
                        <Eraser className="mr-2 h-4 w-4" />
                        İçeriği Temizle
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => removeRow(rIdx)}
                        disabled={localCells.length <= 1}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Satırı Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>

              {/* Cells */}
              {row.map((cell, cIdx) => {
                const isRowHeader = rIdx === 0 && hasRowHeader;
                const isColHeader = cIdx === 0 && hasColumnHeader;
                const isHeader = isRowHeader || isColHeader;
                
                return (
                  <td
                    key={`cell-${rIdx}-${cIdx}`}
                    onMouseEnter={() => { setHoveredRow(rIdx); setHoveredCol(cIdx); }}
                    className={`relative p-0 transition-colors border border-[var(--color-border)] min-w-[120px] ${
                      isHeader ? 'bg-black/5 dark:bg-white/5 font-medium' : 'bg-transparent'
                    }`}
                  >
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => {
                        const newCells = localCells.map(r => [...r]);
                        newCells[rIdx][cIdx] = e.target.value;
                        setLocalCells(newCells);
                      }}
                      onBlur={(e) => {
                        if (e.target.value !== cells[rIdx][cIdx]) {
                          updateCell(rIdx, cIdx, e.target.value);
                        }
                      }}
                      className="w-full h-full min-h-[36px] px-3 py-2 bg-transparent outline-none transition-colors"
                      style={{ color: "var(--color-text)" }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
