import React from "react";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { BLOCK_OPTIONS } from "./block-options";
import type { BlockType } from "@/types";

interface AddBlockDividerProps {
  onAdd: (type: BlockType, data?: any) => void;
}

const defaultChartData = { 
  title: "Grafik", 
  data: [
    { label: "Oca", "Desktop": 30, "Mobile": 12, "Tablet": 18 }, 
    { label: "Şub", "Desktop": 45, "Mobile": 25, "Tablet": 20 }, 
    { label: "Mar", "Desktop": 85, "Mobile": 58, "Tablet": 27 },
    { label: "Nis", "Desktop": 85, "Mobile": 45, "Tablet": 40 },
    { label: "May", "Desktop": 125, "Mobile": 82, "Tablet": 43 }
  ] 
};

export default function AddBlockDivider({ onAdd }: AddBlockDividerProps) {
  return (
    <div className="group relative flex items-center justify-center h-2 hover:h-6 transition-all duration-200 w-full my-0.5 cursor-pointer">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 w-full">
            <div className="w-full border-t border-[var(--color-border)] opacity-50 relative top-[1px]" />
            <div className="absolute bg-background p-0.5 rounded border border-[var(--color-border)] shadow-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors">
              <Plus size={14} />
            </div>
            <div className="w-full border-t border-[var(--color-border)] opacity-50 relative top-[1px]" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="bottom">
          <DropdownMenuLabel className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">Blok Ekle</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {BLOCK_OPTIONS.map((opt) => {
            if (opt.type === "chart") {
              return (
                <DropdownMenuSub key={opt.type}>
                  <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                    <div className="text-[var(--color-text-secondary)]">{opt.icon}</div>
                    {opt.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => onAdd("chart", { chartType: "line", ...defaultChartData })}>Çizgi (Line)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdd("chart", { chartType: "bar", ...defaultChartData })}>Çubuk (Bar)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdd("chart", { chartType: "area", ...defaultChartData })}>Alan (Area)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdd("chart", { chartType: "pie", ...defaultChartData })}>Pasta (Pie)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdd("chart", { chartType: "donut", ...defaultChartData })}>Halka (Donut)</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              );
            }
            return (
              <DropdownMenuItem 
                key={opt.type} 
                onClick={() => onAdd(opt.type)}
                className="gap-2 cursor-pointer"
              >
                <div className="text-[var(--color-text-secondary)]">{opt.icon}</div>
                {opt.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
