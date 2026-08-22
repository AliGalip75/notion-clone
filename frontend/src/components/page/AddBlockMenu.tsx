import { useState, useRef, useEffect } from "react";
import { Plus, Type, Heading, CheckSquare, ListOrdered, Percent, BarChart, Table } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import type { BlockType } from "@/types";

interface AddBlockMenuProps {
  pageId: number;
}

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Metin", icon: <Type size={16} /> },
  { type: "heading", label: "Başlık", icon: <Heading size={16} /> },
  { type: "checklist", label: "Yapılacaklar", icon: <CheckSquare size={16} /> },
  { type: "progress", label: "İlerleme", icon: <Percent size={16} /> },
  { type: "number", label: "Sayı", icon: <ListOrdered size={16} /> },
  { type: "chart", label: "Grafik", icon: <BarChart size={16} /> },
  { type: "table", label: "Tablo", icon: <Table size={16} /> },
];

export default function AddBlockMenu({ pageId }: AddBlockMenuProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const addBlock = useMutation({
    mutationFn: (type: BlockType) => {
      let defaultData: Record<string, unknown> = {};
      switch (type) {
        case "text": defaultData = { content: "" }; break;
        case "heading": defaultData = { content: "", level: 1 }; break;
        case "checklist": defaultData = { items: [{ text: "", completed: false }] }; break;
        case "progress": defaultData = { title: "İlerleme", value: 0, max: 100 }; break;
        case "number": defaultData = { title: "Sayı", value: 0, unit: "" }; break;
        case "chart": defaultData = { chartType: "bar", title: "Grafik", data: [{ label: "Öğe 1", value: 10 }] }; break;
        case "table": defaultData = { columns: ["Kolon 1", "Kolon 2"], rows: [{ cells: ["", ""] }] }; break;
      }
      return pagesApi.createBlock(pageId, { type, data: defaultData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      setIsOpen(false);
    },
  });

  return (
    <div className="relative mt-4 group" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors opacity-50 group-hover:opacity-100"
      >
        <Plus size={20} />
        <span className="text-sm font-medium">Yeni Blok Ekle</span>
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-1 w-56 rounded-md shadow-lg py-1 z-10 animate-scale-in"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-popup)" }}
        >
          <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
            Temel Bloklar
          </div>
          {BLOCK_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => addBlock.mutate(opt.type)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <div className="text-[var(--color-text-secondary)]">{opt.icon}</div>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
